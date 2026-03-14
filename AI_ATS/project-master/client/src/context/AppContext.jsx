import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { user } = useUser();
  const { getToken } = useAuth();

  // 🔍 Search State
  const [searchFilter, setSearchFilter] = useState({
    title: "",
    location: "",
  });
  const [isSearched, setIsSearched] = useState(false);

  // 💼 Jobs State
  const [jobs, setJobs] = useState([]);

  // 👤 Recruiter State
  const [showRecruiterLogin, setShowRecruiterLogin] = useState(false);
  const [companyToken, setCompanyToken] = useState(null);
  const [companyData, setCompanyData] = useState(null);

  // 👑 Admin State
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminToken, setAdminToken] = useState(null);
  const [adminData, setAdminData] = useState(null);

  // 🙋 User Data & Applications State
  const [userData, setUserData] = useState(null);
  const [userApplications, setUserApplications] = useState([]);

  // ===========================
  // 📌 Fetch All Jobs
  // ===========================
  const fetchJobs = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/jobs`);
      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (error) {
      console.log("Fetch Jobs Error:", error);
    }
  };

  // ===========================
  // 📝 Fetch User Applications
  // ===========================
  const fetchUserApplications = async () => {
    try {
      if (!user) return;

      const { data } = await axios.get(
        `${backendUrl}/api/applications/user`,
        { params: { userId: user.id } }
      );

      if (data.success) {
        setUserApplications(data.applications);
      }
    } catch (error) {
      console.log("❌ Fetch Applications Error:", error);
    }
  };

  // ===========================
  // 👤 Fetch User Profile Data
  // ===========================
  const fetchUserData = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/users/user`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setUserData(data.user);
      }
    } catch (error) {
      console.log("Fetch User Data Error:", error.message);
    }
  };

  // ===========================
  // 🏢 Fetch Company Data
  // ===========================
  const fetchCompanyData = async () => {
    try {
      const token = companyToken || localStorage.getItem("companyToken");
      if (!token) return;

      const { data } = await axios.get(
        `${backendUrl}/api/company/company`,
        { headers: { token } }
      );

      if (data.success) {
        setCompanyData(data.company);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ===========================
  // 🚀 Initial Load
  // ===========================
  useEffect(() => {
    fetchJobs();

    const storedCompanyToken = localStorage.getItem("companyToken");
    if (storedCompanyToken) setCompanyToken(storedCompanyToken);

    const storedAdminToken = localStorage.getItem("adminToken");
    if (storedAdminToken) setAdminToken(storedAdminToken);
  }, []);

  // Fetch company data when token exists
  useEffect(() => {
    if (companyToken) fetchCompanyData();
  }, [companyToken]);

  // Fetch user data & applications when user logs in
  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUserApplications();
    }
  }, [user]);

  // ===========================
  // 🌍 Context Value
  // ===========================
  const value = {
    searchFilter, setSearchFilter,
    isSearched, setIsSearched,

    jobs, setJobs,
    fetchJobs, // 🔥 الإضافة المهمة

    showRecruiterLogin, setShowRecruiterLogin,
    companyToken, setCompanyToken,
    companyData, setCompanyData,

    showAdminLogin, setShowAdminLogin,
    adminToken, setAdminToken,
    adminData, setAdminData,

    userData, setUserData,
    userApplications, setUserApplications,
    fetchUserApplications,

    backendUrl
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
