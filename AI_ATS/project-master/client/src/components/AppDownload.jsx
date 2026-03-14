import React from 'react'
import { assets } from '../assets/assets'

const AppDownload = () => {
  return (
    <div className='px-4 sm:px-5 my-12 sm:my-20 overflow-hidden'>
      <div className='relative bg-gradient-to-r from-violet-50 to-purple-50 p-6 sm:p-12 lg:p-24 xl:p-32 rounded-lg overflow-hidden max-w-full'>
        
        {/* Content */}
        <div className='relative z-10'>
          <h1 className='text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 sm:mb-8 max-w-md'>
            Download Mobile App For Better Experience
          </h1>

          <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
            <a href="#" className='inline-block'>
              <img
                className='h-10 sm:h-12 w-auto'
                src={assets.play_store}
                alt="Google Play Store"
              />
            </a>

            <a href="#" className='inline-block'>
              <img
                className='h-10 sm:h-12 w-auto'
                src={assets.app_store}
                alt="App Store"
              />
            </a>
          </div>
        </div>

        {/* Image */}
        <img
          className='absolute w-32 sm:w-48 lg:w-64 xl:w-80 right-0 sm:right-4 lg:right-8 bottom-0 max-lg:opacity-30 lg:opacity-100 pointer-events-none'
          src={assets.app_main_img}
          alt="Mobile App"
        />
      </div>
    </div>
  )
}

export default AppDownload
