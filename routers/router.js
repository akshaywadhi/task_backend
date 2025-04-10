import express from "express";
import {
  signup,
  login,
  addTask,
  editTask,
  getAllTask,
  deleteTask,
  getUser,
  logout,
  search,
} from "../controllers/controller.js";
import { auth } from "../middleware/auth.js";


const router = express.Router();

router

  .get("/getAllTask", auth, getAllTask)
  .get("/getUser", auth, getUser)
  .get("/logout", logout)
  .post("/signup", signup)
  .post("/login", login)
  .post("/addTask", auth, addTask)
  .put("/editTask/:taskId", auth, editTask)
  .get('/search', auth, search)
  .delete("/deleteTask/:deleteId", auth, deleteTask);

export default router;
