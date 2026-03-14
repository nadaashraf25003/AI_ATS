// import React, { useContext, useEffect, useState } from "react";
// import { AppContext } from "../context/AppContext";
// import {
//   assets,
//   JobCategories,
//   JobLocations,
// } from "../assets/assets";
// import JobCard from "./JobCard";

// const JobListing = () => {
//   const { isSearched, searchFilter, setSearchFilter, jobs} = useContext(AppContext);

//   const [showFilter,setShowFilter] = useState(false)

//   const [CurrentPage, setCurrentPage] = useState(1)
//   const [selectedCategories,setSelectedCategories] = useState([])
//   const [selectedLocation,setSelectedLocation] = useState([])

//   const [filteredJobs,setFilteredJobs] = useState(jobs)

//   const handleCategoryChange = (category) => {
//     setSelectedCategories(
//       prev => prev.includes(category) ? prev.filter( c => c !== category) : [...prev,category]
//     )
//   }

//   const handleLocationChange = (location) => {
//     setSelectedLocation(
//       prev => prev.includes(location) ? prev.filter( c => c !== location) : [...prev,location]
//     )
//   }

//   useEffect(() => {
//     const matchingCategory = (job) =>
//       selectedCategories.length === 0 || selectedCategories.includes(job.category);
  
//     const matchingLocation = (job) =>
//       selectedLocation.length === 0 || selectedLocation.includes(job.location);
  
//     const matchingTitle = (job) =>
//       searchFilter.title === "" ||
//       job.title.toLowerCase().includes(searchFilter.title.toLowerCase());
  
//     const matchingSearchLocation = (job) =>
//       searchFilter.location === "" ||
//       job.location.toLowerCase().includes(searchFilter.location.toLowerCase());
  
//     const newFilteredJobs = jobs
//       .slice()
//       .reverse()
//       .filter(
//         (job) =>
//           matchingCategory(job) &&
//           matchingLocation(job) &&
//           matchingTitle(job) &&
//           matchingSearchLocation(job)
//       );
  
//     setFilteredJobs(newFilteredJobs);
//     setCurrentPage(1);
//   }, [jobs, selectedCategories, selectedLocation, searchFilter]);

//   return (
//     <div className="container 2xl:px-20 mx-auto flex flex-col lg:flex-row max-lg:space-y-8 py-8">
//       {/* Sidebar */}
//       <div className="w-full lg:w-1/4 bg-white px-4">
//         {/* Search Filter from hero component */}
//         {isSearched &&
//           (searchFilter.title !== "" || searchFilter.location !== "") && (
//             <div>
//               <h3 className="font-medium text-lg mb-4">Current Search</h3>
//               <div className="mb-4 text-gray-600">
//                 {searchFilter.title && (
//                   <span className="inline-flex items-center gap-2.5 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded">
//                     {searchFilter.title}
//                     <img
//                       onClick={() =>
//                         setSearchFilter((prev) => ({ ...prev, title: "" }))
//                       }
//                       className="cursor-pointer"
//                       src={assets.cross_icon}
//                       alt="Remove title filter"
//                     />
//                   </span>
//                 )}
//                 {searchFilter.location && (
//                   <span className="ml-2 inline-flex items-center gap-2.5 bg-red-50 border border-red-200 px-4 py-1.5 rounded">
//                     {searchFilter.location}
//                     <img
//                       onClick={() =>
//                         setSearchFilter((prev) => ({ ...prev, location: "" }))
//                       }
//                       className="cursor-pointer"
//                       src={assets.cross_icon}
//                       alt="Remove location filter"
//                     />
//                   </span>
//                 )}
//               </div>
//             </div>
//           )}
//           <button onClick={e => setShowFilter(prev => !prev)} className='px-6 py-1.5 rounded border border-gray-400 lg:hidden'>
//             {showFilter ? "Close" : "Filters"}
//           </button>

//         {/* category filter */}
//         <div className={showFilter ? "" : "max-lg:hidden"}>
//           <h4 className="font-medium text-lg py-4">Search by Categories</h4>
//           <ul className="space-y-4 text-gray-600">
//             {JobCategories.map((category, index) => (
//               <li className="flex gap-3 items-center" key={index}>
//                 <input 
//                  className="scale-125"
//                  type="checkbox" 
//                  onChange={() => handleCategoryChange(category)}
//                  checked = {selectedCategories.includes(category)}
//                   />
//                 {category}
//               </li>
//             ))}
//           </ul>
//         </div>
//         {/* location filter */}
//         <div className={showFilter ? "" : "max-lg:hidden"}>
//           <h4 className="font-medium text-lg py-4 pt-14">Search by Location</h4>
//           <ul className="space-y-4 text-gray-600">
//             {JobLocations.map((location, index) => (
//               <li className="flex gap-3 items-center" key={index}>
//                 <input 
//                 className="scale-125" 
//                 type="checkbox" 
//                 onChange={() => handleLocationChange(location)}
//                 checked = {selectedLocation.includes(location)} />
//                 {location}
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>

