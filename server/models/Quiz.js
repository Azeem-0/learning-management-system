const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  questionText: String,
  options: [String],
  correctOptionIndex: Number,
  points: { type: Number, default: 1 }, // Points per question for flexibility
});

const QuizSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  description: String,
  duration: { type: Number, default: 30 }, // Duration in minutes
  questions: [QuestionSchema],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: Boolean,
  startDate: { type: Date, default: Date.now }, // When the quiz is available
  endDate: { type: Date }, // Optional end date for quiz availability
  passingScore: { type: Number, default: 60 }, // Percentage required to pass
  shuffleQuestions: { type: Boolean, default: false }, // Option to randomize question order
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Quiz", QuizSchema);