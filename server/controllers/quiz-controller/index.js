const { default: mongoose } = require("mongoose");
const Course = require("../../models/Course");
const Quiz = require("../../models/Quiz");
const StudentQuizAttempts = require("../../models/StudentQuizAttempts");
const User = require("../../models/User");

exports.createQuiz = async (req, res) => {
  try {
    const { courseId, title, description, questions, duration, passingScore, startDate, endDate, shuffleQuestions } = req.body;


    const finalStartDate = startDate ? new Date(startDate) : new Date();

    const finalEndDate = endDate ? new Date(endDate) : new Date(finalStartDate.getTime() + duration * 60000);

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    const instructorId = course.instructorId;
    const students = course.students.map(student => student.studentId);

    const newQuiz = new Quiz({
      courseId,
      instructorId,
      title,
      description,
      questions,
      students,
      duration: duration || 30,
      passingScore: passingScore || 60,
      startDate: finalStartDate || new Date(),
      endDate: finalEndDate || null,
      shuffleQuestions: shuffleQuestions || false,
      status: true
    });

    await newQuiz.save();

    // Update the course to include this quiz
    await Course.findByIdAndUpdate(
      courseId,
      { $push: { quizzes: newQuiz._id } },
      { new: true }
    );

    res.status(201).json({ success: true, message: "Quiz created successfully!", quiz: newQuiz });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating quiz", error: error.message });
  }
};

exports.startQuiz = async (req, res) => {
  try {
    const { quizId } = req.body;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    // Check if quiz is active
    const now = new Date();
    if (quiz.startDate > now) {
      return res.status(403).json({ success: false, message: "Quiz is not yet available" });
    }

    if (quiz.endDate && quiz.endDate < now) {
      return res.status(403).json({ success: false, message: "Quiz is no longer available" });
    }

    // Check if student is enrolled for this quiz
    if (!quiz.students.includes(userId)) {
      return res.status(403).json({ success: false, message: "You are not enrolled in this quiz" });
    }

    // Check if student has already attempted this quiz
    let attempt = await StudentQuizAttempts.findOne({ userId, quizId });

    if (attempt && attempt.isSubmitted) {
      return res.status(403).json({
        success: false,
        message: "You have already completed this quiz",
        result: {
          score: attempt.score,
          totalPossibleScore: attempt.totalPossibleScore,
          percentageScore: attempt.percentageScore,
          passed: attempt.passed
        }
      });
    }

    if (!attempt) {
      // Create a new attempt
      attempt = new StudentQuizAttempts({
        userId,
        quizId,
        responses: [],
        startedAt: new Date(),
        isSubmitted: false,
        totalPossibleScore: quiz.questions.reduce((total, q) => total + (q.points || 1), 0)
      });
      await attempt.save();
    }

    // Prepare questions for the student (possibly shuffled)
    let quizQuestions = [...quiz.questions];
    if (quiz.shuffleQuestions) {
      quizQuestions = quizQuestions.sort(() => Math.random() - 0.5);
    }

    // Remove correct answers from response sent to client
    const safeQuestions = quizQuestions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      points: q.points || 1
    }));

    res.status(200).json({
      success: true,
      attempt: {
        _id: attempt._id,
        startedAt: attempt.startedAt,
        timeLimit: quiz.duration
      },
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        duration: quiz.duration,
        questions: safeQuestions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error starting quiz", error: error.message });
  }
};

