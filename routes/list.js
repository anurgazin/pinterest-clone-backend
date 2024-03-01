const express = require("express");
const multer = require("multer");
const listController = require("./controllers/list_controllers");
const authenticate = require("./middleware/auth");

const router = express.Router();
const upload = multer();
/* GET images listing. */
router.get("/", authenticate, listController.getAllLists);
router.get("/:list_name", authenticate, listController.getListById);
router.post("/", authenticate, listController.addToList);
router.put("/remove_from", authenticate, listController.deleteFromList);
router.delete("/:list_name", authenticate, listController.deleteList);

module.exports = router;
