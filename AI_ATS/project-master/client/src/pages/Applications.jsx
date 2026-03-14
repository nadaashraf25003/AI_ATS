import { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EmptyState from "../components/EmptyState";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { useUser } from "@clerk/clerk-react";
import moment from "moment";
import { toast } from "react-toastify";

const Applications = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { userApplications, jobs, userData, setUserData } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [resume, setResume] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  /* تحميل السيرة الذاتية */
  useEffect(() => {
    if (userData?.resume) {
      setResume({ name: userData.resume });
    }
  }, [userData]);

  /* حفظ السيرة الذاتية (فرونت إيند فقط) */
  const saveResume = (file) => {
    if (!file) return;
    const allowedExtensions = ["pdf", "doc", "docx"];
    const extension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      toast.error("Please upload a PDF, DOC, or DOCX file");
      return;
    }

    const updatedUser = { ...userData, resume: file.name };
    setUserData(updatedUser);
    setResume(file);
    setIsEdit(false);
    toast.success("Resume uploaded successfully!");
  };

  /* --- الجزء الذي تم تحديثه لربط البيانات بشكل صحيح --- */
  const applicationsWithJobs = useMemo(() => {
    if (!userApplications || !jobs || !user?.id) return [];

    return userApplications
      .filter((app) => String(app.userId) === String(user.id))
      .map((app) => {
        // التحديث هنا: البحث عن الوظيفة باستخدام _id أو id لضمان المطابقة مع مونجو
        const job = jobs.find(
          (j) => String(j._id || j.id) === String(app.jobId)
        );
        
        if (!job) return null;

        return {
          ...app,
          job,
          // التحديث هنا: استخدام حقل date القادم من قاعدة البيانات
          appliedAt: app.date || app.appliedAt, 
          status: app.status || "Pending",
        };
      })
      .filter(Boolean);
  }, [userApplications, jobs, user?.id]);
  /* -------------------------------------------------- */

  /* الفلترة والترتيب */
  const filteredApplications = useMemo(() => {
    let filtered = [...applicationsWithJobs];

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (app) => (app.status?.toLowerCase() || "pending") === statusFilter
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.appliedAt || 0);
      const dateB = new Date(b.appliedAt || 0);
      if (sortBy === "oldest") return dateA - dateB;
      if (sortBy === "company")
        return (a.job.companyName || "").localeCompare(b.job.companyName || "");
      return dateB - dateA;
    });

    return filtered;
  }, [applicationsWithJobs, statusFilter, sortBy]);

  const handleViewJob = (jobId) => {
    navigate(`/job-details/${jobId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted": return "bg-green-50 text-green-700 border-green-200 font-semibold";
      case "rejected": return "bg-red-50 text-red-700 border-red-200 font-semibold";
      default: return "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
    }
  };
console.log("Current User ID:", user?.id);
console.log("All Applications from Context:", userApplications);
console.log("All Jobs from Context:", jobs);
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pt-16 sm:pt-20">
        <div className="px-4 sm:px-5 py-6 sm:py-10 max-w-7xl mx-auto">
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Applications</h1>
            <p className="text-gray-600">Manage your resume and track your job applications</p>
          </div>

          {/* قسم السيرة الذاتية */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">Your Resume</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              {isEdit ? (
                <>
                  <label className="bg-blue-600 text-white px-6 py-2.5 rounded-lg cursor-pointer font-semibold" htmlFor="resumeUpload">
                    Select Resume
                    <input id="resumeUpload" onChange={(e) => saveResume(e.target.files[0])} accept=".pdf,.doc,.docx" type="file" className="hidden" />
                  </label>
                  <button onClick={() => setIsEdit(false)} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg border font-semibold">Cancel</button>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  {resume ? (
                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-6 py-2.5">
                      <span className="text-blue-700 font-semibold">{resume.name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-gray-500 px-6 py-2.5">No Resume Uploaded</div>
                  )}
                  <button onClick={() => setIsEdit(true)} className="bg-white text-gray-700 border-2 rounded-lg px-6 py-2.5 font-semibold">
                    {resume ? "Change Resume" : "Upload Resume"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* عرض الطلبات */}
          <div className="bg-white rounded-2xl shadow-lg border p-6">
            <h2 className="text-2xl font-bold mb-4">Jobs Applied</h2>
            {filteredApplications.length === 0 ? (
              <EmptyState title="No Applications Found" description="Start applying to jobs to see them here" />
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => (
                  <div key={app._id || app.jobId} onClick={() => handleViewJob(app.job._id || app.job.id)} className="border rounded-xl p-5 hover:shadow-md cursor-pointer transition-shadow">
                    <h3 className="text-xl font-bold">{app.job.title}</h3>
                    <p className="text-gray-600">{app.job.companyId?.name || app.job.companyName}</p>
                    <div className="flex justify-between mt-3 items-center">
                      <span className={`px-3 py-1 rounded-lg border text-sm ${getStatusBadgeClass(app.status)}`}>
                        {app.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        Applied {moment(app.appliedAt).fromNow()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Applications;