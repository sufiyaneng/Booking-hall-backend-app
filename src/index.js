import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userRoute from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import bookingRoute from "./routes/booking.route.js";

const app = express();
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors());
app.use(cors({
  origin: 'https://synkerhub.com', // replace with your front-end origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // if you need to include credentials
}));
app.use(cookieParser());


mongoose
  .connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((db) => {
    console.log(`Connected to MongoDB: ${db.connection.host}`);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });


app.use("/api/v1/", userRoute);
app.use("/api/v1/", bookingRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
