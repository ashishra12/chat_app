import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

// Signup Controller
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const errors = [];

    // Validate all fields
    if (!fullName?.trim()) {
      errors.push({ field: "fullName", message: "Full name is required" });
    }
    if (!email?.trim()) {
      errors.push({ field: "email", message: "Email is required" });
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.push({ field: "email", message: "Please enter a valid email address" });
    }
    if (!password) {
      errors.push({ field: "password", message: "Password is required" });
    } else if (password.length < 6) {
      errors.push({ field: "password", message: "Password must be at least 6 characters long" });
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed",
        errors: errors
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        message: "User already exists",
        errors: [{ field: "email", message: "This email is already registered" }]
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    generateToken(newUser._id, res);

    return res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    console.error("Error in signup controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);
    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Logout Controller
export const logout = (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 0 }); // cleared "token" instead of "jwt"
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update Profile Controller
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateProfile controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Check Auth Controller
export const checkAuth = (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