exports.getQuizzes = async (req, res) => {
  try {
    const { courseId, instructorId, status } = req.query;
    let query = {};

    if (courseId) query.courseId = courseId;
    if (instructorId) query.instructorId = instructorId;
    if (status) query.status = status === 'true';

    const quizzes = await Quiz.find(query)
      .populate("students", "userName userEmail")
      .populate("courseId", "title")
      .populate("instructorId", "userName");

    res.status(200).json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching quizzes", error: error.message });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("students", "userName userEmail")
      .populate("courseId", "title image")
      .populate("instructorId", "userName");

    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    // Calculate stats about the quiz for instructors
    if (req.query.includeStats === 'true') {
      const attempts = await StudentQuizAttempts.find({ quizId: quiz._id, isSubmitted: true });
      const stats = {
        totalAttempts: attempts.length,
        averageScore: attempts.length > 0 ?
          attempts.reduce((sum, att) => sum + att.percentageScore, 0) / attempts.length : 0,
        passRate: attempts.length > 0 ?
          (attempts.filter(a => a.passed).length / attempts.length) * 100 : 0,
      };

      return res.status(200).json({ success: true, quiz, stats });
    }

    res.status(200).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching quiz", error: error.message });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    // Check if the quiz has any submitted attempts
    const hasAttempts = await StudentQuizAttempts.exists({
      quizId: req.params.id,
      isSubmitted: true
    });

    // If there are submitted attempts, restrict which fields can be updated
    if (hasAttempts) {
      const safeUpdates = {};
      const allowedFields = ['title', 'description', 'status', 'endDate'];

      Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
          safeUpdates[key] = req.body[key];
        }
      });

      const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, safeUpdates, { new: true });
      if (!updatedQuiz) return res.status(404).json({ success: false, message: "Quiz not found" });

      return res.status(200).json({
        success: true,
        message: "Quiz updated successfully. Some fields could not be modified because there are already submitted attempts.",
        quiz: updatedQuiz
      });
    }

    // If no submitted attempts, allow all updates
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    // Check if courseId is being changed
    if (req.body.courseId && req.body.courseId !== quiz.courseId.toString()) {
      // Remove quiz from old course
      await Course.findByIdAndUpdate(
        quiz.courseId,
        { $pull: { quizzes: quiz._id } },
        { new: true }
      );

      // Add quiz to new course
      await Course.findByIdAndUpdate(
        req.body.courseId,
        { $push: { quizzes: quiz._id } },
        { new: true }
      );
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedQuiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    res.status(200).json({ success: true, message: "Quiz updated successfully", quiz: updatedQuiz });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating quiz", error: error.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    // Check if the quiz has any submitted attempts
    const hasAttempts = await StudentQuizAttempts.exists({
      quizId: req.params.id,
      isSubmitted: true
    });

    if (hasAttempts) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete quiz because it has submitted attempts. Consider setting status to false instead."
      });
    }

    // Delete any existing attempts that were started but not submitted
    await StudentQuizAttempts.deleteMany({ quizId: req.params.id });

    // Delete the quiz
    const deletedQuiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!deletedQuiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    // Remove quiz from course's quizzes array
    await Course.findByIdAndUpdate(
      deletedQuiz.courseId,
      { $pull: { quizzes: req.params.id } },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting quiz", error: error.message });
  }
};

exports.assignStudentsToQuiz = async (req, res) => {
  try {
    const { quizId, studentIds } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    // Add only students not already assigned to the quiz
    const existingStudentIds = quiz.students.map(id => id.toString());
    const newStudentIds = studentIds.filter(id => !existingStudentIds.includes(id));

    if (newStudentIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "All students are already assigned to this quiz",
        quiz
      });
    }

    quiz.students.push(...newStudentIds);
    await quiz.save();

    res.status(200).json({
      success: true,
      message: `${newStudentIds.length} students assigned successfully`,
      quiz
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error assigning students", error: error.message });
  }
};

exports.submitQuizAttempt = async (req, res) => {
  try {
    const { quizId, responses } = req.body;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    // Find the existing attempt
    const attempt = await StudentQuizAttempts.findOne({ userId, quizId });
    if (!attempt) {
      return res.status(404).json({ success: false, message: "No active quiz attempt found" });
    }

    if (attempt.isSubmitted) {
      return res.status(400).json({ success: false, message: "Quiz already submitted" });
    }

    // Calculate time spent
    const now = new Date();
    const timeSpent = Math.floor((now - attempt.startedAt) / 1000); // Time in seconds

    // Check if time limit was exceeded
    if (timeSpent > quiz.duration * 60) {
      attempt.timeSpent = quiz.duration * 60;
    } else {
      attempt.timeSpent = timeSpent;
    }

    // Validate and grade responses
    let score = 0;
    const totalPossibleScore = quiz.questions.reduce((total, q) => total + (q.points || 1), 0);

    // Process each response
    const processedResponses = [];

    for (const response of responses) {
      const question = quiz.questions.id(response.questionId);

      if (!question) continue;

      const isCorrect = question.correctOptionIndex === response.selectedOptionIndex;
      const points = isCorrect ? (question.points || 1) : 0;
      score += points;

      processedResponses.push({
        questionId: response.questionId,
        selectedOptionIndex: response.selectedOptionIndex,
        isCorrect
      });
    }

    // Update the attempt with graded responses
    attempt.responses = processedResponses;
    attempt.score = score;
    attempt.totalPossibleScore = totalPossibleScore;
    attempt.percentageScore = totalPossibleScore > 0 ? Math.round((score / totalPossibleScore) * 100) : 0;
    attempt.passed = attempt.percentageScore >= quiz.passingScore;
    attempt.completedAt = now;
    attempt.isSubmitted = true;

    await attempt.save();

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      result: {
        score,
        totalPossibleScore,
        percentageScore: attempt.percentageScore,
        passed: attempt.passed,
        timeSpent: attempt.timeSpent
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error submitting quiz", error: error.message });
  }
};

exports.getStudentQuizAttempts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify that the requested userId matches the authenticated user or is an instructor
    if (req.user._id.toString() !== userId && req.user.role !== 'instructor') {
      return res.status(403).json({ success: false, message: "Unauthorized to access these records" });
    }

    const attempts = await StudentQuizAttempts.find({ userId })
      .populate({
        path: "quizId",
        select: "title description duration courseId passingScore",
        populate: {
          path: "courseId",
          select: "title image"
        }
      });

    res.status(200).json({ success: true, attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching quiz attempts", error: error.message });
  }
};

// Add new functions for additional features

exports.getQuizzesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // First check if this is an instructor request
    const course = await Course.findOne({
      _id: courseId,
      instructorId: userId
    });

    let quizzes;

    if (course) {
      // This is an instructor, show all quizzes
      quizzes = await Quiz.find({
        courseId
      }).populate({
        path: 'questions',
        select: 'questionText'
      });

      res.status(200).json({ success: true, quizzes });
    } else {
      // This is a student, show only active quizzes
      quizzes = await Quiz.find({
        courseId,
        status: true,
        startDate: { $lte: new Date() },
        $or: [
          { endDate: null },
          { endDate: { $gte: new Date() } }
        ]
      }).select('title description duration startDate endDate');

      // Get student's attempts for these quizzes
      const quizIds = quizzes.map(quiz => quiz._id);
      const attempts = await StudentQuizAttempts.find({
        userId,
        quizId: { $in: quizIds }
      }).select('quizId isSubmitted score percentageScore passed');

      // Combine the data
      const quizzesWithAttempts = quizzes.map(quiz => {
        const attempt = attempts.find(a => a.quizId.toString() === quiz._id.toString());
        return {
          _id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          duration: quiz.duration,
          startDate: quiz.startDate,
          endDate: quiz.endDate,
          attempted: !!attempt,
          completed: attempt?.isSubmitted || false,
          score: attempt?.percentageScore || 0,
          passed: attempt?.passed || false
        };
      });

      res.status(200).json({ success: true, quizzes: quizzesWithAttempts });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching quizzes for course", error: error.message });
  }
};


