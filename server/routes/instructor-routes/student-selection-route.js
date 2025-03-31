const express = require("express");
const {
    getStudentsByCriteria,
    analyzeStudentProgress,
} = require("../../controllers/instructor-controller/student-selection-controller");
const router = express.Router();

router.get("/", getStudentsByCriteria);
router.get("/progress-analysis/:userId", analyzeStudentProgress);

module.exports = router;
