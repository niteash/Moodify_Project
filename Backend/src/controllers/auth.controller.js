const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const blackListModel = require("../models/blacklist.model");
const redis = require("../config/cache");

async function RegisterUser(req, res) {
  const { username, email, password } = req.body;

  const isAlreadyRegistered = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (isAlreadyRegistered) {
    return res.status(400).json({
      message: "User is already existed",
    });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    username,
    password: hash,
    email,
  });

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "3d",
    },
  );

  res.cookie("token", token);
  return res.status(201).json({
    message: "User registered successfully.",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

async function LoginUser(req, res) {
  const { email, password, username } = req.body;

  const user = await userModel
    .findOne({
      $or: [{ username }, { email }],
    })
    .select("+password");

  if (!user) {
    return res.status(400).json({
      message: "Invalid credentials",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "3d",
    },
  );

  res.cookie("token", token);
  return res.status(201).json({
    message: "User logged in successfully.",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

async function getMe(req, res) {
  const user = await userModel.findById(req.user.id);

  res.status(200).json({
    message: "User fetched successfully...",
    user,
  });
}

async function LogOutUser(req, res) {
  const token = req.cookies.token;

  res.clearCookie("token");

  // await blackListModel.create({
  //   token,
  // });

  await redis.set(token, Date.now().toString(), "EX", 60 * 60);

  res.status(201).json({
    message: "Log out succesfully...",
  });
}

module.exports = { RegisterUser, LoginUser, getMe, LogOutUser };
