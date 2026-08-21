require("dotenv").config();

const express = require("express");
const logger = require("./utils/logger");
const testRoutes = require("./routes/testRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.originalUrl
  });

  next();
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Node.js Error Logging API"
  });
});

app.use("/api/test", testRoutes);

app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);

  error.statusCode = 404;

  next(error);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});