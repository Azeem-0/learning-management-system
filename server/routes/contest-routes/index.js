const express = require("express");
const {
  createContest,
  getAllContests,
} = require("../../controllers/contest-controller");
const authenticate = require("../../middleware/auth-middleware");

const router = express.Router();

router.post("/create", authenticate, createContest);
router.get("/all", getAllContests);

module.exports = router;