exports.getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const instructorId = req.query.instructorId;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ success: false, message: "Invalid quiz ID" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      console.error("Quiz not found for ID:", quizId);
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    if (instructorId && quiz.instructorId && instructorId !== quiz.instructorId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to access these results" });
    }

    const attempts = await StudentQuizAttempts.find({ quizId, isSubmitted: true })
      .populate('userId', 'userName userEmail')
      .select('userId score percentageScore passed timeSpent startedAt completedAt');

    const enrolledStudents = await Course.findById(quiz.courseId)
      .select('students')
      .populate('students.studentId', 'userName userEmail');

    if (!enrolledStudents) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    console.log(enrolledStudents, "enrolledStudents");

    const studentsWithNoAttempt = enrolledStudents.students
      .filter(s => !attempts.some(a => a.userId._id.toString() === s.studentId.toString()))
      .map(s => ({
        student: s.studentId,
        userName: s.studentName,
        userEmail: s.studentEmail,
        attempted: false
      }));

    const results = {
      quizStats: {
        totalStudents: enrolledStudents.students.length,
        totalAttempted: attempts.length,
        averageScore: attempts.length > 0
          ? Math.round(attempts.reduce((sum, att) => sum + att.percentageScore, 0) / attempts.length)
          : 0,
        passRate: attempts.length > 0
          ? Math.round((attempts.filter(a => a.passed).length / attempts.length) * 100)
          : 0,
      },
      studentResults: attempts.map(a => ({
        student: a.userId,
        score: a.score,
        percentageScore: a.percentageScore,
        passed: a.passed,
        timeSpent: a.timeSpent,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
        attempted: true
      })),
      notAttempted: studentsWithNoAttempt
    };

    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching quiz results",
      error: error.message
    });
  }
};

exports.getQuizResultsDownloadFormat = async (req, res) => {
  try {
    const { instructorId } = req.params;

    // Check if instructor exists
    const instructorExists = await User.findById(instructorId);
    if (!instructorExists) {
      return res.status(404).json({ error: "Instructor not found" });
    }

    // Fetch all quizzes created by this instructor
    const quizzes = await Quiz.find({ instructorId }).select("_id title");

    if (!quizzes.length) {
      return res.status(404).json({ error: "No quizzes found for this instructor" });
    }

    // Fetch all student quiz attempts for these quizzes
    const quizIds = quizzes.map(q => q._id);
    const attempts = await StudentQuizAttempts.find({ quizId: { $in: quizIds } })
      .populate("userId", "firstName lastName email")
      .populate("quizId", "title");

    // Format the results
    const formattedResults = attempts.map(attempt => ({
      quizTitle: attempt.quizId?.title || "Unknown Quiz",
      studentName: `${attempt.userId?.firstName} ${attempt.userId?.lastName}`,
      studentEmail: attempt.userId?.email || "N/A",
      score: attempt.score,
      totalPossibleScore: attempt.totalPossibleScore,
      percentageScore: attempt.percentageScore.toFixed(2),
      passed: attempt.passed,
      timeSpent: `${Math.floor(attempt.timeSpent / 60)}m ${attempt.timeSpent % 60}s`,
      submittedAt: attempt.completedAt ? attempt.completedAt.toISOString() : "Not Submitted",
      reviewComments: attempt.reviewComments || "No comments"
    }));

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}