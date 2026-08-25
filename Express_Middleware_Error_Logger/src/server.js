import express from "express";

const app = express();

app.use(express.json());

// Custom Logger Middleware
app.use((req, res, next) => {
  console.log(
    `${req.method} ${req.url} - ${new Date().toISOString()}`
  );
  next();
});

// Sample API Route
app.get("/api/profile", (req, res) => {
  res.json({
    success: true,
    message: "Profile loaded successfully",
    data: {
      name: "Developer",
      role: "Full Stack Developer"
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

app.listen(5001, () => {
  console.log("Server running on port 5001");
});
