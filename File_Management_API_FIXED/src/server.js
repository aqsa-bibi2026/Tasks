require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const fileRoutes = require("./routes/fileRoutes");

if (!fs.existsSync("src/uploads")) {
  fs.mkdirSync("src/uploads", { recursive: true });
}

const app = express();

app.use(cors());
app.use(express.json());

app.use("/files", fileRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("File Management API Started");
  console.log(`Server running on port ${PORT}`);
});
