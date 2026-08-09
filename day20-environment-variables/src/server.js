require("dotenv").config();

const express = require("express");

const app = express();

const PORT = 3000;

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Check environment variables
console.log("Supabase URL:", supabaseUrl ? "Loaded ✅" : "Missing ❌");
console.log("Supabase Key:", supabaseKey ? "Loaded ✅" : "Missing ❌");

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Environment Variables API is running!",
    supabaseUrl: supabaseUrl ? "Loaded" : "Missing",
    supabaseKey: supabaseKey ? "Loaded" : "Missing",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});