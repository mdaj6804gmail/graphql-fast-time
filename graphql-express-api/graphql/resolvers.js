const User = require("../models/user");
const { hash, compare } = require("bcrypt");
const { checkSchema } = require("express-validator");
const jwt = require("jsonwebtoken");
const {
  validPost,
  userSchema,
  UserLoginValid,
} = require("../utils/schema_validator");
const Joi = require("joi");

const CastomError = (msg, code, path) => {
  const error = new Error(msg);
  error.code = code || 500;
  error.data = {
    message: msg || undefined,
    path: path || undefined,
  };
  throw error;
};

module.exports = {
  createUser: async ({ userInput }, req) => {
    const email = userInput.email;
    const name = userInput.name;
    const password = userInput.password;

    const isUser = userSchema.validate(userInput);
    if (isUser.error) {
      console.log("isUser.error.message :", isUser.error.message);
      CastomError(isUser.error.message, 422, isUser.error.details[0].path[0]);
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      CastomError("User exits already!", 422);
    }

    const hashPass = await hash(password, 12);
    const user = new User({
      email: email,
      name: name,
      password: hashPass,
    });

    const created = await user.save();
    // console.log(created);
    return {
      ...created._doc,
      _id: created._id.toString(),
    };
  },

  loginUser: async ({ input }, req) => {
    const validData = UserLoginValid.validate(input);
    if (validData.error) {
      const { error } = validData;
      CastomError(error.message, 422, error.details[0].path[0]);
    }

    const isUser = await User.findOne({ email: input.email });
    // User Check
    if (!isUser) {
      CastomError("User Not Found", 404);
    }
    // Password Check
    const validPass = await compare(input.password, isUser.password);
    if (!validPass) {
      CastomError("Password Not Match", 403);
    }
    const token = await jwt.sign(
      {
        email: isUser.email,
        id: isUser._id.toString(),
      },
      "allmubin5refdvdv32vd53dvfded",
      { expiresIn: "1h" },
    );
    return {
      ...isUser._doc,
      id: isUser._id.toString(),
      token: token,
    };
  },
};
