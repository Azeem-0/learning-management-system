const User = require("../../models/User");

const getStudentsByCriteria = async (req, res) => {
  try {
    const { year = "", branch = "" } = req.query;

    console.log(req.query, "req.query");

    // Build query object dynamically
    let studentQuery = {
      role : "student"
    };

    if (year) {
      studentQuery.year = year;
    }
    if (branch) {
      studentQuery.branch = branch;
    }

    console.log(studentQuery, "studentQuery");
    // Fetch students matching the criteria
    const students = await User.find(studentQuery).select("userName userEmail year branch regd");

    console.log(students, "students");
    
    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error("Error fetching students by criteria:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {getStudentsByCriteria};
