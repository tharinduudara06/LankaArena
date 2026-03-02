import express from "express";
import { login } from "../controllers/loginControl.js";
import { otpVerify, register } from "../controllers/registerControl.js";
import User from "../models/Users.js";

const router = express.Router();

router.post('/log', login);
router.post('/reg', register);
router.post('/otp', otpVerify);

// Get user profile
router.get('/api/user/profile', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const user = await User.findById(req.session.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error("Error in get user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

export default router;