import { Router } from "express";
import {
  createBooking,
  getCustomerBooking,
  getAllCustomerBooking,
  deleteBooking,
  updateBooking,
} from "../controller/todo.controller.js";
import jwtVerify from "../middleware/jwtVerify.middleware.js";

const todoRoute = Router();

todoRoute.post("/createbooking", jwtVerify, createBooking);
todoRoute.get("/getbooking", jwtVerify, getCustomerBooking);
todoRoute.get("/getallbooking", getAllCustomerBooking);
todoRoute.delete("/deletebooking/:id", jwtVerify, deleteBooking);
todoRoute.put("/editbooking/:id", jwtVerify, updateBooking);

export default todoRoute;
