const mongoose = require("mongoose");

const StudentQuizAttemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    responses: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
        selectedOptionIndex: Number,
        isCorrect: Boolean,
      },
    ],
    score: Number,
    completedAt: Date,
});
  
module.exports = mongoose.model("StudentQuizAttempt", StudentQuizAttemptSchema);
  