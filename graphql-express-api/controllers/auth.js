const { validationResult } = require("express-validator");
const User = require("../models/user");
const CastomError = require("../utils/error");
const { hash, compare } = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
  const { email, password, name } = req.body;
  const isvalidate = validationResult(req);

  if (!isvalidate.isEmpty()) {
    const errorData = isvalidate.errors.map((item) => ({
      message: item.msg,
      path: item.path,
      value: item.value,
    }));
    const error = new Error();
    error.error = errorData;
    error.statusCode = 422;
    throw error;
  }

  hash(password, 12, (err, hasPass) => {
    if (err) {
      console.log("Hash Err", err);
      CastomError("server Error", 500);
    }
    User.create({ email, password: hasPass, name })
      .then((user) => {
        if (!user) {
          CastomError("User Not Created ", 422);
        }
        return res
          .status(201)
          .json({ message: "User Created successful", user });
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  const isvalidate = validationResult(req);

  if (!isvalidate.isEmpty()) {
    const error = new Error(isvalidate.errors[0].msg);
    error.statusCode = 404;
    error.errors = isvalidate.errors.map((i) => ({
      value: i.value,
      message: i.msg,
      path: i.path,
    }));
    throw error;
  }

  compare(password, req.user.password, (err, isuser) => {
    if (err) {
      CastomError(err.message, 500);
    }

    if (isuser) {
      const userdata = {
        email: req.user.email,
        userId: req.user.id.toString(),
      };

      return jwt.sign(
        { ...userdata },
        "mynameisAllMubinRafi360",
        { expiresIn: "1h" },
        (err, token) => {
          if (err) {
            console.log("Token :", err);
            CastomError(err.message, 500);
          }
          // console.log("Token =", token);
          return res.status(200).json({
            message: "User Login Successful",
            userId: userdata.userId,
            token: token,
          });
        },
      );
    }
    return res.status(422).json({ message: "User Not Login" });
  });
};
