const {
  getUserProfileController,
  getSuggestedProfileController,
  followUnfollowUserController,
  updateUserProfileController,
} = require("../controllers/userControllers");
const { protectRoute } = require("../middleware/ProtectRoute");
const router = require("express").Router();

router.get("/profile/:userName", protectRoute, getUserProfileController);
router.get("/suggested", protectRoute, getSuggestedProfileController);
router.post("/follow/:id", protectRoute, followUnfollowUserController);
router.put("/update", protectRoute, updateUserProfileController);

module.exports = router;
