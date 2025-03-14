const Contest = require("../../models/Contest");

const validateSubmission = async (req, res) => {
  try {
    const { contestId, problemId, code, language } = req.body;
    const userId = req.user._id;

    // Find the contest and problem
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: "Contest not found",
      });
    }

    const problem = contest.problems.id(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    // Check if contest is active
    const now = new Date();
    if (now < contest.startTime || now > contest.endTime) {
      return res.status(403).json({
        success: false,
        message: "Contest is not active",
      });
    }

    // Initialize results array to store test case outcomes
    const results = [];
    let allTestsPassed = true;

    // Run code against each test case
    for (const testCase of problem.testCases) {
      try {
        // Create submission to Judge0 API
        const submissionResponse = await fetch(
          `${process.env.JUDGE0_API_URL}/submissions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              source_code: code,
              language_id: language,
              stdin: testCase.input,
              expected_output: testCase.output,
              cpu_time_limit: problem.timeLimit,
              memory_limit: problem.memoryLimit,
            }),
          }
        );

        const { token } = await submissionResponse.json();

        // Get submission result
        const resultResponse = await fetch(
          `${process.env.JUDGE0_API_URL}/submissions/${token}?base64_encoded=false&fields=status_id,stdout,time,memory,stderr,compile_output`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await resultResponse.json();

        // Compare output with expected output
        const testCaseResult = {
          passed: result.stdout.trim() === testCase.output.trim(),
          executionTime: result.time,
          memory: result.memory,
          status: result.status_id,
          error: result.stderr || result.compile_output,
        };

        results.push(testCaseResult);
        if (!testCaseResult.passed) {
          allTestsPassed = false;
        }
      } catch (error) {
        console.error("Error processing test case:", error);
        results.push({
          passed: false,
          error: "Internal server error while processing test case",
        });
        allTestsPassed = false;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        allTestsPassed,
        results,
      },
    });
  } catch (error) {
    console.error("Error validating submission:", error);
    res.status(500).json({
      success: false,
      message: "Error validating submission",
      error: error.message,
    });
  }
};

module.exports = {
  validateSubmission,
};
