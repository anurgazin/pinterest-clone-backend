const express = require("express");
const userController = require("./controllers/users_controllers");
const authenticate = require("./middleware/auth");
const router = express.Router();

/* GET users listing. */
router.get("/", authenticate, userController.getUsers);
router.get("/:user_id", authenticate, userController.getUserById);
router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);

module.exports = router;
