const { default: mongoose } = require("mongoose");
const CourseProgress = require("../../models/CourseProgress");
const StudentQuizAttempts = require("../../models/StudentQuizAttempts");
const User = require("../../models/User");
const OpenAI = require("openai");
const dotenv = require("dotenv");
dotenv.config();

const getStudentsByCriteria = async (req, res) => {
  try {
    const { year = "", branch = "" } = req.query;

    console.log(req.query, "req.query");

    // Build query object dynamically
    let studentQuery = {
      role: "student"
    };

    if (year) {
      studentQuery.year = year;
    }
    if (branch) {
      studentQuery.branch = branch;
    }

    console.log(studentQuery, "studentQuery");
    // Fetch students matching the criteria
    const students = await User.find(studentQuery).select("userName userEmail year branch regd");

    console.log(students, "students");

    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error("Error fetching students by criteria:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const analyzeStudentProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Fetch quiz attempts with error handling
    const quizAttempts = await StudentQuizAttempts.find({ userId })
      .populate("quizId")
      .lean()
      .exec();

    // Fetch course progress with error handling
    const courseProgress = await CourseProgress.find({ userId })
      .populate("courseId")
      .lean()
      .exec();

    // Enhanced data processing with more robust calculations
    const topicPerformance = {};
    let totalQuizzes = 0,
      totalPassed = 0,
      totalScore = 0,
      totalTimeSpent = 0,
      contestsParticipated = 0;

    quizAttempts.forEach(attempt => {
      if (!attempt.quizId) return; // Skip if quiz is deleted

      totalQuizzes++;
      totalScore += attempt.percentageScore || 0;
      totalTimeSpent += attempt.timeSpent || 0;

      if (attempt.passed) totalPassed++;

      const courseTitle = attempt.quizId.title || 'Uncategorized';

      if (!topicPerformance[courseTitle]) {
        topicPerformance[courseTitle] = {
          scores: [],
          attempts: 0,
          timeSpent: 0
        };
      }

      topicPerformance[courseTitle].scores.push(attempt.percentageScore || 0);
      topicPerformance[courseTitle].attempts++;
      topicPerformance[courseTitle].timeSpent += attempt.timeSpent || 0;
    });

    // Calculate average scores for each topic
    Object.keys(topicPerformance).forEach(topic => {
      const scores = topicPerformance[topic].scores;
      topicPerformance[topic].averageScore =
        scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;
    });

    // Course and progress calculations
    const totalCourses = courseProgress.length;
    const completedCourses = courseProgress.filter(course => course.completed).length;

    // Identify strengths and weaknesses
    const strengths = [];
    const weaknesses = [];

    Object.keys(topicPerformance).forEach(topic => {
      const avgScore = topicPerformance[topic].averageScore;
      if (avgScore > 75) {
        strengths.push(topic);
      } else if (avgScore < 50) {
        weaknesses.push(topic);
      }
    });

    // Prepare student data for AI feedback
    const studentData = {
      completedCourses,
      totalCourses,
      totalQuizzes,
      totalPassed,
      averageQuizScore: totalQuizzes > 0
        ? Number((totalScore / totalQuizzes).toFixed(2))
        : 0,
      strengths,
      weaknesses
    };

    // AI-Generated Personalized Feedback
    let feedback = '';
    try {
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a friendly AI academic advisor providing personalized student progress feedback. Be encouraging, specific, and motivational."
          },
          {
            role: "user",
            content: `Generate a personalized, encouraging academic progress report. 
            Student Details:
            - Courses Completed: ${studentData.completedCourses}/${studentData.totalCourses}
            - Total Quizzes: ${studentData.totalQuizzes}
            - Passed Quizzes: ${studentData.totalPassed}
            - Average Quiz Score: ${studentData.averageQuizScore}%
            - Strengths: ${studentData.strengths.join(", ") || "None identified"}
            - Areas for Improvement: ${studentData.weaknesses.join(", ") || "None identified"}

            Provide a motivational and constructive feedback that helps the student understand their progress and potential areas of growth.`
          }
        ],
        max_tokens: 250,
        temperature: 0.7
      });

      // Extract feedback from AI response
      feedback = aiResponse.choices[0].message.content.trim();
    } catch (aiError) {
      console.error("AI Feedback Generation Error:", aiError);
      const feedbackTemplates = [
        `You've made significant progress by completing ${completedCourses} out of ${totalCourses} courses!`,
        `You have participated in ${totalQuizzes} quizzes and passed in ${totalPassed} quizzes.`,
        `Keep focusing on your strengths in ${strengths.join(", ")} while working to improve in ${weaknesses.join(", ")}`];
      feedback = feedbackTemplates.join(" ");
    }

    return res.status(200).json({
      totalCourses,
      completedCourses,
      totalQuizzes,
      totalPassed,
      averageQuizScore: totalQuizzes > 0
        ? Number((totalScore / totalQuizzes).toFixed(2))
        : 0,
      totalTimeSpent,
      contestsParticipated,
      strengths,
      weaknesses,
      feedback
    });

  } catch (error) {
    console.error("Error analyzing student progress:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
};


module.exports = { getStudentsByCriteria, analyzeStudentProgress };
