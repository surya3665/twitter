const NotificationModel = require("../models/Notification.model");

const getNotificationController = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await NotificationModel.find({ to: userId }).populate(
      {
        path: "from",
        select: "userName profileImg",
      }
    );

    await NotificationModel.updateMany({ to: userId }, { read: true });
    return res.status(200).json(notifications);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: "Internnal server error" });
  }
};
const deleteAllNotificationController = async (req, res) => {
  try {
    const userId = req.user._id;
    await NotificationModel.deleteMany({ to: userId });
    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteNotificationController = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;

    const notification = await NotificationModel.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    if (notification.to.toString() !== userId.toString()) {
      return res
        .status(404)
        .json({ error: "You are not allowed to delete this notification" });
    }
    await NotificationModel.findByIdAndDelete(notificationId);
    return res.status(200).json({ msg: "notification deleted successfully" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getNotificationController,
  deleteAllNotificationController,
  deleteNotificationController,
};
