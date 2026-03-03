const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Task = require("./models/Task");

mongoose.connect("mongodb://127.0.0.1:27017/todolist_db")
  .then(() => console.log("✅ Connected DB"))
  .catch(err => console.log(err));

async function seedData() {
  try {
    // ❗ Xóa dữ liệu cũ
    await User.deleteMany();
    await Task.deleteMany();

    console.log("🗑️ Đã xóa data cũ");

    // 🔐 Hash password
    const password = await bcrypt.hash("123456", 10);

    // 👤 Tạo users
    const users = await User.insertMany([
      { username: "hai1", password, fullName: "Nguyễn Hải" },
      { username: "an1", password, fullName: "Trần Văn An" },
      { username: "minh1", password, fullName: "Nguyễn Minh" },
      { username: "linh1", password, fullName: "Lê Thị Linh" },
      { username: "tuan1", password, fullName: "Nguyễn Tuấn" }
    ]);

    console.log("👤 Đã tạo users");

    // 📝 Tạo tasks (liên kết user thật)
    const tasks = [
      {
        title: "Học NodeJS",
        isDone: false,
        createdAt: new Date(),
        userId: users[0]._id
      },
      {
        title: "Làm MongoDB",
        isDone: true,
        createdAt: new Date(),
        doneAt: new Date(),
        userId: users[1]._id
      },
      {
        title: "Code todo app",
        isDone: false,
        createdAt: new Date(),
        userId: users[2]._id
      },
      {
        title: "Đi gym",
        isDone: true,
        createdAt: new Date(),
        doneAt: new Date(),
        userId: users[3]._id
      },
      {
        title: "Xem video backend",
        isDone: false,
        createdAt: new Date(),
        userId: users[4]._id
      }
    ];

    await Task.insertMany(tasks);

    console.log("📝 Đã tạo tasks");

    console.log("🎉 Seed thành công!");
    process.exit();

  } catch (err) {
    console.log("❌ Lỗi:", err);
    process.exit(1);
  }
}

seedData();