const express = require("express");
const {
  addNewCourse,
  getAllCourses,
  getCourseDetailsByID,
  updateCourseByID,
  addStudentsToCourse,
  deleteCourse,
} = require("../../controllers/instructor-controller/course-controller");
const router = express.Router();

router.post("/", addNewCourse);
router.get("/", getAllCourses);
router.get("/:id", getCourseDetailsByID);
router.put("/:id", updateCourseByID);
router.delete("/:id", deleteCourse);
router.post("/:id/students", addStudentsToCourse);

module.exports = router;
