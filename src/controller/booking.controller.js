import { Booking } from "../model/booking.model.js";
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

    // Validate required fields
    if (
      !customerName ||
      !address ||
      !phone ||
      !description ||
      !bookingDate ||
      !eventType ||
      amountPaid === undefined
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Trim fields and check if any is empty
    if (
      [customerName, address, phone, description, eventType].some(
        (field) => field.trim() === ""
      )
    ) {
      return res.status(400).json({ error: "No field can be empty." });
    }

    // Convert the booking date to start of the day for consistency
    const startOfBookingDate = new Date(bookingDate);
    startOfBookingDate.setHours(0, 0, 0, 0);
    console.log("startOfBookingDate",startOfBookingDate)
    // Check if any booking exists for the same date
    const existingBookings = await Booking.find({
      bookingDate: startOfBookingDate,
    });

    let morningBooked = false;
    let eveningBooked = false;

    // Loop through existing bookings to see if morning or evening sessions are already booked
    existingBookings.forEach((booking) => {
      console.log("first",booking)
      if (booking.bookSession.morning) morningBooked = true;
      if (booking.bookSession.evening) eveningBooked = true;
    });
    
    // Logic to restrict session booking based on existing bookings
    if (bookSession.morning && morningBooked) {
      return res
        .status(400)
        .json({
          message:
            "Morning session is already booked. Only evening session is available.",
        });
    }

    if (bookSession.evening && eveningBooked) {
      return res
        .status(400)
        .json({
          message:
            "Evening session is already booked. Only morning session is available.",
        });
    }

    // If both sessions are already booked for the date
    if (morningBooked && eveningBooked) {
      return res
        .status(400)
        .json({
          message:
            "Both morning and evening sessions are booked for this date.",
        });
    }

    // Create a new booking
    const booking = await Booking.create({
      user: req.user._id,
      customerName,
      address,
      phone,
      description,
      completed,
      bookingDate: startOfBookingDate,
      bookSession: {
        morning: bookSession.morning || false,
        evening: bookSession.evening || false,
      },
      eventType,
      amountPaid,
    });

    return res.status(201).json({ data: booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the booking." });
  }
};

const getCustomerBooking = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(400).json({ error: "user not found." });
    }
    const booking = await Booking.find({ user: user._id });
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
      limit = 5,
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
      console.log("startOfDay, endOfDay", startOfDay, endOfDay);
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
    console.log("skip", skip);
    const allCustomerBooking = await Booking.find(query)?.skip(skip)?.limit(limit);
    if (!allCustomerBooking.length) {
      return res.status(400).json({ error: "booking not found." });
    }
    // Optionally, count total bookings for pagination metadata
    const totalBookings = await Booking.countDocuments(query);
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
    const Booking = await Booking.findOneAndDelete({ _id: id, user: req?.user?._id });

    if (!Booking) {
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

    const updatedBooking = await Booking.findByIdAndUpdate(id, {
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
