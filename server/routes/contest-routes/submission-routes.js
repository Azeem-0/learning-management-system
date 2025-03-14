const express = require("express");
const {
  validateSubmission,
} = require("../../controllers/contest-controller/submission-controller");
const authenticate = require("../../middleware/auth-middleware");
const router = express.Router();

router.post("/validate", authenticate, validateSubmission);

module.exports = router;
