const {
  getNotificationController,
  deleteAllNotificationController,
  deleteNotificationController
} = require("../controllers/notificationControllers");
const { protectRoute } = require("../middleware/ProtectRoute");

const router = require("express").Router();
router.get("/", protectRoute, getNotificationController);
router.delete("/", protectRoute, deleteAllNotificationController);
router.delete("/:id", protectRoute, deleteNotificationController);

module.exports = router;
