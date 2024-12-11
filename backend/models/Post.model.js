const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    text: String,
    img: String,
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "Users",
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const PostModel = mongoose.model("Posts", PostSchema);

module.exports = PostModel;
