import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";

// =========================
// Get ALL jobs  (Public / Company / Admin)
// =========================
export const getJobs = async (req, res) => {
  try {
    const companyId = req.query.companyId || req.companyId;
    const adminId = req.adminId; // لازم يكون موجود من middleware لو Admin

    let filter = {};

    if (adminId) {
      // 👑 Admin → كل الوظائف بدون أي فلترة
      filter = {};
    } else if (companyId) {
      // 🏢 Company → وظائف الشركة فقط
      filter = { companyId };
    } else {
      // 👥 Public → وظائف مرئية فقط و companyId موجود
      filter = {  companyId: { $ne: null } };
    }

    console.log("----------- DEBUG -----------");
    console.log("adminId:", adminId);
    console.log("companyId:", companyId);
    console.log("filter:", filter);
    console.log("-----------------------------");

    const jobs = await Job.find(filter).populate({ path: "companyId", select: "-password" });

    res.json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs due to server error.",
    });
  }
};

// =========================
// Get a single job by ID
// =========================
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).populate({
      path: "companyId",
      select: "-password",
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({
      success: true,
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// Delete a job (Admin / Company)
// =========================
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // الحذف النهائي من MongoDB باستخدام معرف الوظيفة
    const deletedJob = await Job.findByIdAndDelete(id);

    if (!deletedJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found in database",
      });
    }

    res.json({
      success: true,
      message: "Job has been permanently deleted from MongoDB",
    });

  } catch (error) {
    console.error("Error deleting job:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while trying to delete the job",
    });
  }
};

