const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

router.post("/", userController.register);
router.post("/login", userController.login);
router.get("/all", userController.getAllUsers);
router.get("/profile", auth, userController.getProfile);
router.put("/profile", auth, userController.updateProfile);

module.exports = router;
