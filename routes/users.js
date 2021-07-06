const { Router } = require("express");

const userController = require("../controllers/userController");
const { authenticated } = require("../middleware/auth");

const router = new Router();

router.get("/login", userController.login);
router.post("/login", userController.handleLogin, userController.rememberMe);

router.get("/logout", authenticated, userController.logout);

router.get("/register", userController.register);
router.post("/register", userController.createUser);

router.get("/forget-pass", userController.forgetPassword);
router.post("/forget-pass", userController.handleForgetPassword);

router.get("/reset-pass/:token", userController.resetPassword);
router.post("/reset-pass/:id", userController.handleResetPassword);

module.exports = router;
