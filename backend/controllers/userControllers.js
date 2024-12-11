const UserModel = require("../models/User.model");
const NotificationModel = require("../models/Notification.model");
const bcrypt = require("bcryptjs");
const { v2 } = require("cloudinary");
const getUserProfileController = async (req, res) => {
  try {
    const { userName } = req.params;
    const user = await UserModel.findOne({ userName }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "user not found", success: false });
    }
    res.status(200).json(user);
  } catch (err) {
    console.log(err.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

const followUnfollowUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await UserModel.findById(id);
    const currentUser = await UserModel.findById(req.user._id);
    if (id == req.user._id) {
      return res.status(400).json({
        error: "You can't follow/unfollow yourself",
        success: false,
      });
    }
    if (!currentUser || !userToModify) {
      return res.status(400).json({ error: "User not found", success: false });
    }

    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      await UserModel.findByIdAndUpdate(id, {
        $pull: { followers: req.user._id },
      });
      await UserModel.findByIdAndUpdate(req.user._id, {
        $pull: { following: id },
      });
      res.status(200).json({ msg: "User unfollowed successfull" });
    } else {
      await UserModel.findByIdAndUpdate(id, {
        $push: { followers: req.user._id },
      });
      await UserModel.findByIdAndUpdate(req.user._id, {
        $push: { following: id },
      });
      const newNotification = new NotificationModel({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });
      await newNotification.save();
      res.status(200).json({ msg: "User followed successfull" });
    }
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

const getSuggestedProfileController = async (req, res) => {
  try {
    const userId = req.user._id;
    const userFollowedByMe = await UserModel.findById(userId).select(
      "following"
    );
    const users = await UserModel.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);

    const filteredUsers = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id)
    );
    const suggestedUser = filteredUsers.slice(0, 5);
    suggestedUser.forEach((user) => (user.password = ""));
    return res.status(200).json({ msg: "suggested users", suggestedUser });
  } catch (err) {
    console.log(err.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

const updateUserProfileController = async (req, res) => {
  try {
    let { fullName, userName, email, currentPassword, newPassword, bio, link } =
      req.body;
    let { profileImg, coverImg } = req.body;
    const userId = req.user._id;
    let user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (profileImg || coverImg) {
      if (profileImg) {
        if (user.profileImg) {
          await v2.uploader.destroy(
            user.profileImg.split("/").pop().split(".")[0]
          );
        }
        const uploadedResponse = await v2.uploader.upload(profileImg);
        profileImg = uploadedResponse.secure_url;
      }
      if (coverImg) {
        if (user.coverImg) {
          await v2.uploader.destroy(
            user.coverImg.split("/").pop().split(".")[0]
          );
        }
        const uploadedResponse = await v2.uploader.upload(coverImg);
        coverImg = uploadedResponse.secure_url;
      }
      user.profileImg = profileImg || user.profileImg;
      user.coverImg = coverImg || user.coverImg;
      user = await user.save();
      return res.status(200).json({ msg: "img updated" });
    }

    if (!newPassword || !currentPassword) {
      return res.status(400).json({
        error: "Please provide both current password and new password",
      });
    }
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ error: "Current Password is incorrect" });
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }
      user.password = await bcrypt.hash(newPassword, 8);
    }
    user.fullName = fullName || user.fullName;
    user.userName = userName || user.userName;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    user = await user.save();
    user.password = null;
    return res.status(200).json({ user });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  getUserProfileController,
  getSuggestedProfileController,
  followUnfollowUserController,
  updateUserProfileController,
};
