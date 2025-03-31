const express = require("express");
const {
  getStudentViewCourseDetails,
  getAllStudentViewCourses,
  toggleLikeCourse,
  addQuestion,
  addReply,
} = require("../../controllers/student-controller/course-controller");
const { markCurrentLectureAsViewed } = require("../../controllers/student-controller/course-progress-controller");
const router = express.Router();

router.get("/", getAllStudentViewCourses);
router.get("/:id", getStudentViewCourseDetails);
router.post("/progress", markCurrentLectureAsViewed);
router.post("/like", toggleLikeCourse);
router.post("/:courseId/lectures/:lectureId/questions", addQuestion);
router.post("/:courseId/lectures/:lectureId/questions/:questionId/replies", addReply);

module.exports = router;
