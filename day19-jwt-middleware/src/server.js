const express = require("express");
const jwt = require("jsonwebtoken");

const authMiddleware = require("./authMiddleware");

const app = express();

app.use(express.json());

const JWT_SECRET = "my-super-secret-key";

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "JWT Middleware API is running!",
  });
});

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username !== "aqsa" || password !== "123456") {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  }

  const token = jwt.sign(
    {
      id: 1,
      username: "aqsa",
    },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  res.json({
    success: true,
    message: "Login successful",
    token,
  });
});

// Protected profile route
app.get("/profile", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "You can access this protected route!",
    user: req.user,
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});