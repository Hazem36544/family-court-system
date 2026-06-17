import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = ({ trigger }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. التمرير للنافذة (للاحتياط)
    window.scrollTo(0, 0);

    // 2. التمرير للحاوية الداخلية الخاصة بالمحكمة
    const mainContainer = document.getElementById('court-main-scroll');
    if (mainContainer) {
      mainContainer.scrollTo(0, 0);
    }
  }, [pathname, trigger]); // trigger مهم هنا عشان لما تتغير الشاشة يعمل scroll

  return null;
};

export default ScrollToTop;