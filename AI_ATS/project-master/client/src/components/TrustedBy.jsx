import { assets } from "../assets/assets";
import "../styles/trusted.css";

/**
 * TrustedBy Component
 * Professional infinite marquee slider using pure CSS animations
 *
 * Features:
 * - Smooth, continuous scrolling animation (LTR direction - left to right)
 * - Zero JavaScript overhead for animation performance
 * - Responsive design with optimized sizing for all devices
 * - Seamless infinite loop without gaps or jumps
 * - Hover effects for enhanced interactivity
 * - Optimized image loading for fast initial render
 *
 * Performance optimizations:
 * - CSS animations are GPU-accelerated for smooth 60fps performance
 * - No JavaScript animation loops reduce CPU usage
 * - Duplicate content ensures seamless infinite scrolling
 * - Optimized image loading with eager loading for critical content
 */
const TrustedBy = () => {
  // Company logos data
  // بيانات شعارات الشركات
  const companies = [
    { logo: assets.microsoft_logo, alt: "Microsoft" },
    { logo: assets.walmart_logo, alt: "Walmart" },
    { logo: assets.accenture_logo, alt: "Accenture" },
    { logo: assets.samsung_logo, alt: "Samsung" },
    { logo: assets.amazon_logo, alt: "Amazon" },
    { logo: assets.adobe_logo, alt: "Adobe" },
  ];

  // Duplicate companies array to ensure seamless infinite scrolling
  // مضاعفة مصفوفة الشركات لضمان التمرير اللا نهائي السلس
  // Two copies are sufficient for seamless loop with CSS animations
  // نسختان كافيتان للدورة السلسة مع CSS animations
  const duplicatedCompanies = [...companies, ...companies];

  return (
    <div className="trusted-by-container border border-gray-200 shadow-md mx-0 sm:mx-2 mt-4 sm:mt-5 p-4 sm:p-6 rounded-lg bg-white overflow-hidden max-w-full">
      {/* Marquee wrapper with overflow hidden to create scrolling effect */}
      {/* حاوية الماركيز مع إخفاء الفائض لإنشاء تأثير التمرير */}
      <div className="trusted-by-marquee">
        {/* Inner content wrapper that animates */}
        {/* حاوية المحتوى الداخلية التي تتحرك */}
        <div className="trusted-by-track">
          {/* First set of company logos */}
          {/* المجموعة الأولى من شعارات الشركات */}
          {duplicatedCompanies.map((company, index) => (
            <div key={`first-${index}`} className="trusted-by-item">
              <img
                src={company.logo}
                alt={company.alt}
                loading="eager"
                className="trusted-by-logo"
                draggable="false"
              />
            </div>
          ))}
          {/* Second set for seamless loop */}
          {/* المجموعة الثانية للدورة السلسة */}
          {duplicatedCompanies.map((company, index) => (
            <div key={`second-${index}`} className="trusted-by-item">
              <img
                src={company.logo}
                alt={company.alt}
                loading="eager"
                className="trusted-by-logo"
                draggable="false"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustedBy;
