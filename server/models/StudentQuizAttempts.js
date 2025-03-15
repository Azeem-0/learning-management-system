const { default: mongoose } = require("mongoose");

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
  score: { type: Number, default: 0 },
  totalPossibleScore: { type: Number, default: 0 },
  percentageScore: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  startedAt: Date,
  completedAt: Date,
  isSubmitted: { type: Boolean, default: false },
  timeSpent: { type: Number, default: 0 }, // Time spent in seconds
  reviewComments: String, // Instructor feedback
}, { timestamps: true });

// Add unique compound index to ensure a student can only attempt a quiz once
StudentQuizAttemptSchema.index({ userId: 1, quizId: 1 }, { unique: true });

module.exports = mongoose.model("StudentQuizAttempt", StudentQuizAttemptSchema);
