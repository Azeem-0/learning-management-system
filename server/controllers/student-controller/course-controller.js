const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");

const getAllStudentViewCourses = async (req, res) => {
  try {
    const {
      userId = "",
      category = "",
      level = "",
      primaryLanguage = "",
      sortBy = "title-atoz",
    } = req.query;

    console.log(req.query, "req.query");

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Find student courses
    const studentCourses = await StudentCourses.findOne({ userId });

    if (!studentCourses || studentCourses.courses.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Get all course IDs
    const courseIds = studentCourses.courses.map(course => course.courseId);
    
    // Fetch complete course details
    let coursesQuery = { _id: { $in: courseIds } };
    
    // Apply filters
    if (category) {
      coursesQuery.category = { $in: category.split(",") };
    }
    if (level) {
      coursesQuery.level = { $in: level.split(",") };
    }
    if (primaryLanguage) {
      coursesQuery.primaryLanguage = { $in: primaryLanguage.split(",") };
    }
    
    // Get full course details
    let assignedCourses = await Course.find(coursesQuery);
    
    // Merge with enrollment data
    assignedCourses = assignedCourses.map(course => {
      const enrollmentInfo = studentCourses.courses.find(
        c => c.courseId.toString() === course._id.toString()
      );
      return {
        ...course.toObject(),
        enrollmentDate: enrollmentInfo.dateOfPurchase
      };
    });

    // Apply sorting
    assignedCourses.sort((a, b) => {
      switch (sortBy) {
        case "title-atoz":
          return a.title.localeCompare(b.title);
        case "title-ztoa":
          return b.title.localeCompare(a.title);
        default:
          return a.title.localeCompare(b.title);
      }
    });

    res.status(200).json({ success: true, data: assignedCourses });
  } catch (error) {
    console.error("Error fetching assigned courses:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getStudentViewCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const courseDetails = await Course.findById(id);

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "No course details found",
        data: null,
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


module.exports = {
  getAllStudentViewCourses,
  getStudentViewCourseDetails,
};
