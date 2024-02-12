const User = require("../models/user");
const Post = require("../models/post");
const { hash, compare } = require("bcrypt");
const { checkSchema } = require("express-validator");
const jwt = require("jsonwebtoken");
const {
  validPost,
  userSchema,
  UserLoginValid,
} = require("../utils/schema_validator");
const Joi = require("joi");

const CastomError = (msg, status, path) => {
  const error = new Error(msg);
  error.status = status || 500;
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
      // console.log("isUser.error.message :", isUser.error);
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
      status: 201,
      id: created._id.toString(),
    };
  },

  login: async ({ email, password }, req) => {
    const validData = UserLoginValid.validate({ email, password });
    if (validData.error) {
      const { error } = validData;
      CastomError(error.message, 422, error.details[0].path[0]);
    }

    const isUser = await User.findOne({ email: email });
    // console.log(isUser);
    // User Check
    if (!isUser) {
      CastomError("User Not Found", 404);
    }

    // Password Check
    const validPass = await compare(password, isUser.password);
    if (!validPass) {
      CastomError("Password Not Match", 403);
    }
    const token = await jwt.sign(
      {
        email: isUser.email,
        id: isUser._id.toString(),
        name: isUser.name,
      },
      "allmubin5refdvdv32vd53dvfded",
      { expiresIn: "1h" },
    );
    return {
      status: 200,
      userId: isUser._id.toString(),
      token: token,
    };
  },
  createPost: async function ({ input }, req) {
    if (!req.isUser) {
      CastomError("User Not Login", 422);
    }

    // input Validation check
    const isPost = validPost.validate(input);
    if (isPost.error) {
      CastomError(isPost.error.message, 422, isPost.error.details[0].path[0]);
    }

    //Check Login user
    const isUser = await User.findById(req.userId);
    if (!isUser) {
      CastomError("User Not Found", 404);
    }

    const post = new Post({
      title: input.title,
      content: input.content,
      imageUrl: input.imageUrl,
      creator: isUser,
    });

    const createPost = await post.save();
    isUser.posts.push(post);
    await isUser.save();

    return {
      ...createPost._doc,
      id: createPost.id.toString(),
    };
  },
};
