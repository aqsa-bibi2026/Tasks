require("dotenv").config();

const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
  res.json({
    message:"Production API Running"
  });
});

app.use("/users", userRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, ()=>{
  console.log("Express Production API Started");
  console.log(`Server running on port ${PORT}`);
});
