import express from "express";
import JobApplication from "../models/JobApplication.js";

const router = express.Router();

// ================= APPLY =================
router.post("/apply", async (req, res) => {
  try {
    const {
      jobId,
      userId,
      companyId,
      resume,
      userName,
      userEmail,
      userImage
    } = req.body;

    const exists = await JobApplication.findOne({ jobId, userId });
    if (exists)
      return res.json({ success: false, message: "Already applied" });

    const application = await JobApplication.create({
      jobId,
      userId,
      companyId,
      resume,
      userName,
      userEmail,
      userImage
    });

    res.json({ success: true, application });

  } catch (error) {
    console.log("APPLY ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});


// ================= GET USER APPLICATIONS (الرابط المطلوب) =================
router.get("/user", async (req, res) => {
  try {
    const { userId } = req.query; 
    if (!userId) return res.status(400).json({ success: false, message: "Missing userId" });

    // إضافة .populate('jobId') مهمة جداً عشان ترجع بيانات الوظيفة مش بس الـ ID
    const applications = await JobApplication.find({ userId });
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= GET ALL (FOR COMPANY) =================
router.get("/all", async (req, res) => {
  try {
    const { companyId } = req.query;
    const applications = await JobApplication.find({ companyId });
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= CHECK =================
router.get("/check", async (req, res) => {
  try {
    const { jobId, userId } = req.query;
    const exists = await JobApplication.findOne({ jobId, userId });
    res.json({ applied: !!exists });
  } catch (error) {
    res.status(500).json({ applied: false });
  }
});



// GET jobs مع عدد المتقدمين لكل وظيفة
router.get("/with-applicants-count", async (req, res) => {
  try {
    // جلب كل الوظائف
    const jobs = await JobApplication.find();

    // لكل وظيفة، احسب عدد applicants من JobApplication
    const jobsWithCount = await Promise.all(
      jobs.map(async (job) => {
        const applicantsCount = await JobApplication.countDocuments({ jobId: job._id });
        return {
          ...job._doc,
          applicantsCount, // هذا العدد سيظهر في الـ frontend
        };
      })
    );

    res.json({ success: true, jobs: jobsWithCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});






// ================= UPDATE STATUS =================
router.post("/change-status", async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).json({ success: false, message: "Missing id or status" });

    const application = await JobApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!application)
      return res.status(404).json({ success: false, message: "Application not found" });

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// ================= GET ALL APPLICATIONS (ADMIN) =================
router.get("/admin-all", async (req, res) => {
  try {
    // جلب كل الـ job applications بدون أي فلتر
    const applications = await JobApplication.find();

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// الـ Export لازم يكون هنا في الآخر خالص
export default router;