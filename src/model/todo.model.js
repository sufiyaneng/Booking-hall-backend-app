import mongoose, { Schema } from "mongoose";

const todoSchema = new Schema(
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
    address:{
      type:String,
      required:true
    },
    phone:{
      type:String,
      required:true
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
      enum: ["Morning Session", "Evening Session"],
    },
    eventType: {
      type: String,
      enum: ["Enagagement", "Valima", "Marriage", "Other"],
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

export const Todo = mongoose.model("Todo", todoSchema);
