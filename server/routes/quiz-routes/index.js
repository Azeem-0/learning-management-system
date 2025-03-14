

const express = require("express");
const router = express.Router();
const quizController = require("../../controllers/quiz-controller/index");

router.post("/", quizController.createQuiz);
router.get("/", quizController.getQuizzes);
router.get("/:id", quizController.getQuizById);
router.put("/:id", quizController.updateQuiz);
router.delete("/:id", quizController.deleteQuiz);
router.post("/assign-students", quizController.assignStudentsToQuiz);
router.post("/submit-attempt", quizController.submitQuizAttempt);
router.get("/attempts/:userId", quizController.getStudentQuizAttempts);

module.exports = router;
