import { useState, useEffect } from 'react';

/**
 * Hook to detect whether the user is on a mobile device or tablet.
 * Per requirements:
 * - Mobile phones and tablets (< 1024px or touch-based mobile/tablet agents) are restricted to the Pilgrim interface.
 * - Desktop/laptops (>= 1024px) retain Pilgrim, Staff, and Admin interfaces.
 */
export const useDevice = () => {
  const checkIsMobile = () => {
    if (typeof window === 'undefined') return false;
    
    // Check screen width breakpoint for mobile/tablet (< 1024px)
    const isSmallScreen = window.innerWidth < 1024;
    
    // Check mobile / tablet user agent
    const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Tablet/i.test(userAgent);
    
    // Touch detection
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    return isSmallScreen || (isMobileUA && isTouchDevice);
  };

  const [isMobile, setIsMobile] = useState(checkIsMobile);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return {
    isMobile,
    isDesktop: !isMobile
  };
};

export default useDevice;
