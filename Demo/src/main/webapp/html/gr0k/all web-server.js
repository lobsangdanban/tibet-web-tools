const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB连接
mongoose.connect("mongodb://localhost:27017/tibetan-auth", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 用户Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

// 注册路由
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "请填写所有字段" });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "邮箱格式无效" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "密码至少6位" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "用户名或邮箱已存在" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "注册成功" });
  } catch (error) {
    res.status(500).json({ message: "服务器错误" });
  }
});

// 登录路由
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "请填写所有字段" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "用户不存在" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "密码错误" });
    }

    const token = jwt.sign({ userId: user._id }, "secret_key", { expiresIn: "1h" });
    res.status(200).json({ token, message: "登录成功" });
  } catch (error) {
    res.status(500).json({ message: "服务器错误" });
  }
});

// 受保护路由示例
app.get("/dashboard", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "未授权" });
  }
  try {
    const decoded = jwt.verify(token, "secret_key");
    res.status(200).json({ message: `欢迎用户 ${decoded.userId}` });
  } catch (error) {
    res.status(401).json({ message: "无效令牌" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));