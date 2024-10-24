import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    bookSession: {
      type: String,
      enum: ["Morning", "Evening", "Full Day"],
      required: true, // Make it required to enforce a selection
    },
    // bookSession: {
    //   morning: {
    //     type: Boolean,
    //     default: false,
    //   },
    //   evening: {
    //     type: Boolean,
    //     default: false,
    //   },
    // },
    eventType: {
      type: String,
      enum: ["Engagement", "Valima", "Marriage", "Other"],
    },
    amountPaid: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model("Booking", bookingSchema);
