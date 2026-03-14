import React from "react";
import { assets } from "../assets/assets";

/**
 * EmptyState Component
 * Professional empty state with enhanced design and helpful suggestions
 * Provides better UX with illustrations and actionable buttons
 */
const EmptyState = ({ 
  title = "No jobs found", 
  description = "Try searching with different keywords or adjust the filters",
  showResetButton = false,
  onReset = () => {},
  icon = "search" // 'search', 'filter', 'job', 'application'
}) => {
  // Different icons based on context
  const getIcon = () => {
    switch (icon) {
      case "filter":
        return (
          <svg
            className="w-28 h-28 text-gray-300 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        );
      case "job":
        return (
          <svg
            className="w-28 h-28 text-gray-300 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
      case "application":
        return (
          <svg
            className="w-28 h-28 text-gray-300 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-28 h-28 text-gray-300 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 text-center">
      {/* Icon with Animation */}
      <div className="mb-6 animate-fade-in">
        <div className="relative">
          {getIcon()}
          {/* Decorative circles */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-100 rounded-full opacity-50 animate-pulse"></div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-indigo-100 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 max-w-md mb-8 text-base sm:text-lg leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {description}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        {showResetButton && (
          <button
            onClick={onReset}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset Filters
          </button>
        )}
      </div>

      {/* Helpful Tips */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100 max-w-md animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <p className="text-sm text-blue-800 font-medium mb-2">💡 Tips:</p>
        <ul className="text-xs sm:text-sm text-blue-700 text-left space-y-1">
          <li>• Try using broader search terms</li>
          <li>• Check your spelling</li>
          <li>• Remove some filters to see more results</li>
        </ul>
      </div>
    </div>
  );
};

export default EmptyState;

