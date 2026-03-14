import React from "react";

/**
 * SkeletonLoader Component
 * Modern skeleton loader with shimmer effect for job cards
 */
const SkeletonLoader = ({ count = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="border border-gray-200 p-4 sm:p-5 rounded-2xl shadow-lg bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse"
          role="status"
          aria-label="Loading..."
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Company Logo and Info Skeleton */}
          <div className="flex justify-between items-start mb-4 sm:mb-5 h-[4rem] sm:h-[4.25rem]">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-12 w-12 sm:h-14 sm:w-14 bg-gray-300 rounded-lg flex-shrink-0"></div>
              <div className="space-y-2">
                <div className="h-4 sm:h-5 w-28 sm:w-36 bg-gray-300 rounded"></div>
                <div className="h-3 sm:h-4 w-20 sm:w-24 bg-gray-300 rounded"></div>
              </div>
            </div>
            <div className="h-6 w-24 sm:w-28 bg-gray-300 rounded-full"></div>
          </div>

          {/* Title Skeleton */}
          <div className="h-5 sm:h-6 w-3/4 bg-gray-300 rounded mb-3 sm:mb-4"></div>
          <div className="h-5 sm:h-6 w-1/2 bg-gray-300 rounded mb-4 sm:mb-5"></div>

          {/* Tags Skeleton */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-3 sm:mb-4 min-h-[2.75rem]">
            <div className="h-7 w-24 sm:w-28 bg-gray-300 rounded-full"></div>
            <div className="h-7 w-28 sm:w-32 bg-gray-300 rounded-full"></div>
            <div className="h-7 w-24 sm:w-28 bg-gray-300 rounded-full"></div>
          </div>

          {/* Description Skeleton */}
          <div className="space-y-2 my-4 sm:my-5">
            <div className="h-3 sm:h-4 w-full bg-gray-300 rounded"></div>
            <div className="h-3 sm:h-4 w-5/6 bg-gray-300 rounded"></div>
            <div className="h-3 sm:h-4 w-4/6 bg-gray-300 rounded"></div>
          </div>

          {/* Buttons Skeleton */}
          <div className="mt-auto pt-4 border-t border-gray-200 flex gap-3 sm:gap-4">
            <div className="h-10 sm:h-11 flex-1 bg-gray-300 rounded-xl"></div>
            <div className="h-10 sm:h-11 w-28 sm:w-32 bg-gray-300 rounded-xl"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;
