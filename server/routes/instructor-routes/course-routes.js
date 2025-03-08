const express = require("express");
const {
  addNewCourse,
  getAllCourses,
  getCourseDetailsByID,
  updateCourseByID,
  addStudentsToCourse,
} = require("../../controllers/instructor-controller/course-controller");
const router = express.Router();

router.post("/add", addNewCourse);
router.get("/get", getAllCourses);
router.get("/get/details/:id", getCourseDetailsByID);
router.put("/update/:id", updateCourseByID);
router.post("/:courseId/add-students", addStudentsToCourse);

module.exports = router;
