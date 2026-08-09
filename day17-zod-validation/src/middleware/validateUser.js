import { userSchema } from "../schemas/userSchema.js";

export const validateUser = (req, res, next) => {
  const result = userSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.issues,
    });
  }

  req.body = result.data;

  next();
};
