import mongoose from "mongoose";

const JobApplicationSchema = new mongoose.Schema({
  // Clerk User ID
  userId: {
    type: String,
    required: true,
  },

  // User snapshot (from Clerk)
  userName: {
    type: String,
    required: true,
  },

  userEmail: {
    type: String,
  },

  userImage: {
    type: String,
  },

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },

  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },

  resume: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending",
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

const JobApplication = mongoose.model(
  "JobApplication",
  JobApplicationSchema
);

export default JobApplication;
 