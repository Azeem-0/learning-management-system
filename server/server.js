require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth-routes/index");
const mediaRoutes = require("./routes/instructor-routes/media-routes");
const instructorCourseRoutes = require("./routes/instructor-routes/course-routes");
const studentViewCourseRoutes = require("./routes/student-routes/course-routes");
const studentCourseProgressRoutes = require("./routes/student-routes/course-progress-routes");
const studentSelectionRoutes = require("./routes/instructor-routes/student-selection-route");
const quizRoutes = require("./routes/quiz-routes");
const contestsRoutes = require("./routes/contest-routes/index");
const submissionRoutes = require("./routes/contest-routes/submission-routes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

//database connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("mongodb is connected"))
  .catch((e) => console.log(e));

//routes configuration
app.use("/auth", authRoutes);
app.use("/courses", instructorCourseRoutes);
app.use("/student/courses", studentViewCourseRoutes);
app.use("/quizzes", quizRoutes);
app.use("/media", mediaRoutes);
app.use("/student/course-progress", studentCourseProgressRoutes);
app.use("/contests", contestsRoutes);
app.use("/submissions", submissionRoutes);
app.use("/students", studentSelectionRoutes);

app.get("/generate-chat-token", (req, res) => {
  const userId = Math.floor(Math.random() * 1000000).toString();
  const crypto = require("crypto");
  const hmac = crypto.createHmac("sha256", process.env.CHATBASE_SECRET_KEY).update(userId).digest("hex");

  console.log(`Generated HMAC for user ${userId}: ${hmac}`);

  res.json({ hmac, userId });
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});

app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`);
});
