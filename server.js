const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= CONNECT DB =================
mongoose.connect("mongodb://127.0.0.1:27017/todolist_db")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  })
  .catch(err => console.log(err));

// ================= SCHEMA =================
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  fullName: String
});

const taskSchema = new mongoose.Schema({
  title: String,
  isDone: { type: Boolean, default: false },
  doneAt: Date,
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

const User = mongoose.model("User", userSchema);
const Task = mongoose.model("Task", taskSchema);

app.set('view engine', 'ejs');

// ================= ROUTE UI =================
app.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().populate("userId");
    const users = await User.find();
    res.render("index", { tasks, users });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ================= API =================

// ✅ 1. Register (băm password)
app.post("/register", async (req, res) => {
  try {
    const { username, password, fullName } = req.body;

    const exist = await User.findOne({ username });
    if (exist) return res.send("Username đã tồn tại");

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashed,
      fullName
    });

    res.send(user);
  } catch (err) {
    res.send(err.message);
  }
});

// ✅ 2. Tạo task
app.post("/tasks", async (req, res) => {
  const { title, userId } = req.body;

  const task = await Task.create({
    title,
    userId
  });

  res.send(task);
});

// ✅ 3. Get all tasks
app.get("/tasks", async (req, res) => {
  const tasks = await Task.find().populate("userId");
  res.send(tasks);
});

// ✅ 4. Lấy task theo username
app.get("/tasks/user/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  const tasks = await Task.find({ userId: user._id });
  res.send(tasks);
});

// ✅ 5. Task hôm nay
app.get("/tasks/today", async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const tasks = await Task.find({
    createdAt: { $gte: start, $lte: end }
  });

  res.send(tasks);
});

// ✅ 6. Task chưa hoàn thành
app.get("/tasks/not-done", async (req, res) => {
  const tasks = await Task.find({ isDone: false });
  res.send(tasks);
});

// ✅ 7. Task user họ Nguyễn
app.get("/tasks/nguyen", async (req, res) => {
  const users = await User.find({
    fullName: { $regex: /^Nguyễn/i }
  });

  const userIds = users.map(u => u._id);

  const tasks = await Task.find({
    userId: { $in: userIds }
  }).populate("userId");

  res.send(tasks);
});