import React, { useState } from "react";
import PropTypes from "prop-types";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { toast } from "react-toastify";

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const [isHovered, setIsHovered] = useState(false);

  // التعديل 1: التحقق من وجود _id أو id لضمان العرض
  if (!job || (!job.id && !job._id)) return null;

  // استخراج المعرف الصحيح لاستخدامه في الروابط
  const jobId = job._id || job.id;

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleApply = () => {
    if (!user) {
      toast.info("يرجى تسجيل الدخول أولاً للتقديم على الوظيفة");
      openSignIn();
      return;
    }
    // التعديل 2: استخدام jobId (الذي يحمل _id)
    navigate(`/apply-job/${jobId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLearnMore = () => {
    // التعديل 3: استخدام jobId
    navigate(`/job-details/${jobId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="group border border-gray-200 p-3 sm:p-4 shadow-sm rounded-xl bg-white hover:shadow-xl hover:border-blue-400/50 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col h-full overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/30 group-hover:to-indigo-50/20 transition-all duration-300 rounded-xl pointer-events-none"></div>

      <div className="relative z-10 flex justify-between items-start mb-3 sm:mb-4 lg:mb-3 xl:mb-3 h-[3.5rem] sm:h-[3.75rem] lg:h-[3rem] xl:h-[3rem]">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-2 xl:gap-2">
          <div className="relative h-10 w-10 sm:h-12 sm:w-12 lg:h-10 lg:w-10 xl:h-10 xl:w-10 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow duration-300">
            {job.companyImage ? (
              <img
                className="h-full w-full object-contain p-2"
                src={job.companyImage}
                alt={job.companyName || "Company Logo"}
                onError={(e) => (e.target.src = assets.company_icon)}
              />
            ) : (
              <img
                className="h-8 w-8 opacity-50"
                src={assets.company_icon}
                alt="Company"
              />
            )}
          </div>
          <div>
            <p className="font-semibold text-xs sm:text-sm lg:text-xs xl:text-xs 2xl:text-xs text-gray-700">
              {job.companyName || "Company"}
            </p>
            {job.date && (
              <p className="text-[10px] sm:text-xs lg:text-[10px] xl:text-[10px] 2xl:text-[10px] text-gray-500 mt-0.5">
                {formatDate(job.date)}
              </p>
            )}
          </div>
        </div>
        {job.category && (
          <span className="text-[10px] sm:text-xs lg:text-[10px] xl:text-[10px] 2xl:text-[10px] bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 px-2 py-1 rounded-full font-semibold flex-shrink-0 border border-purple-200/50 shadow-sm">
            {job.category}
          </span>
        )}
      </div>

      <h4 className="relative z-10 font-bold text-base sm:text-lg lg:text-base xl:text-base 2xl:text-base text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 h-[3rem] sm:h-[3.5rem] lg:h-[2.75rem] xl:h-[2.75rem] 2xl:h-[2.75rem]">
        {job.title}
      </h4>

      <div className="relative z-10 flex items-center gap-1.5 flex-wrap mb-2 min-h-[2.5rem] py-1.5">
        {job.location && (
          <span className="inline-flex items-center gap-1.5 bg-blue-50/80 border border-blue-200/60 px-2.5 py-1 rounded-full text-sm text-blue-700 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-blue-100">
            <img src={assets.location_icon} alt="Location" className="h-3 w-3" />
            {job.location}
          </span>
        )}
        {job.level && (
          <span className="inline-flex items-center gap-1.5 bg-red-50/80 border border-red-200/60 px-2.5 py-1 rounded-full text-sm text-red-700 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-red-100">
            <img src={assets.suitcase_icon} alt="Level" className="h-3 w-3" />
            {job.level}
          </span>
        )}
        {job.salary && (
          <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200/60 px-2.5 py-1 rounded-full text-sm text-green-700 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-green-100">
            <img src={assets.money_icon} alt="Salary" className="h-3 w-3" />
            ${job.salary.toLocaleString()}
          </span>
        )}
      </div>

      <div className="relative z-10 flex-1 my-3">
        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-3 group-hover:text-gray-700 transition-colors duration-200">
          {job.description ? stripHtml(job.description).slice(0, 120) + "..." : "No description available"}
        </p>
      </div>

      <div className="relative z-10 mt-auto pt-4 border-t border-gray-200/60 flex gap-2">
        <button
          onClick={handleApply}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 shadow-sm hover:shadow-lg"
          type="button"
        >
          Apply now
        </button>

        <button
          onClick={handleLearnMore}
          className="px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
          type="button"
        >
          Learn more
        </button>
      </div>
    </div>
  );
};

// التعديل 4: تحديث PropTypes لقبول id أو _id
JobCard.propTypes = {
  job: PropTypes.shape({
    _id: PropTypes.string, // أضفنا هذا
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    companyName: PropTypes.string,
    companyImage: PropTypes.string,
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    category: PropTypes.string,
    location: PropTypes.string,
    level: PropTypes.string,
    salary: PropTypes.number,
    description: PropTypes.string,
  }).isRequired,
};

export default JobCard;