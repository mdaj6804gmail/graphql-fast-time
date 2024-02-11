const express = require("express");
const fileUpload = require("../utils/fileUpload");
const feedController = require("../controllers/feed");
const { PostInputCheck } = require("../utils/postinputcheck");
const fs = require("fs");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

// GET /feed/posts
router.get("/posts", isAuth, feedController.getPosts);
router.get("/post/:postId", isAuth, feedController.singlePost);

// POST /feed/post
router.post(
  "/post",
  isAuth,
  fileUpload(),
  PostInputCheck,
  feedController.createPost,
);

router.put(
  "/post/:postId",
  isAuth,
  fileUpload(),
  PostInputCheck,
  feedController.postUpdate,
);

router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;
