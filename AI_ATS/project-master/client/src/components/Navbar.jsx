import { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

/**
 * Navbar Component
 * شريط التنقل الرئيسي مع إخفاء/إظهار عند السكرول
 */
const Navbar = () => {
  const navigate = useNavigate();
  const { openSignIn } = useClerk();
  const { user } = useUser();

  const { setShowRecruiterLogin, setShowAdminLogin } =
    useContext(AppContext);

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // في أعلى الصفحة
      if (currentScrollY < 20) {
        setIsVisible(true);
      } 
      // سكرول لتحت → اخفاء
      else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } 
      // سكرول لفوق → إظهار
      else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-md transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between max-w-full">
        {/* Logo */}
        <img
          className="cursor-pointer h-8 sm:h-auto max-w-[120px] sm:max-w-none flex-shrink-0"
          onClick={() => navigate("/")}
          src={assets.logo}
          alt="Logo"
        />

        {/* Right Side */}
        {user ? (
          <div className="flex items-center gap-4 sm:gap-6 text-gray-700 font-medium">
            <Link
              to="/ats-checker"
              className="text-sm sm:text-base hover:text-blue-600 transition-colors"
            >
              ATS Checker
            </Link>

            <span className="hidden sm:block text-gray-300">|</span>

            <Link
              to="/applications"
              className="text-sm sm:text-base hover:text-blue-600 transition-colors"
            >
              Applied Jobs
            </Link>

            <span className="hidden sm:block text-gray-300">|</span>

            <p className="hidden sm:block text-sm sm:text-base">
              Hi, {user.firstName} {user.lastName}
            </p>

 <div className="scale-90 sm:scale-100">
              <UserButton />
            </div>


          </div>
        ) : (
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              onClick={() =>
                openSignIn({
                  forceRedirectUrl: '/ats-checker',
                  fallbackRedirectUrl: '/ats-checker',
                })
              }
              className="text-sm sm:text-base text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              ATS Checker
            </button>

            {/* Recruiter */}
            <button
              onClick={() => setShowRecruiterLogin(true)}
              className="text-sm sm:text-base text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              <span className="hidden sm:inline">Recruiter Login</span>
              <span className="sm:hidden">Recruiter</span>
            </button>

            {/* Admin */}
            <button
              onClick={() => setShowAdminLogin(true)}
              className="text-sm sm:text-base text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Admin
            </button>

            {/* User Login */}
            <button
              onClick={openSignIn}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 sm:px-7 lg:px-10 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold shadow-md hover:shadow-xl transition-all duration-300"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
