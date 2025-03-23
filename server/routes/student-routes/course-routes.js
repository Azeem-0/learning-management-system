const express = require("express");
const {
  getStudentViewCourseDetails,
  getAllStudentViewCourses,
  toggleLikeCourse,
  addQuestion,
  addReply,
} = require("../../controllers/student-controller/course-controller");
const router = express.Router();

router.get("/get", getAllStudentViewCourses);
router.get("/get/details/:id", getStudentViewCourseDetails);
router.post("/like",toggleLikeCourse);
router.post("/:courseId/lectures/:lectureId/questions",addQuestion);
router.post("/:courseId/lectures/:lectureId/questions/:questionId/replies",addReply);

module.exports = router;
