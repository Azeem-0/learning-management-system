const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");
const User = require("../../models/User");

const getAllStudentViewCourses = async (req, res) => {
  try {
    const {
      userId = "",
      category = "",
      level = "",
      primaryLanguage = "",
      sortBy = "title-atoz",
    } = req.query;

    let assignedCourses = [];
    const user = await User.findOne({ _id: userId });

    if (user?.role === "instructor") {
      let coursesQuery = {};
      if (category) coursesQuery.category = { $in: category.split(",") };
      if (level) coursesQuery.level = { $in: level.split(",") };
      if (primaryLanguage) coursesQuery.primaryLanguage = { $in: primaryLanguage.split(",") };

      assignedCourses = await Course.find(coursesQuery).populate("quizzes");
    } else {
      const studentCourses = await StudentCourses.findOne({ userId });
      if (studentCourses) {
        const courseIds = studentCourses.courses.map((course) => course.courseId);
        let coursesQuery = { _id: { $in: courseIds } };

        if (category) coursesQuery.category = { $in: category.split(",") };
        if (level) coursesQuery.level = { $in: level.split(",") };
        if (primaryLanguage) coursesQuery.primaryLanguage = { $in: primaryLanguage.split(",") };

        assignedCourses = await Course.find(coursesQuery).populate("quizzes");
        assignedCourses = assignedCourses.map((course) => {
          const enrollmentInfo = studentCourses.courses.find(
            (c) => c.courseId.toString() === course._id.toString()
          );
          return {
            ...course.toObject(),
            enrollmentDate: enrollmentInfo?.dateOfPurchase || null,
          };
        });
      }
    }

    // Sorting
    assignedCourses.sort((a, b) => {
      switch (sortBy) {
        case "title-atoz":
          return a.title.localeCompare(b.title);
        case "title-ztoa":
          return b.title.localeCompare(a.title);
        case "most-liked":
          return b.likes - a.likes; // Sort by likes in descending order
        case "least-liked":
          return a.likes - b.likes;
        default:
          return a.title.localeCompare(b.title);
      }
    });

    res.status(200).json({ success: true, data: assignedCourses });
  } catch (error) {
    console.error("Error fetching assigned courses:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get course details
const getStudentViewCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const courseDetails = await Course.findById(id).populate("quizzes");

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "No course details found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: courseDetails,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// Add a question to a lecture
const addQuestion = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const { studentId, studentName, questionText } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    const lecture = course.curriculum.id(lectureId);
    if (!lecture) return res.status(404).json({ success: false, message: "Lecture not found" });

    lecture.questions.push({ studentId, studentName, questionText });
    await course.save();

    res.status(201).json({ success: true, message: "Question added successfully" });
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Add a reply to a question
const addReply = async (req, res) => {
  try {
    const { courseId, lectureId, questionId } = req.params;
    const { userId, userName, replyText } = req.body;

    console.log(courseId, "courseId", lectureId, "lectureId", questionId, "questionId", userName, "userName", replyText, "replyText");

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    const lecture = course.curriculum.id(lectureId);
    if (!lecture) return res.status(404).json({ success: false, message: "Lecture not found" });

    const question = lecture.questions.id(questionId);
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    question.replies.push({ userId, userName, replyText });
    await course.save();

    res.status(201).json({ success: true, message: "Reply added successfully" });
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Like or unlike a course
const toggleLikeCourse = async (req, res) => {
  try {
    const { courseId, userId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    const alreadyLiked = course.likedBy.includes(userId);
    if (alreadyLiked) {
      // Unlike the course
      course.likedBy = course.likedBy.filter((id) => id !== userId);
      course.likes -= 1;
    } else {
      // Like the course
      course.likedBy.push(userId);
      course.likes += 1;
    }

    await course.save();
    res.status(200).json({
      success: true,
      message: alreadyLiked ? "Course unliked" : "Course liked",
      likes: course.likes,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getAllStudentViewCourses,
  getStudentViewCourseDetails,
  addQuestion,
  addReply,
  toggleLikeCourse,
};
