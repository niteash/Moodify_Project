const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redis = require("../config/cache");

async function RegisterUser(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required.",
      });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await userModel.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or username is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or username is already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

async function LoginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await userModel
      .findOne({ email: normalizedEmail })
      .select("+password");

    // Safe diagnostic: never log passwords or password hashes.
    console.log("Login diagnostic:", {
      emailProvided: true,
      userFound: Boolean(user),
      passwordHashExists: Boolean(user?.password),
    });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    console.log("Password matches:", passwordMatches);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

async function getMe(req, res) {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully.",
      user,
    });
  } catch (error) {
    console.error("Get user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

async function LogOutUser(req, res) {
  try {
    const token = req.cookies?.token;

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    if (token) {
      await redis.set(token, Date.now().toString(), "EX", 60 * 60);
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Logout failed.",
    });
  }
}

module.exports = {
  RegisterUser,
  LoginUser,
  getMe,
  LogOutUser,
};
