import Company from "../models/Company.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import generateToken from "../utils/generateToken.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";

// =========================
// Register a new company
// =========================
export const registerCompany = async (req, res) => {
  const { name, email, password } = req.body;
  const imageFile = req.file;

  if (!name || !email || !password || !imageFile) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const companyExist = await Company.findOne({ email });

    if (companyExist) {
      return res.json({ success: false, message: "Company Already Registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path);

    const company = await Company.create({
      name,
      email,
      password: hashPassword,
      image: imageUpload.secure_url,
    });

    res.json({
      success: true,
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
      token: generateToken(company._id),
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// =========================
// Company Login
// =========================
export const loginCompany = async (req, res) => {
  const { email, password } = req.body;

  try {
    const company = await Company.findOne({ email });

    if (!company) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, company.password);
    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    return res.json({
      success: true,
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
      token: generateToken(company._id),
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// =========================
// Get Company Data
// =========================
export const getCompanyData = async (req, res) => {
  try {
    const company = req.company;
    res.json({ success: true, company });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// =========================
// Post a new job
// =========================
export const postJob = async (req, res) => {
  const { title, description, location, salary, level, category } = req.body;
  const companyId = req.company._id;

  try {
    const newJob = new Job({
      title,
      description,
      location,
      salary,
      companyId,
      date: Date.now(),
      level,
      category,
      visible: true,
    });
    await newJob.save();
    res.json({ success: true, newJob });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// =========================
// Get Company Job applicants (فارغ ممكن تعملي فيه لاحقاً)
// =========================
export const getCompanyJobApplicants = async (req, res) => {
  try {
    const companyId = req.company._id;

    // Fetch all applications for the company
    const applications = await JobApplication.find({ companyId })
      .populate("userId", "name email image resume") // Populate user details
      .populate("jobId", "title location category level"); // Populate job details

    res.json({ success: true, applications });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// =========================
// Get Company Posted Jobs
// =========================
export const getCompanyPostedJobs = async (req, res) => {
  try {
    const companyId = req.company._id;

    const jobs = await Job.find({ companyId, visible: true });

    if (!jobs || jobs.length === 0) {
      return res.json({ success: false, message: "No jobs found", jobsData: [] });
    }

    // أضف عدد المتقدمين لكل وظيفة
    const jobsData = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await JobApplication.countDocuments({ jobId: job._id });
        return { ...job.toObject(), applicants: applicantCount };
      })
    );

    res.json({ success: true, jobsData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================
// Change job application status (فارغ ممكن تعملي فيه لاحقاً)
// =========================
export const ChangeJobApplicationStatus = async (req, res) => {
  res.json({ success: true, message: "Function not implemented yet" });
};

// =========================
// Change job visibility
// =========================
export const ChangeVisiblity = async (req, res) => {
  try {
    const { id } = req.body;
    const companyId = req.company?._id;
    const adminId = req.adminId;

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    // السماح للأدمن أو صاحب الشركة بتغيير حالة الوظيفة
    if (adminId || (companyId && companyId.toString() === job.companyId.toString())) {
      job.visible = !job.visible;
      await job.save();
      return res.json({ success: true, message: `Job visibility updated to ${job.visible ? 'visible' : 'hidden'}`, job });
    }

    return res.status(403).json({ success: false, message: "Not authorized to change this job's visibility" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
