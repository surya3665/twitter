const UserModel = require("../models/User.model");
const { v2 } = require("cloudinary");
const PostModel = require("../models/Post.model");
const NotificationModel = require("../models/Notification.model");

const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id;
    const user = await UserModel.find(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    if (!text && !img) {
      return res.status(400).json({ error: "Post must have text or image" });
    }

    if (img) {
      const uploadedResponse = await v2.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new PostModel({
      user: userId,
      text,
      img,
    });
    await newPost.save();
    return res.status(201).json(newPost);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const comment = { user: userId, text };
    post.comments.push(comment);
    await post.save();
    res.status(200).json(post);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(400).json({ error: "Post not found" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this post" });
    }
    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await v2.uploader.destroy(imgId);
    }
    await PostModel.findByIdAndDelete(req.params.id);
    return res.status(200).json({ msg: "Post deleted successfully" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const likeDislikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const userLikePost = post.likes.includes(userId);
    if (userLikePost) {
      await PostModel.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await UserModel.updateOne(
        { _id: userId },
        { $pull: { likedPosts: postId } }
      );

      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      return res.status(200).json(updatedLikes);
    } else {
      post.likes.push(userId);
      await post.save();
      const notification = await NotificationModel({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
      await UserModel.updateOne(
        { _id: userId },
        { $push: { likedPosts: postId } }
      );
      const updatedLikes = post.likes;
      return res.status(200).json(updatedLikes);
    }
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    if (posts.length == 0) {
      return res.status(200).json([]);
    }
    return res.status(200).json(posts);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getLikedPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const likedPosts = await PostModel.find({ _id: { $in: user.likedPosts } })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    return res.status(200).json(likedPosts);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const following = user.following;
    const feedPosts = await PostModel.find({ user: { $in: following } })
      .sort({
        createdAt: -1,
      })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    return res.status(200).json(feedPosts);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { userName } = req.params;
    const user = await UserModel.findOne({ userName });
    if (!user) return res.status(404).json({ error: "User not found" });
    const posts = await PostModel.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    return res.status(200).json(posts);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createPost,
  deletePost,
  likeDislikePost,
  commentPost,
  getAllPosts,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
};
