const { verify, decode } = require("jsonwebtoken");
const CastomError = require("../utils/error");
const User = require("../models/user");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (
    authHeader === "null" ||
    authHeader === undefined ||
    authHeader === null
  ) {
    // console.log(authHeader === undefined);
    CastomError("User Not Authenticated", 401);
  }
  const token = authHeader.split(" ")[1];

  if (token === undefined || token === null) {
    CastomError("User Not Authenticated", 401);
  }

  return verify(token, "mynameisAllMubinRafi360", (err, decode) => {
    if (err) {
      // console.log(err, decode);
      CastomError(err.message, 401);
    }

    User.findById(decode.userId)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => {
        CastomError(err.message, 500);
      });
  });
};