//       {/* Job listing */}
//       <section className="w-full lg:w-3/4 text-gray-800 max-lg:px-4">
//         <h3 className="font-medium text-3xl py-2" id="job-list">
//           Latest jobs
//         </h3>
//         <p className="mb-8">Get your desired job at top companies</p>
//         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
//           {filteredJobs.slice((CurrentPage-1)*6,CurrentPage*6).map((job, index) => (
//             <JobCard key={index} job={job} />
//           ))}
//         </div>

//         {/* Pagination */}
//         {filteredJobs.length > 0 && (
//           <div className='flex items-center justify-center space-x-2 mt-10'>
//             <a href="#job-list">
//               <img onClick={() => setCurrentPage(Math.max(CurrentPage-1),1)} src={assets.left_arrow_icon} alt="" /> 
//             </a>
//             {Array.from({length:Math.ceil(filteredJobs.length/6)}).map((_,index) => (
//               <a key={index} href="#job-list">
//                 <button onClick={()=> setCurrentPage(index+1)} className={`w-10 h-10 flex items-center justify-center border border-gray-300 rounded ${CurrentPage === index + 1? 'bg-blue-100 text-blue-500' : 'text-gray-500'}`}>{index + 1}</button>
//               </a>
//             ))}
//             <a href="#job-list">
//               <img onClick={() => setCurrentPage(Math.min(CurrentPage+1,Math.ceil(filteredJobs.length / 6)))} src={assets.right_arrow_icon} alt="" /> 
//             </a>
//          </div>
//         )}
//       </section>
//     </div>
//   );
// };

// export default JobListing;
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { assets, JobCategories, JobLocations } from "../assets/assets";
import JobCard from "./JobCard";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";

