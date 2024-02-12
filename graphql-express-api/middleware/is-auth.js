const { verify } = require("jsonwebtoken");
const CastomError = require("../utils/error");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  // console.log(authHeader);
  if (!authHeader) {
    req.isUser = false;
    return next();
  }
  let token = "";
  if (authHeader) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    req.isUser = false;
    next();
  }
  try {
    const decode = verify(token, "allmubin5refdvdv32vd53dvfded");
    // console.log(decode);
    const user = await User.findById(decode.id);
    if (!user) {
      req.isUser = false;
      res.statusCode = 422;
      next();
    }
    // console.log(user);
    req.userId = user.id.toString();
    res.statusCode = 200;
    req.isUser = true;
    next();
  } catch (e) {
    console.log(e.message);
    req.isUser = false;
    res.statusCode = 422;
    next();
  }
};
