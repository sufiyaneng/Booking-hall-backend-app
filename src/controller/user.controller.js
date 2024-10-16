import { User } from "../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: "1h",
  });
};

const signupUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // console.log("body", req.body);
    if ([username, email, password].some((field) => field.trim() === "")) {
      return res.status(400).json({ message: "all fields are required" });
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
      return res.status(400).json({ message: "user is already exist" });
    }

    const passwordbcrypt = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: passwordbcrypt,
    });

    if (!user) {
      return res.status(400).json({ message: "user is not created" });
    }

    return res
      .status(200)
      .json({ status: true, data: user, message: "user signup successfully." });
  } catch (error) {
    console.log("error in create user", error);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  // console.log("body",req.body)
  if (!email || !password) {
    return res
      .status(400)
      .json({ status: false, message: "username and password are required!!" });
  }

  const user = await User.findOne({ email });
  // console.log("user", user);
  if (!user) {
    return res.status(400).json({ status: false, message: "user not found!!" });
  }

  const pass = await bcrypt.compare(password, user.password);

  if (!pass) {
    return res
      .status(400)
      .json({ status: false, message: "password is incorrect!!" });
  }

  const data = await User.findOne({ email }).select("-password");

  const options = {
    secure: process.env.NODE_ENV === "production", // Set to true if using HTTPS
    maxAge: 1 * 60 * 60 * 1000, // Cookie expiry time
  };

  const token = generateToken(user?._id);

  // return res
  //   .status(200)
  //   .cookie("token",token,options)
  //   .json({ status: false, data: data,token:token, message: "user login successfully." });
  res.cookie("token", token, options).status(200).json({
    status: true,
    message: "User logged in successfully.",
  });
};

export { signupUser, loginUser };
