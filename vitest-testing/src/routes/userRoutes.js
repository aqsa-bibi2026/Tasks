import express from "express";

const userRoutes = express.Router();

userRoutes.get("/users", (req, res) => {
  res.status(200).json({
    success: true,
    users: [
      {
        id: 1,
        name: "Aqsa"
      },
      {
        id: 2,
        name: "Ahmed"
      }
    ]
  });
});

export default userRoutes;