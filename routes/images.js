const express = require("express");
const multer = require("multer");
const imageController = require("./controllers/images_controllers");
const authenticate = require("./middleware/auth");

const router = express.Router();
const upload = multer();
/* GET images listing. */
router.get("/", authenticate, imageController.getImages);
router.delete("/delete/:image_id", authenticate, imageController.deleteImage);
router.get("/:image_id", authenticate, imageController.getImageById);
router.post(
  "/",
  authenticate,
  upload.single("image"),
  imageController.addImage
);

module.exports = router;
