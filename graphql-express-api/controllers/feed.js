const Post = require("../models/post");
const User = require("../models/user");
const Castomerror = require("../utils/error");
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const Ip = require("ip");
const DeviceDetector = require("node-device-detector");
const io = require("../socket");

exports.getPosts = async (req, res, next) => {
  const page = req.query.page || 1;
  const parPage = req.query.limit || 2;

  try {
    const totalPost = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(totalPost > 2 ? (page - 1) * parPage : (page - 2) * parPage)
      .limit(parPage)
      .populate({ path: "creator", select: "name email _id" });
    res.status(200).json({
      posts: posts,
      totalItems: totalPost,
    });
  } catch (e) {
    console.log(e.message);
  }
};
exports.singlePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could Not Found Post");
        error.statusCode = 404;
        throw error;
      }
      console.log(post);
      res.status(200).json({
        post: post,
      });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

exports.createPost = async (req, res, next) => {
  const isError = validationResult(req);
  const title = req.body.title;
  const content = req.body.content;

  if (!isError.isEmpty()) {
    const errorMsg = isError.errors.map((i) => ({
      path: i.path,
      message: i.msg,
    }));

    const error = new Error(JSON.stringify(errorMsg));
    console.log("isError :", error);
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    castomError("Please Send Image File", 422);
  }
  try {
    const post = new Post({
      title: title,
      content: content,
      imageUrl: req.file.filename,
      creator: req.user.id,
    });

    const postData = await post.save();
    const user = await User.findById(req.user._id);
    user.posts.push(postData);
    user.save();

    const data = Object.values(postData)[1];
    data.creator = {
      name: req.user.name,
      email: req.user.email,
      _id: req.user._id,
    };
    const totalDocu = await Post.find().countDocuments();
    io.getIo().emit("posts", {
      action: "create",
      post: data,
      totalItems: totalDocu,
    });
    res.status(201).json({
      message: "Post created successfully!",
      post: data,
    });
  } catch (e) {
    console.log(e.message);
    castomError("Internal Server Error", 500);
  }
};

const castomError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

exports.postUpdate = async (req, res, next) => {
  const isError = validationResult(req);
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;

  console.log(req.body);

  if (!isError.isEmpty()) {
    Castomerror(isError.errors[0].msg, 422);
  }
  if (req.file) {
    imageUrl = req.file.filename;
  }
  if (!imageUrl) {
    const error = new Error("Image Not Found Plase Enter Image File");
    error.statusCode = 422;
    throw error;
  }

  try {
    const post = await Post.findById(postId).populate({
      path: "creator",
      select: "name email _id",
    });

    if (!(post.creator._id.toString() === req.user._id.toString())) {
      castomError("Unauthrize user ", 403);
    }

    if (!post) {
      castomError("Post Not Found", 404);
    }
    if (imageUrl !== "undefined" ? !(post.imageUrl === imageUrl) : null) {
      fileDelete(post.imageUrl);
    }
    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl !== "undefined" ? imageUrl : post.imageUrl;
    const postData = await post.save();
    io.getIo().emit("posts", { action: "update", post: postData });
    res.status(200).json(postData);
  } catch (e) {
    console.log(e.message);
    next(e);
  }
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  let post = null;
  const isUserPost = req.user.posts.toString().split(",").includes(postId);

  if (!isUserPost) {
    castomError("Unauthrize user ", 403);
  }

  Post.findByIdAndDelete(postId)
    .then((postData) => {
      // console.log(postData);
      if (!postData) {
        castomError("Post Not Found Not Deleted Post", 404);
      }
      post = postData;
      req.user.posts.pull(postId);
      return req.user.save();
    })
    .then((result) => {
      // console.log(result);
      io.getIo().emit("posts", { action: "delete", post: post._id });
      res.json({ message: "Delete Successfully", post: post });
      fileDelete(post.imageUrl || Date.now().toString());
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

const fileDelete = (fileName) => {
  const Fpath = path.join(__dirname, "../public/image", fileName);
  if (fs.existsSync(Fpath)) {
    fs.unlink(Fpath, () => {
      console.log("File Deleted successful");
    });
  }
};
