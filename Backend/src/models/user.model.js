const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: [true, "Username must be uniqued"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: [true, "Email must be uniqued"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
});

// Task to do

// userSchema.pre("save", function (next) {});
// userSchema.post("save", function (next) {});

const userModel = mongoose.model("Users", userSchema);

module.exports = userModel;
