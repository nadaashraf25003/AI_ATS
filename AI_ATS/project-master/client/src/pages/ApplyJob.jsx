import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import JobCard from "../components/JobCard";
import kconvert from "k-convert";
import moment from "moment";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "@clerk/clerk-react";

const Applyjob = () => {
  const { id } = useParams();
  const { jobs, backendUrl, fetchUserApplications } = useContext(AppContext);
  const { user, isSignedIn } = useUser();

  const [jobData, setJobData] = useState(null);
  const [resume, setResume] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  // ================= Fetch Job Details =================
  const fetchJob = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/jobs/${id}`);

      if (data.success) {
        setJobData(data.job);
        // التحقق من حالة التقديم فور تحميل بيانات الوظيفة
        if (user) {
          checkIfApplied(data.job._id);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to load job details");
    }
  };

  // ================= Check if already applied =================
  const checkIfApplied = async (jobId) => {
    if (!isSignedIn || !user) return;

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/applications/check`,
        {
          params: {
            jobId,
            userId: user.id,
          },
        }
      );
      // تحديث الحالة بناءً على رد السيرفر
      setHasApplied(data.applied);
    } catch (error) {
      console.log("CHECK ERROR:", error.message);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id, isSignedIn, user]);

  // ================= Upload Resume Handler =================
  const uploadResume = (file) => {
    if (!file) return;
    setResume(file.name);
    toast.success("Resume attached successfully");
  };

  // ================= Apply Handler (المنطق المطلوب هنا) =================
  const applyHandler = async () => {
    // 1. التأكد من تسجيل الدخول
    if (!isSignedIn) {
      return toast.error("Please login to apply for this job");
    }

    // 2. التحقق من حالة التقديم المسبق (المنع)
    if (hasApplied) {
      return toast.warning("You have already applied for this position!");
    }

    // 3. التأكد من وجود سيرة ذاتية
    if (!resume) {
      return toast.error("Please upload your resume first");
    }

    try {
      setLoading(true);

    const payload = {
  jobId: jobData?._id,
  companyId: jobData.companyId._id,   // 👈 بدون optional chaining

  userId: user?.id,
  userName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
  userEmail: user?.primaryEmailAddress?.emailAddress || "",
  userImage: user?.imageUrl || "",

  resume,
};

console.log("APPLY PAYLOAD =>", payload);

const { data } = await axios.post(
  `${backendUrl}/api/applications/apply`,
  payload
);



      if (data.success) {
        toast.success("Application submitted successfully!");
        setHasApplied(true); // تغيير الحالة فوراً لمنع التقديم مرة أخرى
        
        // تحديث قائمة التقديمات في الـ Context إذا كانت الدالة موجودة
        if (fetchUserApplications) {
            fetchUserApplications();
        }
      } else {
        toast.error(data.message || "Failed to submit application");
      }
    } catch (error) {
      // التعامل مع خطأ إذا كان المستخدم قدم بالفعل والباك إيند أرسل خطأ
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred while applying");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!jobData) return <Loading />;

  return (
    <>
      <Navbar />

      <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 to-blue-50/30 container mx-auto px-4 2xl:px-20">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* ================= HEADER ================= */}
          <div className="flex flex-wrap justify-between gap-8 px-8 py-14 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-center gap-6">
              <img
                src={jobData.companyId?.image || assets.company_icon}
                className="h-24 bg-white p-4 rounded-xl shadow"
                alt=""
              />

              <div>
                <h1 className="text-4xl font-bold">{jobData.title}</h1>
                <div className="flex flex-wrap gap-4 mt-3 text-gray-600">
                  <span className="flex items-center gap-1">
                    <img src={assets.company_icon} className="h-4" alt="" /> 
                    {jobData.companyId?.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={assets.location_icon} className="h-4" alt="" />
                    {jobData.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={assets.suitcases_icon} className="h-4" alt="" />
                    {jobData.level}
                  </span>
                  <span className="font-bold text-green-600">
                    CTC: {kconvert.convertTo(jobData.salary)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right space-y-3">
              {/* إخفاء زر الرفع إذا كان قد قدم بالفعل */}
              {!hasApplied && (
                <label className="cursor-pointer border-2 border-dashed border-blue-300 px-4 py-2 rounded-lg font-semibold inline-block hover:bg-blue-50 transition">
                  <input
                    type="file"
                    hidden
                    onChange={(e) => uploadResume(e.target.files[0])}
                  />
                  {resume ? "Change Resume" : "Upload Resume"}
                </label>
              )}

              {resume && !hasApplied && (
                <p className="text-sm text-blue-600 font-medium">
                   Selected: {resume}
                </p>
              )}

              <button
                onClick={applyHandler}
                disabled={hasApplied || loading}
                className={`px-10 py-4 rounded-xl font-bold text-white transition block w-full sm:w-auto
                  ${
                    hasApplied
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                  }`}
              >
                {hasApplied ? "Already Applied" : loading ? "Processing..." : "Apply Now"}
              </button>

              <p className="text-sm text-gray-500">
                Posted {moment(jobData.createdAt || jobData.date).fromNow()}
              </p>
            </div>
          </div>

          {/* ================= CONTENT ================= */}
          <div className="grid lg:grid-cols-3 gap-8 px-8 py-10">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold mb-4">Job Description</h2>

              <div
                className="prose max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: jobData.description,
                }}
              />

              <button
                onClick={applyHandler}
                disabled={hasApplied || loading}
                className={`mt-8 px-12 py-4 rounded-xl font-bold text-white transition
                  ${
                    hasApplied
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 shadow-lg"
                  }`}
              >
                {hasApplied ? "Application Submitted" : "Apply Now"}
              </button>
            </div>

            {/* ================= More Jobs Section ================= */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-xl font-bold mb-6">
                More from {jobData.companyId?.name}
              </h3>

              <div className="space-y-4">
                {jobs
                  ?.filter(
                    (job) =>
                      job._id !== jobData._id &&
                      job.companyId?._id === jobData.companyId?._id
                  )
                  .slice(0, 3)
                  .map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}

                {jobs?.filter(
                  (job) =>
                    job._id !== jobData._id &&
                    job.companyId?._id === jobData.companyId?._id
                ).length === 0 && (
                  <p className="text-gray-500 text-center italic">
                    No other open positions
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Applyjob;