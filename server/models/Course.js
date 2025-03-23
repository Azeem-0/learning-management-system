const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema({
  userId: String,
  userName: String,
  replyText: String,
  date: { type: Date, default: Date.now },
});

const QuestionSchema = new mongoose.Schema({
  studentId: String,
  studentName: String,
  questionText: String,
  date: { type: Date, default: Date.now },
  replies: [ReplySchema], // Replies to the question
});

const LectureSchema = new mongoose.Schema({
  title: String,
  videoUrl: String,
  public_id: String,
  questions: [QuestionSchema], // Questions specific to the lecture
});

const CourseSchema = new mongoose.Schema({
  instructorId: String,
  instructorName: String,
  date: { type: Date, default: Date.now },
  title: String,
  category: String,
  level: String,
  primaryLanguage: String,
  subtitle: String,
  description: String,
  image: String,
  welcomeMessage: String,
  objectives: String,
  students: [
    {
      studentId: String,
      studentName: String,
      studentEmail: String,
    },
  ],
  curriculum: [LectureSchema],
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
  isPublised: Boolean,
  likes: { type: Number, default: 0 }, // Track total likes
  likedBy: [{ type: String }], // Store user IDs who liked the course
});

module.exports = mongoose.model("Course", CourseSchema);
