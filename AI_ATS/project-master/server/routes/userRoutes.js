// import express from 'express'
// import { applyForJob, getUserData, getUserJobApplications, updateUserResume } from '../controllers/userController.js'
// import upload from '../config/multer.js'

// const router = express.Router()

// // Get user data
// router.get('/user',getUserData)

// // Apply for a job
// router.post('/apply',applyForJob)

// // Get a applied jobs data
// router.get('/applications',getUserJobApplications)

// // update user profile
// router.post('/update-resume', upload.single('resume'),updateUserResume)

// export default router
import express from "express";
import {
  applyForJob,
  getUserData,
  getUserJobApplications,
  updateUserResume,
  saveUser
} from "../controllers/userController.js";
import upload from "../config/multer.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

// ✅ 1. حفظ المستخدم أول مرة بعد تسجيل الدخول من Clerk
router.post("/save", requireAuth, saveUser);

// ✅ 2. جلب بيانات المستخدم
router.get("/user", requireAuth, getUserData);

// ✅ 3. التقديم على وظيفة
router.post("/apply", requireAuth, applyForJob);

// ✅ 4. جلب الوظائف اللي المستخدم قدّم عليها
router.get("/applications", requireAuth, getUserJobApplications);

// ✅ 5. تحديث السيرة الذاتية (الـ Resume)
router.post("/update-resume", requireAuth, upload.single("resume"), updateUserResume);

export default router;

