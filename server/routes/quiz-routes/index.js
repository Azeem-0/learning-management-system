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
router.post("/start-quiz", authenticate, quizController.startQuiz);
router.post("/submit-attempt", authenticate, quizController.submitQuizAttempt);
router.get("/attempts/:userId", authenticate, quizController.getStudentQuizAttempts);

// Instructor quiz management
router.post("/assign-students", authenticate, quizController.assignStudentsToQuiz);
router.get("/course/:courseId", authenticate, quizController.getQuizzesByCourse);
router.get("/results/:quizId", authenticate, quizController.getQuizResults);

module.exports = router;
