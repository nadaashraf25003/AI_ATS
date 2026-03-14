import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const RecruiterLogin = () => {
  const navigate = useNavigate();

  const [state, setState] = useState('Login'); // 'Login' or 'Sign Up'
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState(null);
  const [isTextDataSubmited, setIsDataSubmited] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forget password states
  const [showForgetPassword, setShowForgetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const { setShowRecruiterLogin, backendUrl, setCompanyToken, setCompanyData } = useContext(AppContext);

  // دالة الـ Forget Password اللي طلبتيها
  const handleForgetPassword = () => {
    // هنا ممكن مستقبلاً تربطيها بـ API السيرفر
    if (!resetEmail) {
      toast.error("Please enter your email");
      return;
    }
    toast.success("Password reset link sent to your email (demo)");
    setShowForgetPassword(false);
    setResetEmail("");
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (state === 'Sign Up' && !isTextDataSubmited) {
      return setIsDataSubmited(true);
    }

    try {
      if (state === "Login") {
        // تسجيل الدخول الحقيقي عبر السيرفر
        const { data } = await axios.post(backendUrl + '/api/company/login', { email, password });

        if (data.success) {
          setCompanyData(data.company);
          setCompanyToken(data.token);
          localStorage.setItem('companyToken', data.token);
          setShowRecruiterLogin(false);
          toast.success(`Welcome back, ${data.company.name}!`);
          navigate('/dashboard/manage-jobs'); 
        } else {
          toast.error(data.message);
        }
      } else {
        // إنشاء حساب جديد باستخدام FormData للسيرفر
        const formData = new FormData();
        formData.append('name', name);
        formData.append('password', password);
        formData.append('email', email);
        formData.append('image', image);

        const { data } = await axios.post(backendUrl + '/api/company/register', formData);

        if (data.success) {
          setCompanyData(data.company);
          setCompanyToken(data.token);
          localStorage.setItem('companyToken', data.token);
          setShowRecruiterLogin(false);
          toast.success("Account created successfully!");
          navigate('/dashboard/manage-jobs');
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50 flex justify-center items-center p-4">
      <form
        onSubmit={onSubmitHandler}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-slate-500"
      >
        {/* زر الإغلاق */}
        <button
          type="button"
          onClick={() => setShowRecruiterLogin(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
        >
          ✕
        </button>

        <h1 className="text-center text-3xl font-bold text-neutral-800 mb-2">
          Recruiter {state}
        </h1>

        {state === 'Sign Up' && isTextDataSubmited ? (
          <div className="flex flex-col items-center gap-4 my-8">
            <label htmlFor="image" className="cursor-pointer group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 group-hover:border-blue-500 transition shadow-lg">
                <img
                  src={image ? URL.createObjectURL(image) : assets.upload_area}
                  className="w-full h-full object-cover"
                  alt="Company Logo"
                />
              </div>
              <input
                type="file"
                hidden
                id="image"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>
            <p className="text-sm text-gray-600 font-medium">Upload Company Logo</p>
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            {state === 'Sign Up' && (
              <div className="border-2 border-gray-200 focus-within:border-blue-500 rounded-xl px-4 py-3 flex items-center gap-3 bg-gray-50">
                <img src={assets.person_icon} className="w-5 h-5 opacity-60" alt="" />
                <input
                  className="flex-1 bg-transparent outline-none text-sm"
                  type="text"
                  placeholder="Company Name"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  required
                />
              </div>
            )}

            <div className="border-2 border-gray-200 focus-within:border-blue-500 rounded-xl px-4 py-3 flex items-center gap-3 bg-gray-50">
              <img src={assets.email_icon} className="w-5 h-5 opacity-60" alt="" />
              <input
                className="flex-1 bg-transparent outline-none text-sm"
                type="email"
                placeholder="Email ID"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>

            <div className="border-2 border-gray-200 focus-within:border-blue-500 rounded-xl px-4 py-3 flex items-center gap-3 bg-gray-50">
              <img src={assets.lock_icon} className="w-5 h-5 opacity-60" alt="" />
              <input
                className="flex-1 bg-transparent outline-none text-sm"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
        )}

        {/* حتة الـ Forget Password اللي طلبتيها */}
        {state === 'Login' && (
          <p 
            onClick={() => setShowForgetPassword(true)}
            className="text-sm text-blue-600 mt-4 text-center cursor-pointer hover:underline"
          >
            Forget password?
          </p>
        )}

        <button
          type="submit"
          className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition"
        >
          {state === 'Login' ? 'Login' : isTextDataSubmited ? 'Create Account' : 'Next'}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          {state === 'Login' ? (
            <>Don't have an account? <span onClick={() => setState('Sign Up')} className="text-blue-600 font-semibold cursor-pointer hover:underline">Sign Up</span></>
          ) : (
            <>Already have an account? <span onClick={() => setState('Login')} className="text-blue-600 font-semibold cursor-pointer hover:underline">Login</span></>
          )}
        </p>
      </form>

      {/* ================= FORGET PASSWORD MODAL ================= */}
      {showForgetPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold text-center mb-4 text-gray-800">
              Reset Password
            </h2>

            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleForgetPassword}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-xl font-semibold"
              >
                Send Link
              </button>
              <button
                onClick={() => setShowForgetPassword(false)}
                className="flex-1 border rounded-xl py-2 text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterLogin;