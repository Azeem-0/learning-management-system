const Contest = require("../../models/Contest");

const validateSubmission = async (req, res) => {
  try {
    const { contestId, problemId, code, language } = req.body.body;
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
    const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";
    // Run code against each test case
    for (const testCase of problem.testCases) {
      try {
        // Create submission to Judge0 API
        const submissionResponse = await fetch(
          `${JUDGE0_API_URL}/submissions`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "Content-Type": "application/json",
              "X-RapidAPI-Key":
                "d048904afamsh7c58dce1604a4e9p176967jsna9a437cfb37f",
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
            body: JSON.stringify({
              language_id: language,
              source_code: code,
              base64_encoded: false,
              stdin: testCase.input,
            }),
          }
        );
        const { token } = await submissionResponse.json();
        const resultResponse = await fetch(
          `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,status_id,compile_output,time`,
          {
            method: "GET",
            headers: {
              "X-RapidAPI-Key":
                "d048904afamsh7c58dce1604a4e9p176967jsna9a437cfb37f",
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
          }
        );

        const result = await resultResponse.json();
        console.log(
          result.stdout,
          testCase.output,
          result.stdout === testCase.output
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
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
