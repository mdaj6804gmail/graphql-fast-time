exports.access = async (req, res, next) => {
  // console.log(req.isUser, req.userId);
  if (req.isUser) {
    // const error = new Error("User Not Authenticated");
    // error.status = 401;
    return res.status(401).send("User Not Authenticated");
  }
  next();
};
