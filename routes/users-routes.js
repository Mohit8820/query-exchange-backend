const express = require("express");

const usersController = require("../controllers/users-controllers");

const router = express.Router();

router.get("/", usersController.getUsers);
router.get("/:uid", usersController.getUserbyId);

router.post("/otp", usersController.otpMail);

router.post("/signup", usersController.signup);

router.post("/login", usersController.login);

module.exports = router;
