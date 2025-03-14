const Course = require("../../models/Course");
const Quiz = require("../../models/Quiz");
const StudentQuizAttempts = require("../../models/StudentQuizAttempts");


exports.createQuiz = async (req, res) => {
  try {
    const { courseId, title, description, questions } = req.body;

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
      status: true
    });

    await newQuiz.save();
    res.status(201).json({ success: true, message: "Quiz created successfully!", quiz: newQuiz });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating quiz", error: error.message });
  }
};

exports.getQuizzes = async (req, res) => {
  try {
    const { courseId, instructorId,status } = req.query;
    let query = {};

    if (courseId) query.courseId = courseId;
    if (instructorId) query.instructorId = instructorId;
    if (status) query.status = status;

    const quizzes = await Quiz.find(query).populate("students", "userName userEmail").populate("courseId", "title");
    res.status(200).json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching quizzes", error: error.message });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("students", "userName userEmail");
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    res.status(200).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching quiz", error: error.message });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedQuiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    res.status(200).json({ success: true, message: "Quiz updated successfully", quiz: updatedQuiz });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating quiz", error: error.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const deletedQuiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!deletedQuiz) return res.status(404).json({ success: false, message: "Quiz not found" });

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

    quiz.students.push(...studentIds);
    await quiz.save();

    res.status(200).json({ success: true, message: "Students assigned successfully", quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error assigning students", error: error.message });
  }
};

exports.submitQuizAttempt = async (req, res) => {
  try {
    const { userId, quizId, responses } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    let score = 0;

  
    responses.forEach((response) => {
      const question = quiz.questions.id(response.questionId);
      if (question && question.correctOptionIndex === response.selectedOptionIndex) {
        score += 1;
      }
    });

    const quizAttempt = new StudentQuizAttemps({
      userId,
      quizId,
      responses,
      score,
      completedAt: new Date(),
    });

    await quizAttempt.save();
    res.status(200).json({ success: true, message: "Quiz submitted successfully", score });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error submitting quiz", error: error.message });
  }
};

exports.getStudentQuizAttempts = async (req, res) => {
  try {
    const { userId } = req.params;
    const attempts = await StudentQuizAttempts.find({ userId }).populate("quizId", "title description");

    res.status(200).json({ success: true, attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching quiz attempts", error: error.message });
  }
};
