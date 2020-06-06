const express = require("express");
const router = express.Router();
const Authentication = require("../middlewares/authentication");
const UserController = require("../controllers/UserController");

router.post("/register",UserController.CreateUser);
router.post("/login",UserController.UserLogin);
router.get("/user",Authentication,UserController.GetUser);

module.exports = router;