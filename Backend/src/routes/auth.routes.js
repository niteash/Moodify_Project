const { Router } = require("express");
const authController = require("../controllers/auth.controller");

const router = Router();

router.post("/register", authController.RegisterUser);

router.post("/login", authController.LoginUser);

module.exports = router;
