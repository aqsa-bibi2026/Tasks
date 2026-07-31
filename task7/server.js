require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Supabase Auth API is running",
  });
});

app.use("/auth", authRoutes);

app.get("/profile", authMiddleware, (req, res) => {

  res.json({
    success: true,
    message: "Protected route accessed",
    user: req.user,
  });

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});