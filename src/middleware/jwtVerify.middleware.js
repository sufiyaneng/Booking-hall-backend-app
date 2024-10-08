import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";

const jwtVerify = async (req, res, next) => {
  try {
    const token = req.cookies.token; // Access token from cookies
    console.log("token",token)
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findById(decoded.id).select("-password"); // Get user without password

    if (!user) {
      return res.status(401).json({ msg: "User not found, authorization denied" });
    }

    req.user = user; // Attach user to request
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(401).json({ msg: "Token verification failed, authorization denied" });
  }
};

export default jwtVerify;


