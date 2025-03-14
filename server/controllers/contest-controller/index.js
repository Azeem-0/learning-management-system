const Contest = require("../../models/Contest");

const createContest = async (req, res) => {
  try {
    const { title, description, problems, startTime, endTime } = req.body.body;

    if (
      !title ||
      !description ||
      !problems ||
      !Array.isArray(problems) ||
      problems.length === 0 ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All required fields must be provided and at least one problem is required",
      });
    }

    // Validate each problem
    for (const problem of problems) {
      if (
        !problem.title ||
        !problem.description ||
        !problem.problemStatement ||
        !problem.inputFormat ||
        !problem.outputFormat ||
        !problem.sampleInput ||
        !problem.sampleOutput
      ) {
        return res.status(400).json({
          success: false,
          message: "All problem fields must be provided for each problem",
        });
      }
    }

    const contest = await Contest.create({
      title,
      description,
      problems,
      startTime,
      endTime,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: contest,
      message: "Contest created successfully",
    });
  } catch (error) {
    console.error("Error creating contest:", error);
    res.status(500).json({
      success: false,
      message: "Error creating contest",
      error: error.message,
    });
  }
};

const getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find().populate("createdBy", "name");
    res.status(200).json({
      success: true,
      data: contests,
    });
  } catch (error) {
    console.error("Error fetching contests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching contests",
      error: error.message,
    });
  }
};

module.exports = {
  createContest,
  getAllContests,
};
