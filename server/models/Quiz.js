const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  questionText: String,
  options: [String],
  correctOptionIndex: Number,
});

const QuizSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  description: String,
  questions: [QuestionSchema],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status : Boolean,
});

module.exports = mongoose.model("Quiz", QuizSchema);
