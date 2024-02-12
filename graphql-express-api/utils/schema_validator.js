const joi = require("joi");
const User = require("../models/user");

const UserValid = joi.object({
  email: joi.string().trim().email().required(),
  name: joi.string().trim().min(3).required(),
  password: joi.string().trim().min(4).required(),
});
exports.UserLoginValid = joi.object({
  email: joi.string().trim().email().required(),
  password: joi.string().trim().min(4).required(),
});

exports.validPost = joi.object({
  title: joi.string().min(3).trim().required(),
  imageUrl: joi.string().min(3).trim().required(),
  content: joi.string().min(3).trim().required(),
});

exports.userSchema = UserValid;
