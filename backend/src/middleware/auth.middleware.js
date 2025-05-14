import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      console.log("❌ No token found in cookies");
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded token:", decoded);

    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      console.log("❌ No user found with that ID");
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("🔥 Error in protectRoute middleware:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
