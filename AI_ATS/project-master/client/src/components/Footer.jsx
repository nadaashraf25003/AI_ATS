import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

/**
 * Footer Component
 * Professional footer component with enhanced modern design
 * Matches project's color scheme and business-focused styling
 */
const Footer = () => {
  const currentYear = new Date().getFullYear()

  // Quick links for the website
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Browse Jobs', path: '/#jobs' },
    { name: 'Download App', path: '/#app-download' },
  ]

  // Social media links with enhanced hover effects
  const socialLinks = [
    { 
      name: 'Facebook', 
      icon: assets.facebook_icon, 
      url: 'https://facebook.com',
      bgColor: 'bg-blue-600',
      hoverBg: 'hover:bg-blue-700'
    },
    { 
      name: 'Twitter', 
      icon: assets.twitter_icon, 
      url: 'https://twitter.com',
      bgColor: 'bg-sky-500',
      hoverBg: 'hover:bg-sky-600'
    },
    { 
      name: 'Instagram', 
      icon: assets.instagram_icon, 
      url: 'https://instagram.com',
      bgColor: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500',
      hoverBg: 'hover:from-purple-700 hover:via-pink-700 hover:to-orange-600'
    },
  ]

  return (
    <footer className='bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white mt-12 sm:mt-20 border-t border-gray-700'>
      {/* Main Section */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12'>
          
          {/* Company Info Section - Enhanced */}
          <div className='lg:col-span-1'>
            <div className='mb-6'>
              <div className='mb-4'>
                <img 
                  className='h-10 sm:h-12 w-auto mb-4 transition-transform duration-300 hover:scale-105 filter brightness-0 invert' 
                  src={assets.logo} 
                  alt="JobPortal Logo" 
                />
              </div>
              <p className='text-gray-300 text-sm sm:text-base leading-relaxed mb-6'>
                A professional platform for job searching, connecting job seekers with the best career opportunities across all industries.
              </p>
            </div>
            
            {/* Social Media Icons - Enhanced Design */}
            <div className='flex gap-3'>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={`
                    w-11 h-11 sm:w-12 sm:h-12 
                    flex items-center justify-center 
                    rounded-xl 
                    ${social.bgColor}
                    ${social.hoverBg}
                    transition-all duration-300 ease-in-out
                    hover:scale-110
                    hover:shadow-xl
                    hover:shadow-blue-500/50
                    group
                    backdrop-blur-sm
                  `}
                  aria-label={social.name}
                >
                  <img 
                    className='w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 group-hover:scale-110 brightness-0 invert' 
                    src={social.icon} 
                    alt={social.name} 
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Section - Enhanced */}
          <div>
            <h3 className='text-white font-bold text-lg sm:text-xl mb-5 sm:mb-6 flex items-center gap-2'>
              <div className='h-1 w-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full'></div>
              Quick Links
            </h3>
            <ul className='space-y-3'>
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className='
                      text-gray-300 
                      text-sm sm:text-base 
                      hover:text-white
                      hover:text-blue-400
                      transition-all duration-300 ease-in-out
                      inline-flex items-center gap-2
                      group
                    '
                  >
                    <svg 
                      className='w-4 h-4 opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300 text-blue-400' 
                      fill='none' 
                      stroke='currentColor' 
                      viewBox='0 0 24 24'
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                    </svg>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us Section - Enhanced */}
          <div>
            <h3 className='text-white font-bold text-lg sm:text-xl mb-5 sm:mb-6 flex items-center gap-2'>
              <div className='h-1 w-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full'></div>
              Contact Us
            </h3>
            <div className='space-y-4'>
              {/* Email */}
              <a 
                href='mailto:info@jobportal.com'
                className='flex items-start gap-3 group cursor-pointer p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300'
              >
                <div className='
                  w-11 h-11 
                  flex items-center justify-center 
                  rounded-xl 
                  bg-gradient-to-br from-blue-500 to-indigo-600
                  flex-shrink-0
                  group-hover:from-blue-600 group-hover:to-indigo-700
                  transition-all duration-300 ease-in-out
                  group-hover:scale-110
                  group-hover:shadow-lg
                  group-hover:shadow-blue-500/50
                '>
                  <img 
                    className='w-5 h-5 brightness-0 invert transition-all duration-300' 
                    src={assets.email_icon} 
                    alt="Email" 
                  />
                </div>
                <div className='flex-1'>
                  <p className='text-gray-400 text-xs sm:text-sm mb-1 font-medium'>Email</p>
                  <p className='text-gray-200 text-sm sm:text-base group-hover:text-blue-400 transition-colors duration-300 font-medium'>
                    info@jobportal.com
                  </p>
                </div>
              </a>
              
              {/* Address */}
              <div className='flex items-start gap-3 group cursor-pointer p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300'>
                <div className='
                  w-11 h-11 
                  flex items-center justify-center 
                  rounded-xl 
                  bg-gradient-to-br from-indigo-500 to-purple-600
                  flex-shrink-0
                  group-hover:from-indigo-600 group-hover:to-purple-700
                  transition-all duration-300 ease-in-out
                  group-hover:scale-110
                  group-hover:shadow-lg
                  group-hover:shadow-purple-500/50
                '>
                  <img 
                    className='w-5 h-5 brightness-0 invert transition-all duration-300' 
                    src={assets.location_icon} 
                    alt="Location" 
                  />
                </div>
                <div className='flex-1'>
                  <p className='text-gray-400 text-xs sm:text-sm mb-1 font-medium'>Address</p>
                  <p className='text-gray-200 text-sm sm:text-base group-hover:text-indigo-400 transition-colors duration-300 font-medium'>
                    United States
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Copyright - Enhanced */}
      <div className='border-t border-gray-700 bg-gray-900/50 backdrop-blur-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='
            flex flex-col sm:flex-row 
            items-center justify-center
            gap-3 sm:gap-4 
            text-sm sm:text-base 
            text-gray-400
          '>
            <p className='text-center'>
              © {currentYear} All rights reserved | 
              <span className='text-blue-400 font-semibold mx-1 hover:text-blue-300 transition-colors duration-300'>JobPortal</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
