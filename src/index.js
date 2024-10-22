import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userRoute from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import bookingRoute from "./routes/booking.route.js";

const app = express();
dotenv.config();
const corsOptions = {
  origin: 'http://localhost:3000', 
  credentials: true,
  methods: 'GET,POST,PUT,DELETE',
};
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());

mongoose
  .connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`)
  .then((db) =>
    console.log(`Connected!`, db.connection.name, db.connection.host)
  )
  .catch((err) => console.error(err));

app.use("/api/v1/", userRoute);
app.use("/api/v1/", bookingRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
