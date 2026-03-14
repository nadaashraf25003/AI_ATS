import React, { useEffect, useState, useMemo, useContext } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { JobCategories, JobLocations } from "../assets/assets";

const ManageJobs = () => {
  const navigate = useNavigate();
  const { backendUrl, companyToken } = useContext(AppContext);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch jobs from backend
  const fetchJobs = async () => {
    if (!companyToken) return;
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/company/list-job`, {
        headers: { token: companyToken },
      });
      if (res.data.success && Array.isArray(res.data.jobsData)) {
        setJobs(res.data.jobsData.reverse());
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [companyToken]);

  // Toggle job visibility
  const changeJobVisibility = async (id) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/company/change-visiblity`,
        { id },
        { headers: { token: companyToken } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchJobs();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update visibility.");
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const visibleJobs = jobs.filter((job) => job.visible !== false).length;
    const hiddenJobs = totalJobs - visibleJobs;
    return { totalJobs, visibleJobs, hiddenJobs };
  }, [jobs]);

  // Filter & sort
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs.filter((job) => {
      const matchesSearch =
        searchQuery === "" ||
        job.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "" || job.category === selectedCategory;
      const matchesLocation =
        selectedLocation === "" || job.location === selectedLocation;
      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "visible" && job.visible !== false) ||
        (visibilityFilter === "hidden" && job.visible === false);
      return matchesSearch && matchesCategory && matchesLocation && matchesVisibility;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "title":
          comparison = (a.title || "").localeCompare(b.title || "");
          break;
        case "date":
        default:
          comparison = new Date(a.date) - new Date(b.date);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    jobs,
    searchQuery,
    selectedCategory,
    selectedLocation,
    visibilityFilter,
    sortBy,
    sortOrder,
  ]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedLocation("");
    setVisibilityFilter("all");
    setSortBy("date");
    setSortOrder("desc");
  };

  const hasActiveFilters =
    searchQuery || selectedCategory || selectedLocation || visibilityFilter !== "all";

  return (
    <div className="px-5 py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Manage Your Jobs</h2>
        <p className="text-gray-600">Monitor and manage all your job postings</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
          <p className="text-sm font-medium text-gray-600 mb-2">Total Jobs</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
          <p className="text-sm font-medium text-green-700 mb-2">Visible Jobs</p>
          <p className="text-3xl font-bold text-green-700">{stats.visibleJobs}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
          <p className="text-sm font-medium text-orange-700 mb-2">Hidden Jobs</p>
          <p className="text-3xl font-bold text-orange-700">{stats.hiddenJobs}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="">All Categories</option>
            {JobCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="">All Locations</option>
            {JobLocations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {/* Visibility Filter */}
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="all">All Jobs</option>
            <option value="visible">Visible Only</option>
            <option value="hidden">Hidden Only</option>
          </select>
        </div>

        {/* Sort and Clear */}
        <div className="flex flex-wrap items-center gap-4 mt-5 pt-5 border-t border-gray-200">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="date">Date</option>
            <option value="title">Title</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-1.5 bg-gray-100 rounded-lg text-sm"
            >
              Clear All Filters
            </button>
          )}

          <div className="ml-auto text-sm font-medium text-gray-600">
            Showing {filteredAndSortedJobs.length} of {jobs.length} jobs
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-700 uppercase tracking-wider max-sm:hidden">#</th>
              <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Job Title</th>
              <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-700 uppercase tracking-wider max-sm:hidden">Date</th>
              <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-700 uppercase tracking-wider max-sm:hidden">Location</th>
              <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Visible</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedJobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 px-4 text-center">
                  <p className="text-lg font-semibold text-gray-700">
                    {jobs.length === 0 ? "No jobs yet. Add your first job!" : "No jobs match your filters"}
                  </p>
                  {jobs.length === 0 && (
                    <button
                      onClick={() => navigate("/dashboard/add-job")}
                      className="px-6 py-2 mt-4 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      Add Your First Job
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredAndSortedJobs.map((job, index) => (
                <tr key={job._id} className="text-gray-700 hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100">
                  <td className="py-3 px-4 max-sm:hidden">{index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{job.title}</div>
                    {job.category && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                        {job.category}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 max-sm:hidden text-gray-600 text-sm">
                    {moment(job.date).format("MMM DD, YYYY")}
                  </td>
                  <td className="py-3 px-4 max-sm:hidden text-gray-600 text-sm">{job.location}</td>
                  <td className="py-3 px-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!job.visible}
                        onChange={() => changeJobVisibility(job._id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </label>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Job Button */}
      {filteredAndSortedJobs.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => navigate("/dashboard/add-job")}
            className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all duration-200"
          >
            Add New Job
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
