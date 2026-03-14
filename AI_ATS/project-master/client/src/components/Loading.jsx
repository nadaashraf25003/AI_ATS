import React from "react";

/**
 * Loading Component
 * Professional loading spinner with modern design
 * Enhanced with smoother animations and visual feedback
 */
const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100/40">
      <div className="flex flex-col items-center gap-5">
        {/* Spinner Wrapper */}
        <div className="relative w-20 h-20">
          {/* Outer Spinner */}
          <div className="absolute inset-0 w-full h-full border-4 border-gray-200 border-t-4 border-t-blue-500 rounded-full animate-spin shadow-md" />
          {/* Inner Spinner */}
          <div
            className="absolute inset-2 w-16 h-16 border-4 border-transparent border-r-4 border-r-indigo-500 rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.2s" }}
          />
        </div>

        {/* Loading Text with bouncing dots */}
        <div className="flex items-center gap-3">
          <span className="text-gray-700 font-medium text-base sm:text-lg">Loading</span>
          <div className="flex gap-1">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
