import { Todo } from "../model/todo.model.js";
import { User } from "../model/user.model.js";
import moment from "moment";

const createBooking = async (req, res) => {
  try {
    const {
      customerName,
      address,
      phone,
      description,
      completed = false,
      bookingDate,
      bookSession,
      eventType,
      amountPaid,
    } = req.body;

    if (
      !customerName ||
      !address ||
      !phone ||
      !description ||
      !bookingDate ||
      !bookSession ||
      !eventType ||
      amountPaid === undefined
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Ensure string fields are not empty after trimming
    if (
      [
        customerName,
        address,
        phone,
        description,
        bookingDate,
        bookSession,
        eventType,
      ].some((field) => field.trim() === "")
    ) {
      return res.status(400).json({ error: "No field can be empty." });
    }
    const checkBookingDate = await Todo.find({
      bookingDate: new Date(bookingDate),
    });

    // console.log("checkBookingDate", checkBookingDate);
    if (checkBookingDate.length > 0) {
      return res.status(400).json({ error: "Booking date already exists." });
    }
    // Create a new Todo associated with the authenticated user
    const todo = await Todo.create({
      user: req.user._id, // Associate the Todo with the authenticated user
      customerName,
      address,
      phone,
      description,
      completed: completed || false,
      bookingDate: new Date(bookingDate),
      bookSession,
      eventType,
      amountPaid,
    });

    return res.status(201).json({ data: todo });
  } catch (error) {
    console.error("Error creating todo:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the todo." });
  }
};

const getCustomerBooking = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(400).json({ error: "user not found." });
    }
    const booking = await Todo.find({ user: user._id });
    if (!booking.length) {
      return res.status(400).json({ error: "booking not found." });
    }

    return res
      .status(200)
      .json({ data: booking, message: "booking fetched successfully" });
  } catch (error) {
    console.error("Error getting booking:", error);
    res.status(500).json({ error: "An error occurred while getAllBooking." });
  }
};

const getAllCustomerBooking = async (req, res) => {
  // localhost/getAllcustomerBooking?customerName=""&bookingDate=""&limit=30&page:2
  try {
    const {
      bookingDate,
      startDate,
      endDate,
      customerName,
      page = 1,
      limit = 10,
    } = req.query;
    // console.log("all bookings", bookingDate, page, limit);
    let query = {};
    console.log("query", query);
    if (customerName) {
      query.customerName = customerName;
    }

    // Filter by bookingDate (single day)
    if (bookingDate) {
      const date = moment(bookingDate, "YYYY-MM-DD", true);
      if (!date.isValid()) {
        return res.status(400).json({ error: "Invalid bookingDate format." });
      }
      const startOfDay = date.startOf("day").toDate();
      const endOfDay = date.endOf("day").toDate();
      console.log("startOfDay, endOfDay",startOfDay, endOfDay)
      query.bookingDate = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }
    //filter by date range (startDate and endDate)
    else if (startDate && endDate) {
      const start = moment(startDate, "YYYY-MM-DD", true);
      const end = moment(endDate, "YYYY-MM-DD", true);

      if (!start.isValid() || !end.isValid()) {
        return res.status(400).json({ error: "Invalid date range format." });
      }
      const startOfStartDate = start.startOf("day").toDate();
      const endOfEndDate = end.endOf("day").toDate();

      query.bookingDate = {
        $gte: startOfStartDate,
        $lt: endOfEndDate,
      };
    }
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    console.log("skip",skip)
    const allCustomerBooking = await Todo.find(query)?.skip(skip)?.limit(limit);
    if (!allCustomerBooking.length) {
      return res.status(400).json({ error: "booking not found." });
    }
    // Optionally, count total bookings for pagination metadata
    const totalBookings = await Todo.countDocuments(query);
    return res.status(200).json({
      data: allCustomerBooking,
      totalPages: Math.ceil(totalBookings / limit),
      currentPage: parseInt(page),
      message: "All booking fetched successfully",
    });
  } catch (error) {
    console.error("Error getting booking:", error);
    res.status(500).json({ error: "An error occurred while getAllBooking." });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const id = req.params.id;
    const todo = await Todo.findOneAndDelete({ _id: id, user: req?.user?._id });

    if (!todo) {
      return res.status(404).json({ error: "Booking not found." });
    }

    return res
      .status(200)
      .json({ data: {}, message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ error: "An error occurred while delet Booking." });
  }
};

const updateBooking = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({ error: "user not found." });
    }

    const updatedBooking = await Todo.findByIdAndUpdate(id, {
      $set: updatedData,
    });

    if (!updatedBooking) {
      res.status(401).json({ error: "An updated booking not found" });
    }
    return res
      .status(200)
      .json({ data: updatedBooking, message: "Booking updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while Update Booking." });
  }
};

export {
  createBooking,
  getCustomerBooking,
  deleteBooking,
  updateBooking,
  getAllCustomerBooking,
};
