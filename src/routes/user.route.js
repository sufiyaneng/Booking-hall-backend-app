import { Router } from "express";
import { loginUser, signupUser } from "../controller/user.controller.js";

const userRoute = Router();

userRoute.post("/create-user",signupUser);
userRoute.post("/login-user",loginUser);

export default userRoute;