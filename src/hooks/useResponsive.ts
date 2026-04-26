import { useState, useEffect } from 'react';

/**
 * Breakpoints baseados no Design System do projeto (index.css / Tailwind)
 * lg: 1024px
 * xl: 1280px
 */
const BREAKPOINTS = {
  TABLET: 1024,
  DESKTOP: 1280,
};

export const useResponsive = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    windowWidth,
    isMobile: windowWidth < BREAKPOINTS.TABLET,
    isTablet: windowWidth >= BREAKPOINTS.TABLET && windowWidth < BREAKPOINTS.DESKTOP,
    isDesktop: windowWidth >= BREAKPOINTS.DESKTOP,
    // Helpers para facilitar o uso
    isLessThanDesktop: windowWidth < BREAKPOINTS.DESKTOP,
    isLessThanTablet: windowWidth < BREAKPOINTS.TABLET,
  };
};
