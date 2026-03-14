import { useContext, useState, useEffect, useRef, useMemo, useCallback, } from "react"; 
import { assets } from "../assets/assets"; 
import { AppContext } from "../context/AppContext"; 
import TrustedBy from "./TrustedBy"; 

/** * Hero Component - Professional Search System 
 */ 
const Hero = () => { 
  const { setSearchFilter, setIsSearched, jobs } = useContext(AppContext); 
  const [titleInput, setTitleInput] = useState(""); 
  const [locationInput, setLocationInput] = useState(""); 
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false); 
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false); 
  const [isSearching, setIsSearching] = useState(false); 
  const [selectedIndex, setSelectedIndex] = useState({ title: -1, location: -1, }); 
  const debounceTimerRef = useRef(null); 
  const titleInputRef = useRef(null); 
  const locationInputRef = useRef(null); 
  const titleSuggestionsRef = useRef(null); 
  const locationSuggestionsRef = useRef(null); 
  const activeFieldRef = useRef("title"); 

  const popularSearches = useMemo(() => [ 
    "Software Engineer", "Data Scientist", "UI/UX Designer", "Product Manager", 
    "Marketing Manager", "Frontend Developer", "Backend Developer", "Full Stack Developer"
  ], []); 

  const popularLocations = useMemo(() => [ 
    "California", "New York", "Bangalore", "Hyderabad", "Washington", "Texas", "Florida", "Remote"
  ], []); 

  const generateSuggestions = useCallback((input, data, field) => { 
    if (!input || input.trim().length === 0 || !data || data.length === 0) return []; 
    const searchTerm = input.toLowerCase().trim(); 
    const results = []; 
    const uniqueValues = [...new Set(data.map((job) => job[field]).filter(Boolean))]; 
    uniqueValues.forEach((value) => { 
      const lowerValue = value.toLowerCase(); 
      let score = 0; 
      if (lowerValue === searchTerm) score = 100; 
      else if (lowerValue.startsWith(searchTerm)) score = 80; 
      else if (lowerValue.includes(searchTerm)) score = 60; 
      if (lowerValue.includes(` ${searchTerm}`) || lowerValue.includes(`${searchTerm} `)) score += 10; 
      if (score > 0) results.push({ value, score }); 
    }); 
    return results.sort((a, b) => b.score - a.score).slice(0, 8).map((item) => item.value); 
  }, []); 

  const titleSuggestions = useMemo(() => { 
    if (titleInput.length === 0 || !jobs || jobs.length === 0) return []; 
    return generateSuggestions(titleInput, jobs, "title"); 
  }, [titleInput, jobs, generateSuggestions]); 

  const locationSuggestions = useMemo(() => { 
    if (locationInput.length === 0 || !jobs || jobs.length === 0) return []; 
    return generateSuggestions(locationInput, jobs, "location"); 
  }, [locationInput, jobs, generateSuggestions]); 

  const highlightText = useCallback((text, query) => { 
    if (!query || query.trim().length === 0) return text; 
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"); 
    const parts = text.split(regex); 
    return parts.map((part, index) => regex.test(part) ? ( 
      <mark key={index} className="bg-blue-100 text-blue-800 font-semibold px-0.5 rounded">{part}</mark> 
    ) : (part)); 
  }, []); 

  useEffect(() => { 
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); 
    if (titleInput || locationInput) setIsSearching(true); 
    debounceTimerRef.current = setTimeout(() => { 
      if (titleInput || locationInput) { 
        setSearchFilter({ title: titleInput.trim(), location: locationInput.trim() }); 
        setIsSearched(true); 
      } 
      setIsSearching(false); 
    }, 300); 
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); }; 
  }, [titleInput, locationInput, setSearchFilter, setIsSearched]); 

  useEffect(() => { 
    const handleClickOutside = (event) => { 
      if (titleInputRef.current && !titleInputRef.current.contains(event.target) && !titleSuggestionsRef.current?.contains(event.target)) { 
        setShowTitleSuggestions(false); 
      } 
      if (locationInputRef.current && !locationInputRef.current.contains(event.target) && !locationSuggestionsRef.current?.contains(event.target)) { 
        setShowLocationSuggestions(false); 
      } 
    }; 
    document.addEventListener("mousedown", handleClickOutside); 
    return () => document.removeEventListener("mousedown", handleClickOutside); 
  }, []); 

  const onSearch = useCallback((e) => { 
    e.preventDefault(); 
    setSearchFilter({ title: titleInput.trim(), location: locationInput.trim() }); 
    setIsSearched(true); 
    setShowTitleSuggestions(false); 
    setShowLocationSuggestions(false); 
  }, [titleInput, locationInput, setSearchFilter, setIsSearched]); 

  const handleKeyPress = useCallback((e, fieldType) => { 
    if (e.key === "Enter") onSearch(e); 
    if (e.key === "Escape") { 
      setShowTitleSuggestions(false); 
      setShowLocationSuggestions(false); 
    } 
  }, [onSearch]); 

  const handleSuggestionClick = useCallback((suggestion, type) => { 
    if (type === "title") { setTitleInput(suggestion); setSearchFilter({ title: suggestion, location: locationInput.trim() }); } 
    else { setLocationInput(suggestion); setSearchFilter({ title: titleInput.trim(), location: suggestion }); } 
    setIsSearched(true); 
    setShowTitleSuggestions(false); 
    setShowLocationSuggestions(false); 
  }, [titleInput, locationInput, setSearchFilter, setIsSearched]); 

  return ( 
    /* التعديل هنا: تم تغيير mt-6 إلى mt-28 لإضافة مسافة كبيرة فوق الشكل الموف */
    <div className="px-4 sm:px-5 mt-28 sm:mt-32 mb-4 sm:mb-6 overflow-visible relative z-40"> 
      <div className="bg-gradient-to-r from-purple-800 to-purple-950 text-white py-8 sm:py-12 lg:py-16 text-center mx-0 sm:mx-2 rounded-lg sm:rounded-xl shadow-lg relative z-50"> 
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-4"> 
          Over 10,000+ jobs to apply 
        </h2> 
        <p className="mb-6 sm:mb-8 max-w-xl mx-auto text-sm sm:text-base lg:text-lg font-normal px-4 sm:px-5"> 
          Your Next Big Career Move Starts Right Here - Explore The Best Job Opportunities And Take The First Step Toward Your Future! 
        </p> 

        <form onSubmit={onSearch} className="max-w-4xl mx-2 sm:mx-4 lg:mx-auto relative z-[100]"> 
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-white rounded-xl p-2 sm:p-3 shadow-2xl w-full border border-gray-100"> 
            
            {/* حقل البحث عن الوظيفة */}
            <div className="relative flex-1" ref={titleInputRef}> 
              <div className="group flex items-center bg-gray-50 hover:bg-gray-100 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200"> 
                <img className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" src={assets.search_icon} alt="" /> 
                <input type="text" placeholder="Search for jobs" className="flex-1 bg-transparent outline-none text-gray-800 text-sm sm:text-base" value={titleInput} 
                  onChange={(e) => { setTitleInput(e.target.value); setShowTitleSuggestions(true); }} 
                  onKeyDown={(e) => handleKeyPress(e, "title")} 
                  onFocus={() => setShowTitleSuggestions(true)} 
                /> 
              </div> 
              {showTitleSuggestions && (titleSuggestions.length > 0) && ( 
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border z-[9999] text-gray-800 text-left overflow-hidden"> 
                  {titleSuggestions.map((s, i) => ( 
                    <div key={i} onClick={() => handleSuggestionClick(s, "title")} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm">{s}</div> 
                  ))} 
                </div> 
              )} 
            </div> 

            {/* حقل الموقع */}
            <div className="relative flex-1" ref={locationInputRef}> 
              <div className="group flex items-center bg-gray-50 hover:bg-gray-100 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200"> 
                <img className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" src={assets.location_icon} alt="" /> 
                <input type="text" placeholder="Location" className="flex-1 bg-transparent outline-none text-gray-800 text-sm sm:text-base" value={locationInput} 
                  onChange={(e) => { setLocationInput(e.target.value); setShowLocationSuggestions(true); }} 
                  onKeyDown={(e) => handleKeyPress(e, "location")} 
                  onFocus={() => setShowLocationSuggestions(true)} 
                /> 
              </div> 
              {showLocationSuggestions && (locationSuggestions.length > 0) && ( 
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border z-[9999] text-gray-800 text-left overflow-hidden"> 
                  {locationSuggestions.map((s, i) => ( 
                    <div key={i} onClick={() => handleSuggestionClick(s, "location")} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm">{s}</div> 
                  ))} 
                </div> 
              )} 
            </div> 

            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg flex items-center justify-center gap-2"> 
              <img src={assets.search_icon} className="w-4 h-4 invert" alt="" /> 
              Search 
            </button> 
          </div> 
        </form> 
      </div> 
      <div className="mt-16"> 
        <TrustedBy /> 
      </div> 
    </div> 
  ); 
}; 

export default Hero;