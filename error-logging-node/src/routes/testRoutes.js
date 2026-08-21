const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Error Logging API is working"
  });
});

router.get("/error", (req, res, next) => {
  const error = new Error("This is a test error");

  error.statusCode = 500;

  next(error);
});

router.get("/user/:id", (req, res, next) => {
  const userId = req.params.id;

  if (userId !== "1") {
    const error = new Error("User not found");

    error.statusCode = 404;

    return next(error);
  }

  res.json({
    success: true,
    user: {
      id: 1,
      name: "Aqsa"
    }
  });
});

module.exports = router;