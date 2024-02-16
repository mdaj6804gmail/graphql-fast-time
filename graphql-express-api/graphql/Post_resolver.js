const Post = require("../models/post");
const CastomError = require("../utils/error");
const { validPost, updateValdPost } = require("../utils/schema_validator");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");

const isauth = (auth, msg, status) => {
  if (auth) {
    CastomError(msg, status);
  }
};

exports.getPosts = async ({ page }, req) => {
  isauth(!req.isUser, "User Not Authenticated", 401);
  const totalPost = await Post.find().countDocuments();
  const post = await Post.find()
    .sort({ createdAt: -1 })
    .skip(((page || 1) - 1) * 2)
    .limit(2)
    .populate("creator");

  return {
    posts: post.map((p) => ({
      ...p._doc,
      createdAt: p.createdAt.toString(),
      updatedAt: p.updatedAt.toString(),
      _id: p._id.toString(),
    })),
    totalPost: totalPost,
  };
};

exports.post = async ({ id }, req) => {
  isauth(!req.isUser, "User Not Authenticated", 401);

  try {
    if (id.length !== 24) {
      CastomError("Product ID Not Valid", 401);
      return;
    }
    const post = await Post.findById(id).populate("creator");
    if (!post) {
      CastomError("Post Not Found", 404);
    }
    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toString(),
      updatedAt: post.updatedAt.toString(),
    };
  } catch (e) {
    // console.log(e);
    CastomError(e.message, e.status);
  }
};

exports.createPost = async ({ input }, req) => {
  isauth(!req.isUser, "User Not Authenticated", 401);
  // input Validation check
  const isPost = validPost.validate(input);
  if (isPost.error) {
    CastomError(isPost.error.message, 422, isPost.error.details[0].path[0]);
  }

  //Check Login user
  const isUser = await User.findById(req.userId);

  isauth(!isUser, "User Not Authenticated", 401);

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
    _id: createPost.id.toString(),
  };
};

exports.deletePost = async ({ id }, req) => {
  isauth(!req.isUser, "User Not Authenticated", 401);
  const post = await Post.findById(id).populate("creator");

  isauth(
    post.creator._id.toString() !== req.userId,
    "This is not your post!",
    401,
  );
  try {
    const deletePosr = await Post.findByIdAndDelete(id);
    const user = await User.findById(req.userId);
    user.posts.pull(post._id);
    await user.save();
    await fileDelete(post.imageUrl);
    return {
      _id: post._id.toString(),
      message: "Post Deleted Successfully",
    };
  } catch (e) {
    console.log(e.message);
    CastomError(e.message, e.status);
  }
};

const fileDelete = async (name) => {
  try {
    const filepath = path.join(__dirname, "../public/image", name);
    const isFile = fs.existsSync(filepath);

    if (isFile) {
      await fs.unlink(filepath, (err) => {
        if (err) {
          console.log(err.message);
          CastomError(err.message, 422);
        }

        console.log("File Deleted");
      });
    }
  } catch (e) {
    console.log(e.message);
  }
};

exports.updatePost = async ({ input }, req) => {
  const { id, title, content, imageUrl } = input;
  isauth(!req.isUser, "User Not Authenticated", 401);
  //! input check
  const inputvalid = updateValdPost.validate(input);
  if (inputvalid.error) {
    CastomError(inputvalid.error.message, 403);
  }

  const post = await Post.findById(id).populate("creator");
  if (!post) {
    CastomError("Post Not Found", 404);
  }

  isauth(
    post.creator._id.toString() !== req.userId,
    "User Not Authenticated",
    401,
  );
  if (post.imageUrl !== imageUrl) {
    fileDelete(post.imageUrl);
  }

  post.title = title;
  post.content = content;
  post.imageUrl = imageUrl;
  const updatepost = await post.save();
  return {
    ...updatepost._doc,
    _id: updatepost._id.toString(),
    createdAt: updatepost.createdAt.toString(),
    updatedAt: updatepost.updatedAt.toString(),
  };
};
