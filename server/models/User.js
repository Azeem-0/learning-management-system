const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: String,
  userEmail: String,
  password: String,
  role: String,
  regd: String,
  branch: String,
  year:String, 
});

module.exports = mongoose.model("User", UserSchema);
