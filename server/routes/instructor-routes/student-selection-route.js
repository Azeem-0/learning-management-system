const express = require("express");
const {
    getStudentsByCriteria,
} = require("../../controllers/instructor-controller/student-selection-controller");
const router = express.Router();

router.get("/students", getStudentsByCriteria);

module.exports = router;
