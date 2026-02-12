import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = ({ trigger }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, trigger]);

  return null;
};

export default ScrollToTop;
