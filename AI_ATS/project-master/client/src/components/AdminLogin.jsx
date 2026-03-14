import { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

/**
 * AdminLogin Component
 * Modal component for admin authentication
 * Matches the design pattern of RecruiterLogin
 */
const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setShowAdminLogin, setAdminToken, setAdminData } =
    useContext(AppContext);

  const onSubmitHandler = (e) => {
    e.preventDefault();

    // Admin credentials - Secure password
    const ADMIN_EMAIL = "admin@jobportal.com";
    const ADMIN_PASSWORD = "Admin@Secure2024!";

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminInfo = {
        email: ADMIN_EMAIL,
        name: "Admin",
        role: "admin",
      };

      setAdminData(adminInfo);
      setAdminToken("adminToken");
      localStorage.setItem("adminData", JSON.stringify(adminInfo));
      localStorage.setItem("adminToken", "adminToken");

      toast.success("Login successful! Welcome back, Admin.");
      setShowAdminLogin(false);
      navigate("/admin/dashboard");
    } else {
      toast.error(
        "Invalid admin credentials! Please check your email and password."
      );
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] backdrop-blur-sm bg-black/50 flex justify-center items-center p-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={onSubmitHandler}
          className="relative bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl text-slate-500"
        >
          <h1 className="text-center text-2xl sm:text-3xl text-neutral-800 font-bold mb-2">
            Admin Login
          </h1>

          <p className="text-sm mt-2 mb-6 text-center text-gray-600">
            Enter your admin credentials to access the admin dashboard
          </p>

          <div className="space-y-4 mt-6">
            <div className="border-2 border-gray-200 hover:border-blue-400 focus-within:border-blue-500 px-4 py-3 flex items-center gap-3 rounded-xl transition-all duration-200 bg-gray-50 focus-within:bg-white">
              <img
                src={assets.email_icon}
                alt="Email Icon"
                className="w-5 h-5 opacity-60"
              />
              <input
                className="outline-none text-sm flex-1 bg-transparent text-gray-700 placeholder-gray-400"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Admin Email"
                required
              />
            </div>

            <div className="border-2 border-gray-200 hover:border-blue-400 focus-within:border-blue-500 px-4 py-3 flex items-center gap-3 rounded-xl transition-all duration-200 bg-gray-50 focus-within:bg-white">
              <img
                src={assets.lock_icon}
                alt="Lock Icon"
                className="w-5 h-5 opacity-60"
              />
              <input
                className="outline-none text-sm flex-1 bg-transparent text-gray-700 placeholder-gray-400"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full text-white py-3 rounded-xl mt-6 font-semibold text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            Login
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </button>

          <button
            type="button"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700"
            onClick={() => setShowAdminLogin(false)}
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
