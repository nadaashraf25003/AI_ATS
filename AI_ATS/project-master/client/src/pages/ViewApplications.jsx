import React, { useState, useEffect, useMemo, useContext } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import Loading from "../components/Loading";
const ViewApplications = () => {
  const { backendUrl, companyToken, companyData } = useContext(AppContext);

  const [applications, setApplications] = useState(false); // false → Loading
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // ================= 1️⃣ Fetch Applications =================
  const fetchCompanyJobApplications = async () => {
    try {
      if (!companyData?._id) return;

      const { data } = await axios.get(`${backendUrl}/api/company/applicants`, {
        headers: { token: companyToken }
      });

      if (data.success) {
        setApplications(data.applications);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (companyToken && companyData?._id) {
      fetchCompanyJobApplications();
    }
  }, [companyToken, companyData]);

  // ================= 2️⃣ Update Status =================
  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/applications/change-status`,
        { id, status },
        { headers: { token: companyToken } }
      );

      if (data.success) {
        toast.success(`Application ${status} successfully!`);
        fetchCompanyJobApplications();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ================= 3️⃣ Statistics =================
  const stats = useMemo(() => {
    if (!applications) return { total: 0, pending: 0, accepted: 0, rejected: 0 };

    return {
      total: applications.length,
      pending: applications.filter(app => app.status === "Pending").length,
      accepted: applications.filter(app => app.status === "Accepted").length,
      rejected: applications.filter(app => app.status === "Rejected").length,
    };
  }, [applications]);

  // ================= 4️⃣ Filter & Sort =================
  const filteredAndSortedApplications = useMemo(() => {
    if (!applications) return [];

    let filtered = applications.filter(app => {
      const userName =  app.userName || "Unknown";
      const jobTitle = app.jobId?.title || "Unknown Job";

      const matchesSearch =
        searchQuery === "" ||
        userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        const nameA = a.userId?.name || "";
        const nameB = b.userId?.name || "";
        return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      } else {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
    });

    return filtered;
  }, [applications, searchQuery, statusFilter, sortBy, sortOrder]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("date");
    setSortOrder("desc");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all";

  if (applications === false) return <Loading />;
applications && applications.forEach(app => {
  console.log("📝 Application ID:", app._id);
  console.log("👤 UserId:", app.userId);
  console.log("👤 User Name:", app.userName);
  console.log("💼 Job:", app.jobId);
  console.log("💼 Job Title:", app.jobId?.title);
  console.log("----------------------");
});

  return (
    <div className="px-5 py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">View Applications</h2>
        <p className="text-gray-600">Review and manage job applications from candidates.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-600">Total Applications</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-yellow-700">Pending</p>
          <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="bg-green-50 border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-green-700">Accepted</p>
          <p className="text-3xl font-bold text-green-700">{stats.accepted}</p>
        </div>
        <div className="bg-red-50 border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-red-700">Rejected</p>
          <p className="text-3xl font-bold text-red-700">{stats.rejected}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by candidate or job..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 border px-3 py-2 rounded-lg outline-none"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded px-2 py-1 text-sm">
            <option value="date">Date</option>
            <option value="name">Name</option>
          </select>
          <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} className="border px-2 py-1 rounded text-sm">
            {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
          </button>
          {hasActiveFilters && (
            <button onClick={handleClearFilters} className="text-red-500 text-sm hover:underline">Clear Filters</button>
          )}
          <div className="ml-auto text-sm text-gray-500 italic">
            Showing {filteredAndSortedApplications.length} applications
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
        <table className="min-w-full">
          <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
            <tr>
              <th className="py-3 px-4 text-left">Candidate</th>
              <th className="py-3 px-4 text-left">Job Title</th>
              <th className="py-3 px-4 text-left">Applied Date</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAndSortedApplications.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-gray-400">No applications found.</td></tr>
            ) : (
              filteredAndSortedApplications.map(app => (
                <tr key={app._id} className="hover:bg-blue-50/50">
                  <td className="py-4 px-4 flex items-center gap-2">
                    <img src={app.userImage} alt="" className="w-10 h-10 rounded-full object-cover border" />
                    <div>
                      <div className="font-bold">{app.userName}</div>
                      {app.userId?.resume && (
                        <a href={app.userId.resume} target="_blank" rel="noreferrer" className="text-blue-500 text-xs hover:underline">
                          View Resume
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">{app.jobId?.title || "Unknown"}</td>
                  <td className="py-4 px-4">{moment(app.date).format("MMM DD, YYYY")}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold 
                      ${app.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                        app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {app.status === "Pending" ? (
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(app._id, 'Accepted')} className="text-green-600 text-xs border px-2 py-1 rounded">Accept</button>
                        <button onClick={() => updateStatus(app._id, 'Rejected')} className="text-red-600 text-xs border px-2 py-1 rounded">Reject</button>
                      </div>
                    ) : <span className="text-xs text-gray-400 italic">Decision Made</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewApplications;
