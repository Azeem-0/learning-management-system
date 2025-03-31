const express = require("express");
const router = express.Router();
const quizController = require("../../controllers/quiz-controller/index");
const authenticate = require("../../middleware/auth-middleware");

// Quiz CRUD operations
router.post("/", authenticate, quizController.createQuiz);
router.get("/", authenticate, quizController.getQuizzes);
router.get("/:id", authenticate, quizController.getQuizById);
router.put("/:id", authenticate, quizController.updateQuiz);
router.delete("/:id", authenticate, quizController.deleteQuiz);

// Student quiz endpoints
router.post("/start", authenticate, quizController.startQuiz);
router.post("/submit", authenticate, quizController.submitQuizAttempt);
router.get("/attempts/:userId", authenticate, quizController.getStudentQuizAttempts);

// Instructor quiz management
router.post("/assign-students", authenticate, quizController.assignStudentsToQuiz);
router.get("/course/:courseId", authenticate, quizController.getQuizzesByCourse);
router.get("/:quizId/results", authenticate, quizController.getQuizResults);

// Fetch quiz results for instructor. 
router.get("/instructor/:instructorId/results", quizController.getQuizResultsDownloadFormat);

module.exports = router;
