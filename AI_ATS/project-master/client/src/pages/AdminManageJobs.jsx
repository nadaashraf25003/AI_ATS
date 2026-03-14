import { useContext, useEffect, useState, useMemo } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import axios from "axios";
import { assets, JobCategories, JobLocations } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import Loading from "../components/Loading";

const AdminManageJobs = () => {
  // جلب البيانات من الـ Context
  const { jobs, setJobs, fetchJobs, backendUrl, adminToken, companyToken } = useContext(AppContext);

  const [loading, setLoading] = useState(true);

  // حالات الفلترة والبحث
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (jobs) setLoading(false);
  }, [jobs]);

  /* =========================
      Actions
  ========================== */

  // دالة تغيير الرؤية (Visibility) - تم التعديل لربطها بالـ Backend
  const toggleJobVisibility = async (id) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/company/change-visiblity`,
        { id },
        { headers: { token: adminToken || companyToken } }
      );

      if (data.success) {
        toast.success(data.message);
        // تحديث البيانات في الـ Context
        fetchJobs();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update visibility.");
    }
  };

  /* =========================
      Logic (Stats & Filter)
  ========================== */
  const stats = useMemo(() => {
    const total = jobs?.length || 0;
    const visible = jobs?.filter(j => j.visible !== false).length || 0;
    return {
      total,
      visible,
      hidden: total - visible,
      totalApplicants: jobs?.reduce((acc, job) => acc + (job.applicants?.length || 0), 0) || 0
    };
  }, [jobs]);

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = [...(jobs || [])];

    if (searchQuery) {
      filtered = filtered.filter(j =>
        j.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.companyId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory) filtered = filtered.filter(j => j.category === selectedCategory);
    if (selectedLocation) filtered = filtered.filter(j => j.location === selectedLocation);
    if (visibilityFilter !== "all") {
      filtered = filtered.filter(j => visibilityFilter === "visible" ? j.visible !== false : j.visible === false);
    }

    filtered.sort((a, b) => {
      let comp = sortBy === "title" ? a.title.localeCompare(b.title) : new Date(a.date) - new Date(b.date);
      return sortOrder === "asc" ? comp : -comp;
    });

    return filtered;
  }, [jobs, searchQuery, selectedCategory, selectedLocation, visibilityFilter, sortBy, sortOrder]);

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedJobs.slice(start, start + itemsPerPage);
  }, [filteredAndSortedJobs, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedJobs.length / itemsPerPage);

  if (loading) return <Loading />;

  return (
    <div className="px-5 py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">All Jobs Management</h2>
        <p className="text-gray-600">Monitor and manage job visibility in the system</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-600 uppercase">Total Jobs</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-green-700 uppercase">Visible Jobs</p>
          <p className="text-3xl font-bold text-green-700">{stats.visible}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-orange-700 uppercase">Hidden Jobs</p>
          <p className="text-3xl font-bold text-orange-700">{stats.hidden}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-blue-700 uppercase">Total Applicants</p>
          <p className="text-3xl font-bold text-blue-700">{stats.totalApplicants}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by title or company..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 border rounded-lg outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {JobCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="px-4 py-2.5 border rounded-lg outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <div className="flex items-center gap-4 mt-5 pt-5 border-t">
          <button
            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
            className="px-4 py-1.5 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Sort {sortOrder === "asc" ? "↑" : "↓"}
          </button>
          <button onClick={() => { setSearchQuery(""); setSelectedCategory(""); setVisibilityFilter("all"); }} className="text-sm text-blue-600 hover:underline">Clear Filters</button>
          <div className="ml-auto text-sm text-gray-500">
            Showing {filteredAndSortedJobs.length} jobs
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Job Title</th>
              <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Company</th>
              <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
              <th className="py-3 px-4 border-b text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Applicants</th>
              <th className="py-3 px-4 border-b text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Visibility</th>
            </tr>
          </thead>
          <tbody>
            {paginatedJobs.map((job) => (
              <tr key={job._id} className="hover:bg-blue-50 border-b border-gray-100 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-semibold text-gray-900">{job.title}</div>
                  <div className="text-xs text-gray-500">{job.location}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <img src={job.companyId?.image || assets.company_icon} alt="" className="w-8 h-8 rounded-full border shadow-sm" />
                    <span className="text-sm text-gray-700">{job.companyId?.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {moment(job.date).format("MMM DD, YYYY")}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">
                    {job.applicants?.length || 0}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleJobVisibility(job._id)}
                    className={`w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out ${job.visible !== false ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${job.visible !== false ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Prev
          </button>
          <span className="text-sm font-medium text-gray-700">Page {currentPage} of {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminManageJobs;