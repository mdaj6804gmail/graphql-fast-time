const { Schema, model, Types } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    posts: [
      {
        type: Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true },
);

module.exports = model("User", userSchema);
