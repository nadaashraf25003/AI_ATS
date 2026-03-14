import React, { useContext, useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { JobCategories, JobLocations } from '../assets/assets';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddJob = () => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Bangalore');
  const [category, setCategory] = useState('Programming');
  const [level, setLevel] = useState('Beginner level');
  const [salary, setSalary] = useState(0);

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const { backendUrl, companyToken } = useContext(AppContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const description = quillRef.current?.root.innerHTML || '';

      const { data } = await axios.post(
        `${backendUrl}/api/company/post-job`,
        { title, description, salary, location, category, level },
        { headers: { token: companyToken } }
      );

      if (data.success) {
        toast.success(data.message);
        setTitle('');
        setSalary(0);
        setLocation('Bangalore');
        setCategory('Programming');
        setLevel('Beginner level');
        if (quillRef.current) quillRef.current.root.innerHTML = '';
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred!');
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      const quillInstance = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ color: [] }, { background: [] }],
            ['link'],
            ['clean'],
          ],
        },
        placeholder: 'Describe the job requirements, responsibilities, and benefits...',
      });
      quillRef.current = quillInstance;
    }
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="px-5 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Job</h1>
          <p className="text-gray-600">
            Create a professional job posting to attract top talent
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={onSubmitHandler}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 space-y-8"
        >
          {/* Job Title Section */}
          <div className="space-y-2">
            <label
              htmlFor="job-title"
              className="block text-sm font-semibold text-gray-700"
            >
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              id="job-title"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Senior Frontend Developer"
              type="text"
              value={title}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Job Description Section */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Job Description <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200">
              <div ref={editorRef} className="min-h-[250px] bg-white"></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use the toolbar to format your job description
            </p>
          </div>

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Job Category */}
            <div className="space-y-2">
              <label
                htmlFor="job-category"
                className="block text-sm font-semibold text-gray-700"
              >
                Job Category
              </label>
              <select
                id="job-category"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-gray-900 bg-white cursor-pointer hover:border-gray-400"
                onChange={(e) => setCategory(e.target.value)}
                value={category}
              >
                {JobCategories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Location */}
            <div className="space-y-2">
              <label
                htmlFor="job-location"
                className="block text-sm font-semibold text-gray-700"
              >
                Job Location
              </label>
              <select
                id="job-location"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-gray-900 bg-white cursor-pointer hover:border-gray-400"
                onChange={(e) => setLocation(e.target.value)}
                value={location}
              >
                {JobLocations.map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Level */}
            <div className="space-y-2">
              <label
                htmlFor="job-level"
                className="block text-sm font-semibold text-gray-700"
              >
                Job Level
              </label>
              <select
                id="job-level"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-gray-900 bg-white cursor-pointer hover:border-gray-400"
                onChange={(e) => setLevel(e.target.value)}
                value={level}
              >
                <option value="Beginner level">Beginner level</option>
                <option value="Intermediate level">Intermediate level</option>
                <option value="Senior level">Senior level</option>
              </select>
            </div>

            {/* Job Salary */}
            <div className="space-y-2">
              <label
                htmlFor="job-salary"
                className="block text-sm font-semibold text-gray-700"
              >
                Job Salary
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  $
                </span>
                <input
                  id="job-salary"
                  min={0}
                  step="100"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                  onChange={(e) => setSalary(Number(e.target.value))}
                  type="number"
                  placeholder="25000"
                  value={salary || ""}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-start pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-gray-800 hover:to-gray-700 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              <span className="flex items-center gap-2">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Job
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJob;