const JobListing = () => {
  const {
    isSearched,
    searchFilter,
    setSearchFilter,
    setIsSearched,
    jobs,
    loadingJobs,
  } = useContext(AppContext);

  const [showFilter, setShowFilter] = useState(false);
  const [filteredJobs, setFilteredJobs] = useState([]);

  // Pagination states
  const [CurrentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("jobListingCurrentPage");
    return savedPage ? parseInt(savedPage, 10) : 1;
  });

  const [selectedCategories, setSelectedCategories] = useState(() => {
    const saved = localStorage.getItem("jobListingSelectedCategories");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedLocation, setSelectedLocation] = useState(() => {
    const saved = localStorage.getItem("jobListingSelectedLocation");
    return saved ? JSON.parse(saved) : [];
  });

  const getFilterStateKey = (categories, locations, search) =>
    JSON.stringify({
      categories: [...categories].sort(),
      locations: [...locations].sort(),
      searchTitle: search.title || "",
      searchLocation: search.location || "",
    });

  const [lastFilterState, setLastFilterState] = useState(() => {
    const saved = localStorage.getItem("jobListingLastFilterState");
    return saved || "";
  });

  // حفظ القيم في localStorage
  useEffect(() => localStorage.setItem("jobListingCurrentPage", CurrentPage.toString()), [CurrentPage]);
  useEffect(() => localStorage.setItem("jobListingSelectedCategories", JSON.stringify(selectedCategories)), [selectedCategories]);
  useEffect(() => localStorage.setItem("jobListingSelectedLocation", JSON.stringify(selectedLocation)), [selectedLocation]);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleLocationChange = (location) => {
    setSelectedLocation((prev) =>
      prev.includes(location) ? prev.filter((c) => c !== location) : [...prev, location]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedLocation([]);
    setSearchFilter({ title: "", location: "" });
    setIsSearched(false);
    localStorage.removeItem("jobListingLastFilterState");
    setLastFilterState("");
    setCurrentPage(1);
  };

  // --- منطق التصفية (الفلترة) المعدل ---
  useEffect(() => {
    if (!jobs || jobs.length === 0) {
      setFilteredJobs([]);
      return;
    }

    const newFilteredJobs = jobs.slice().reverse().filter((job) => {
      // 1. التأكد من ظهور الوظائف المرئية فقط
      const isVisible = job.visible === true || job.visible === undefined;

      // 2. مطابقة الفئات (مع تجاهل حالة الأحرف)
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.some(cat => cat.toLowerCase() === job.category?.toLowerCase());

      // 3. مطابقة الموقع (مع تجاهل حالة الأحرف)
      const matchesLocation = selectedLocation.length === 0 || 
        selectedLocation.some(loc => loc.toLowerCase() === job.location?.toLowerCase());

      // 4. مطابقة نص البحث (العنوان، الفئة، الشركة)
      const searchTitleTerm = searchFilter.title?.toLowerCase() || "";
      const matchesSearchTitle = searchTitleTerm === "" || 
        job.title?.toLowerCase().includes(searchTitleTerm) || 
        job.category?.toLowerCase().includes(searchTitleTerm) || 
        job.companyId?.name?.toLowerCase().includes(searchTitleTerm); // البحث في اسم الشركة لو متاح

      // 5. مطابقة موقع البحث
      const searchLocTerm = searchFilter.location?.toLowerCase() || "";
      const matchesSearchLocation = searchLocTerm === "" || 
        job.location?.toLowerCase().includes(searchLocTerm);

      return isVisible && matchesCategory && matchesLocation && matchesSearchTitle && matchesSearchLocation;
    });

    setFilteredJobs(newFilteredJobs);

    // إعادة الصفحة للأولى عند تغيير الفلاتر
    const currentFilterState = getFilterStateKey(selectedCategories, selectedLocation, searchFilter);
    if (lastFilterState !== currentFilterState) {
      setCurrentPage(1);
      setLastFilterState(currentFilterState);
      localStorage.setItem("jobListingLastFilterState", currentFilterState);
    }
  }, [jobs, selectedCategories, selectedLocation, searchFilter]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6 lg:gap-8 py-6 max-w-full">
      {/* Sidebar - كما هو في كودك مع تعديل بسيط في العرض */}
      <aside className="w-full lg:w-64 xl:w-72 bg-white rounded-xl shadow-md border border-gray-200 py-6 px-4 sm:px-5 lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto sidebar-scroll">
        {(isSearched && (searchFilter.title || searchFilter.location)) || selectedCategories.length > 0 || selectedLocation.length > 0 ? (
          <div className="mb-4 pb-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-gray-800">Active Filters</h3>
              <button onClick={handleResetFilters} className="text-xs text-blue-600 hover:underline">Clear All</button>
            </div>
          </div>
        ) : null}

        <button
          onClick={() => setShowFilter((prev) => !prev)}
          className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 bg-white lg:hidden mb-4 font-semibold text-sm text-gray-700"
        >
          {showFilter ? "Hide Filters" : "Show Filters"}
        </button>

        <div className={`${showFilter ? "" : "max-lg:hidden"}`}>
          <h4 className="font-semibold text-sm py-2.5 text-gray-800 border-b-2 border-gray-200">Categories</h4>
          <ul className="space-y-2 text-gray-700 mt-3">
            {JobCategories.map((category, index) => (
              <li key={index} className="flex gap-2 items-center hover:bg-blue-50 p-1 rounded transition-all">
                <input type="checkbox" onChange={() => handleCategoryChange(category)} checked={selectedCategories.includes(category)} />
                <label className="text-sm">{category}</label>
              </li>
            ))}
          </ul>
        </div>

        <div className={`${showFilter ? "" : "max-lg:hidden"} mt-4`}>
          <h4 className="font-semibold text-sm py-2.5 text-gray-800 border-b-2 border-gray-200">Location</h4>
          <ul className="space-y-2 text-gray-700 mt-3">
            {JobLocations.map((location, index) => (
              <li key={index} className="flex gap-2 items-center hover:bg-blue-50 p-1 rounded transition-all">
                <input type="checkbox" onChange={() => handleLocationChange(location)} checked={selectedLocation.includes(location)} />
                <label className="text-sm">{location}</label>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Jobs Display */}
      <main className="flex-1 w-full text-gray-800 px-4 sm:px-0">
        <h3 className="font-bold text-3xl py-2 mb-4">Latest Jobs</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {loadingJobs ? (
            <SkeletonLoader count={6} />
          ) : filteredJobs.length > 0 ? (
            filteredJobs.slice((CurrentPage - 1) * 6, CurrentPage * 6).map((job) => (
              <JobCard key={job._id || job.id} job={job} />
            ))
          ) : (
            <div className="col-span-full">
              <EmptyState
                title="No jobs found"
                description="Try adjusting filters or search keywords"
                showResetButton
                onReset={handleResetFilters}
              />
            </div>
          )}
        </div>

        {/* Pagination Controls - تأكد من إضافتها لو كانت ناقصة */}
        {filteredJobs.length > 6 && (
          <div className="flex justify-center mt-10 gap-2">
            {Array.from({ length: Math.ceil(filteredJobs.length / 6) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded ${CurrentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default JobListing;
