import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userRoute from "./routes/user.route.js";
import todoRoute from "./routes/todo.route.js";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

mongoose
  .connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`)
  .then((db) =>
    console.log(`Connected!`, db.connection.name, db.connection.host)
  )
  .catch((err) => console.error(err));

app.use("/api/v1/", userRoute);
app.use("/api/v1/", todoRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
