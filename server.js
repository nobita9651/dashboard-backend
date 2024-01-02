// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { SignUpUser, User } = require("./model/user.model");
// const { SignUpUser, AddUser } = require("./model/user.model");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// // MongoDB connection setup
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Mongo Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });

// Define API routes for CRUD operations
app.post("/api/users/add", upload.single("image"), async (req, res) => {
  try {
    const { userName, email, mobile } = req.body;

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists. Please log in.",
      });
    }

    // If the email doesn't exist, proceed with creating the new user
    const newUser = new User({
      userName,
      email,
      mobile,
      createdAt: new Date(),
    });

    // If an image is uploaded, set it in the newUser
    if (req.file) {
      console.log("Received image:", req.file);
      newUser.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const savedUser = await newUser.save();
    console.log("User saved:", savedUser);
    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Error adding user:", error.message);
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/signup", async (req, res) => {
  try {
    const { email, name, phone, password, gender, hearAbout, city, state } =
      req.body;

    // Check if the email already exists
    const existingUser = await SignUpUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists. Please log in.",
      });
    }

    // If the email doesn't exist, proceed with creating the new user
    const newUser = new SignUpUser({
      email,
      name,
      phone,
      password,
      gender,
      hearAbout,
      city,
      state,
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await SignUpUser.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Compare passwords
    const passwordMatch = await user.comparePassword(password);

    if (passwordMatch) {
      // Generate a token
      const token = jwt.sign({ userId: user._id }, "abhishek", {
        expiresIn: "1h", // You can adjust the expiration time
      });

      // Return the token in the response
      return res.json({ token, message: "Login successful" });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    console.log("Retrieved users:", users);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// Serve user images
app.get("/api/users/:id/image", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.image) {
      return res.status(404).json({ message: "Image not found" });
    }

    res.set("Content-Type", user.image.contentType);
    res.send(user.image.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("image");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userDetails = {
      userName: user.userName,
      email: user.email,
      mobile: user.mobile,
    };

    if (user.image && user.image.data) {
      userDetails.image = {
        data: user.image.data.toString("base64"),
        contentType: user.image.contentType,
      };
    }

    res.json(userDetails);
  } catch (error) {
    console.error("Error fetching user details:", error);

    // Log the error and send an appropriate response
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Update a user
app.patch("/api/users/:id", async (req, res) => {
  try {
    req.body.updatedAt = new Date();

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a user
app.delete("/api/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
