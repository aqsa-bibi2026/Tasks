import express from "express";
import { validateUser } from "./middleware/validateUser.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Zod Validation API is running!");
});

app.post("/users", validateUser, (req, res) => {
  res.status(201).json({
    success: true,
    message: "User created successfully",
    user: req.body,
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});