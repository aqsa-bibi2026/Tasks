import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Hello World",
    data: {
      project: "Task 01 - Node.js Custom API Server"
    },
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});