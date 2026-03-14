import { useState, useEffect } from "react";

/**
 * BackToTop Component
 * Professional back to top button with smooth scroll animation
 */
const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    /**
     * Handle scroll event with multiple checks for compatibility
     */
    const toggleVisibility = () => {
      // بنتحقق من أكتر من خاصية لضمان إنها تشتغل على كل المتصفحات
      const scrolled = window.scrollY || document.documentElement.scrollTop || window.pageYOffset;
      
      if (scrolled > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // إضافة passive لتحسين الأداء
    window.addEventListener("scroll", toggleVisibility, { passive: true });

    // تنظيف الـ Event عند مسح الـ Component
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          // التعديل هنا في z-[10000] و إضافة fixed بشكل صريح مع التأكد من الـ bottom/right
          className="fixed bottom-10 right-10 z-[10000] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-110 active:scale-95 group border-2 border-white/20"
          aria-label="Back to top"
        >
          <svg
            className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3} // خليت السهم أتخن شوية عشان يبان بوضوح
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </>
  );
};

export default BackToTop;