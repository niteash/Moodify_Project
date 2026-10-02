const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = Router();

router.post("/register", authController.RegisterUser);

router.post("/login", authController.LoginUser);

router.get("/get-me", authMiddleware.authUser, authController.getMe);

router.get("/log-out", authController.LogOutUser);

module.exports = router;
