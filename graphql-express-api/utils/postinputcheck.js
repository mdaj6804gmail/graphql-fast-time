const { body } = require("express-validator");
const User = require("../models/user");

exports.PostInputCheck = [
  body("title", "minimum length 4").trim().isLength({ min: 4 }),
  body("content", "minimum length 4").trim().isLength({ min: 4 }),
];

exports.signup_check = [
  body("email")
    .notEmpty()
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please Enter valid Email")
    .custom(async (value) => {
      console.log(value);
      const user = await User.findOne({ email: value });
      console.log(user);
      if (user) {
        throw new Error("Email Already Exist Please try Again");
      }
      return true;
    }),
  body("password").trim().isLength({ min: 4 }).notEmpty(),
  body("name").trim().notEmpty(),
];
exports.login_check = [
  body("email")
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage("Please Enter valid Email")
    .custom(async (value, { req }) => {
      const isUser = await User.findOne({ email: value });
      if (!isUser) {
        const error = new Error("Email not found Please Try Again");
        error.statusCode = 404;
        throw error;
      }
      req.user = isUser;
      return true;
    }),
  body("password").trim().isLength({ min: 5 }).notEmpty(),
];
