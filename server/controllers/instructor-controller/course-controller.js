const Course = require("../../models/Course");
const User = require("../../models/User");
const StudentCourses = require("../../models/StudentCourses");
const CourseProgress = require("../../models/CourseProgress");
const Quiz = require("../../models/Quiz");
const StudentQuizAttempts = require("../../models/StudentQuizAttempts");

const addNewCourse = async (req, res) => {
  try {
    const courseData = req.body;
    const newlyCreatedCourse = new Course(courseData);
    const saveCourse = await newlyCreatedCourse.save();

    if (saveCourse) {
      res.status(201).json({
        success: true,
        message: "Course saved successfully",
        data: saveCourse,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const coursesList = await Course.find({});

    res.status(200).json({
      success: true,
      data: coursesList,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getCourseDetailsByID = async (req, res) => {
  try {
    const { id } = req.params;
    const courseDetails = await Course.findById(id).populate("quizzes");
    console.log(courseDetails, "courseDetails");

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: courseDetails,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateCourseByID = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCourseData = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updatedCourseData,
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const addStudentsToCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { studentEmails } = req.body;

    // Validate input
    if (!studentEmails || !Array.isArray(studentEmails) || studentEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one student email is required.",
      });
    }

    // Fetch course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Fetch all students in a single query
    const students = await User.find({ userEmail: { $in: studentEmails } });

    if (students.length === 0) {
      return res.status(400).json({ success: false, message: "No valid students found." });
    }

    // Filter out existing students already enrolled
    const existingEmails = new Set(course.students.map(s => s.studentEmail));
    const studentsToAdd = students
      .filter(student => !existingEmails.has(student.userEmail)) // Only add new students
      .map(student => ({
        studentId: student._id,
        studentName: student.userName,
        studentEmail: student.userEmail,
      }));

    if (studentsToAdd.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All students are already enrolled.",
      });
    }

    // Add students to the course
    course.students.push(...studentsToAdd);
    await course.save();

    // Update StudentCourses model efficiently
    const studentUpdates = studentsToAdd.map(student => ({
      updateOne: {
        filter: { userId: student.studentId },
        update: {
          $push: {
            courses: {
              courseId: course._id,
              title: course.title,
              instructorId: course.instructorId,
              instructorName: course.instructorName,
              dateOfPurchase: new Date(),
              courseImage: course.image,
            },
          },
        },
        upsert: true, // Creates a new entry if not found
      },
    }));

    await StudentCourses.bulkWrite(studentUpdates);

    res.status(200).json({
      success: true,
      message: `${studentsToAdd.length} student(s) added successfully!`,
      data: course,
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};


const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete the course itself
    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Remove course from StudentCourses collection
    await StudentCourses.updateMany(
      { "courses.courseId": id },
      { $pull: { courses: { courseId: id } } }
    );

    // Delete course progress data
    await CourseProgress.deleteMany({ courseId: id });

    // Find all quizzes associated with this course
    const quizzes = await Quiz.find({ courseId: id });
    const quizIds = quizzes.map(quiz => quiz._id);
    
    // Delete all student quiz attempts for these quizzes
    if (quizIds.length > 0) {
      await StudentQuizAttempts.deleteMany({ quizId: { $in: quizIds } });
    }

    // Delete all quizzes associated with the course
    await Quiz.deleteMany({ courseId: id });

    res.status(200).json({
      success: true,
      message: "Course and all related data deleted successfully",
      data: course,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};


module.exports = {
  addNewCourse,
  getAllCourses,
  updateCourseByID,
  getCourseDetailsByID,
  addStudentsToCourse,
  deleteCourse,
};
