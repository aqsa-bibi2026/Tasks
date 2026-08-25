const users = require("../models/User");

exports.getUsers = (req,res)=>{
  res.json(users);
};

exports.getUserById = (req,res,next)=>{
  const user = users.find(
    u => u.id === Number(req.params.id)
  );

  if(!user){
    const error = new Error("UserNotFoundError");
    error.status = 404;
    return next(error);
  }

  res.json(user);
};

exports.createUser = (req,res,next)=>{
  const {name,email} = req.body;

  if(!name || !email){
    const error = new Error("InvalidUserError");
    error.status = 400;
    return next(error);
  }

  const user = {
    id:users.length + 1,
    name,
    email
  };

  users.push(user);

  res.json({
    message:"User created successfully",
    user
  });
};
