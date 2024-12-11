const {
  createPost,
  likeDislikePost,
  commentPost,
  deletePost,
  getAllPosts,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
} = require("../controllers/postControllers");
const { protectRoute } = require("../middleware/ProtectRoute");

const router = require("express").Router();

router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/following", protectRoute, getFollowingPosts)
router.get("/allPost", protectRoute, getAllPosts);
router.post("/create", protectRoute, createPost);
router.get("/user/:userName", protectRoute, getUserPosts)
router.post("/like/:id", protectRoute, likeDislikePost);
router.post("/comment/:id", protectRoute, commentPost);
router.delete("/delete/:id", protectRoute, deletePost);
module.exports = router;
