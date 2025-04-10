import userModel from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import taskModel from "../models/task.js";

export const signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log(email, password)
    
    if (!email || !password) {
      return res.status(400).json({ message: "all fields required" });
    }


    const user = await userModel.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "user already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      email,
      password: hashedPassword,
    });

    await newUser.save();

console.log(newUser)
     return res.status(201).json({
        error: false,
        newUser,
        message: "successfully signed up",
      });
   
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error : err });
    console.log(err)
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "all fields required" });
    }

    const userExist = await userModel.findOne({ email });

    if (!userExist) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      userExist.password
    );

    if (!isPasswordCorrect) {
      return res.status(404).json({ message: "Invalid Credentials" });
    }

    const user = { user: userExist };

    const accessToken = jwt.sign(user, process.env.JWTTOKEN, {
      expiresIn: "10h",
    });

    res.cookie('token', accessToken,{
      httpOnly : true,
      secure : false,
      sameSite : 'Lax',
      maxAge : 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json({
      error: false,
      message: "Login Successfull",
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const getUser = async (req,res) => {

  const {user} = req.user

  const isUser = await userModel.findOne({_id : user._id})

  if(!isUser){
    return res.sendStatus(401)
  }

  return res.json({
    user : {
      username : isUser.username,
      email : isUser.email,
      _id : isUser._id,
    },
    message : ''
  })
}



export const getAllTask = async (req, res) => {

  const { user } = req.user;

  try {
    const tasks = await taskModel.find({ userId: user._id });
    return res.status(200).json({
      error: false,
      tasks,
      message: "task fetched",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "server error",
    });
  }
};

export const addTask = async (req, res) => {
  const { title, description, status, createdOn } = req.body;
  const { user } = req.user;

  console.log(user)

  try {
    if (!title || !description || !status || !createdOn) {
      return res.status(400).json({ message: "all fields are required" });
    }

    const task = new taskModel({
      title,
      description,
      status,
      userId: user._id,
      createdOn
    });

    await task.save();

    return res.status(201).json({
      error: false,
      task,
      message: "task created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: "server error",
    });
  }
};

export const editTask = async (req, res) => {
  const taskId = req.params.taskId;
  const { title, description, status, createdOn } = req.body;
  const { user } = req.user;
console.log(req.body)
  try {
    if (!title || !description || !status || !createdOn) {
      return res.status(400).json({ message: "No Changes Provided" });
    }

    const task = await taskModel.findOne({ _id: taskId, userId: user._id });

    if (!task) {
      return res.status(404).json({ message: "Task Not Found" });
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if(createdOn) task.createdOn = createdOn

    await task.save();

    return res.status(200).json({
      error: false,
      task,
      message: "task updated",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: true,
      message: "server error",
    });
  }
};

export const deleteTask = async (req, res) => {
  const deleteId = req.params.deleteId;
  const { user } = req.user;

  try {
    const task = await taskModel.findOne({ _id: deleteId, userId: user._id });

    if (!task) {
      return res.status(404).json({ message: "task not found" });
    }

    await taskModel.deleteOne({ _id: deleteId, userId: user._id });

    return res.status(200).json({
      error : false,
      message : "task has been deleted"
    })
  } catch (error) {
    return res.status(500).json({
      error: true,
      message : "server error"
    })
  }
};


export const logout = async (req, res) => {


  try {

    res.clearCookie('token',{
      httpOnly : true,
      sameSite : "Lax",
      secure : false
    })
    res.status(200).json({
      message : 'successfully logged out'
    })
  } catch (error) {
    console.log(error)
  }
}


export const search = async (req, res) => {
  const { query } = req.query;
  const { user } = req.user;
  try {
    const tasks = await taskModel.find({
      title: { $regex: query, $options: "i" },
      userId: user._id,
    });
    res.status(200).json({ tasks });
  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
}