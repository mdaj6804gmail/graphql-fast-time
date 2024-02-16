const auth_Fun = require("./auth_resolver");
const postFunc = require("./Post_resolver");

module.exports = {
  // user
  createUser: auth_Fun.createUser,
  login: auth_Fun.login,

  // login
  createPost: postFunc.createPost,
  getPosts: postFunc.getPosts,
  post: postFunc.post,
  deletePost: postFunc.deletePost,
  updatePost: postFunc.updatePost,
};
