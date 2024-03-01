const express = require("express");
const router = express.Router();
const { version, author, documentation } = require("../package.json");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).json({
    message:
      "Welcome to the Pinterest API, please look at the documentation for more information",
    author: author,
    version: version,
  });
});
router.get("/documentation", function (req, res, next) {
  res.status(200).json({
    message: "Read Documentation in the Readme file",
    documentation: documentation,
    author: author,
    version: version,
  });
});

module.exports = router;
