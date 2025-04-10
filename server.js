import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routers/router.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const Port = process.env.PORT;
app.use(cookieParser())
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use("/", router);

app.listen(Port, () => {
  console.log("Server Is Running On Port 4000");
  connectDB();
});
