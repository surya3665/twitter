const UserModel = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jsonWebToken = require("jsonwebtoken");

const signupController = async (req, res) => {
  try {
    const { fullName, userName, email, password } = await req.body;
    console.log(req.body)
    const existingUser = await UserModel.findOne({ userName: userName });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username is already taken", success: false });
    }
    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ error: "Email is already taken", success: false });
    }
    if (password.length < 6) {
      return res.status(400).json({
        error: "password must be at least 6 characters long",
        success: false,
      });
    }
    const hassedPassword = bcrypt.hashSync(password, 8);
    const newUser = await UserModel.create({
      fullName: fullName,
      userName: userName,
      email: email,
      password: hassedPassword,
    });

    const token = jsonWebToken.sign(
      { userId: newUser._id },
      process.env.JWT_KEY
    );

    newUser.password = "";
    return res.status(201).cookie("token", token).json({
      success: true,
      newUser,
      msg: "Account created successfully",
    });
  } catch (err) {
    console.log(err.message);
    return res.json({ success: false, error: "Internal Server Error" });
  }
};

const loginController = async (req, res, next) => {
  try {
    const { userName, password } = req.body;
    const user = await UserModel.findOne({ userName });
    const isPasswordCorrect = bcrypt.compareSync(
      password,
      user?.password || ""
    );
    if (!user || !isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });
    }
    const token = jsonWebToken.sign({ userId: user._id }, process.env.JWT_KEY);
    user.password = "";

    return res
      .status(200)
      .cookie("token", token)
      .json({ success: true, user, msg: "Account signin successfully" });
  } catch (err) {
    console.log(err.message);
    return res.json({ success: false, error: "Internal Server Error" });
  }
};

const logoutController = async (req, res, next) => {
  try {
    res
      .clearCookie("token")
      .status(200)
      .json({ success: true, msg: "logout successfully" });
  } catch (err) {
    console.log(err.message);
    return res.json({ success: false, error: "Internal Server Error" });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id).select("-password");
    return res.status(200).json({ success: true, msg: user });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, error: "Internal Server Error" });
  }
};



module.exports = {
  signupController,
  loginController,
  logoutController,
  getUser,
};
