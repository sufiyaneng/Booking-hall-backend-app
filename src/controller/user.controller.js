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
  try {
    const { email, password } = req.body;

    // Check if both email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required!",
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "User not found!",
      });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        status: false,
        message: "Incorrect password!",
      });
    }

    // Exclude the password from the returned user data
    const userData = await User.findOne({ email }).select("-password");

    // Generate a JWT token
    const token = generateToken(user._id);

    // Define cookie options (secure: true in production)
    const options = {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true, // Makes the cookie accessible only through HTTP(S), not JavaScript
      maxAge: 1 * 60 * 60 * 1000, // 1 hour in milliseconds
    };

    // Set the token as a cookie and return the response
    res
      .cookie("token", token, options)
      .status(200)
      .json({
        status: true,
        data: userData,
        token,
        message: "User logged in successfully.",
      });
  } catch (error) {
    console.error("Error during user login:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error. Please try again later.",
    });
  }
};


export { signupUser, loginUser };
