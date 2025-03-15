const express = require("express");
const {
  validateSubmission,
} = require("../../controllers/contest-controller/submission-controller");
const authenticate = require("../../middleware/auth-middleware");
const router = express.Router();

router.post("/submit", authenticate, validateSubmission);

module.exports = router;
