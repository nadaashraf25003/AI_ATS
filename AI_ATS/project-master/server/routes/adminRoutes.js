// routes/adminRoutes.js
import express from "express";
import User from "../models/User.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

router.get("/admin-all", async (req, res) => {
  try {
    const applications = await JobApplication.find();

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


export default router;
