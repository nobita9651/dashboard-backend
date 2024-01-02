// user.model.js

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Schema for sign up
const signUpSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
      required: true,
    },
    hearAbout: {
      type: [String],
      required: true,
    },
    city: {
      type: String,
      enum: ["Mumbai", "Pune", "Ahmedabad"],
      required: true,
    },
    state: {
      type: String,
      enum: ["Gujarat", "Maharashtra", "Karnataka"],
      required: true,
    },
  },
  { timestamps: true }
);

// Schema for add user
const addUserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    image: {
      data: Buffer,
      contentType: String,
    },
    // image: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Image",
    // },
  },
  { timestamps: true }
);

// Hash the password before saving to the database (for sign up)
signUpSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

// Method to compare passwords during login (for sign up)
signUpSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Models
const SignUpUser = mongoose.model("SignUpUser", signUpSchema);
const AddUser = mongoose.model("AddUser", addUserSchema);

module.exports = {
  SignUpUser,
  User: AddUser,
};
