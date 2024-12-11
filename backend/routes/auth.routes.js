const {
  signupController,
  loginController,
  logoutController,
  getUser,
} = require("../controllers/authControllers");
const { protectRoute } = require("../middleware/ProtectRoute");
const router = require("express").Router();

router.get("/getUser", protectRoute, getUser);
router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/logout", logoutController);

module.exports = router;
