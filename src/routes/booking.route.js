import { Router } from "express";
import {
  createBooking,
  getCustomerBooking,
  getAllCustomerBooking,
  deleteBooking,
  getAllCustomerInCalendar,
  updateBooking,
} from "../controller/booking.controller.js";
import jwtVerify from "../middleware/jwtVerify.middleware.js";

const bookingRoute = Router();

bookingRoute.post("/createbooking", jwtVerify, createBooking);
bookingRoute.get("/getbooking", jwtVerify, getCustomerBooking);
bookingRoute.get("/getallbooking", getAllCustomerBooking);
bookingRoute.get("/getallcustomer", getAllCustomerInCalendar);
bookingRoute.delete("/deletebooking/:id", jwtVerify, deleteBooking);
bookingRoute.put("/editbooking/:id", jwtVerify, updateBooking);

export default bookingRoute;
