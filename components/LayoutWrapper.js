import { useEffect, useState } from 'react';
import HeaderNavigation from './HeaderNavigation';
import SidebarNavigation from './SidebarNavigation';

export const LayoutWrapper = ({ children }) => {
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);

  const handleShowMobileSidebar = () => setShowSidebarMobile(true);
  const handleCloseMobileSidebar = () => setShowSidebarMobile(false);

  // Temp until everyting is dark
  useEffect(() => {
    document.documentElement.classList.add('dark');
  });

  return (
    <div>
      <SidebarNavigation showMobile={showSidebarMobile} onClose={handleCloseMobileSidebar} />
      <HeaderNavigation onShowSidebar={handleShowMobileSidebar} onToggleDarkMode={() => { }} showLogWork={false} />
      <div className="md:pl-64 flex-row md:flex overflow-hidden bg-daonative-dark-300 text-daonative-gray-100">
        <main className="w-full py-6">
          {children}
        </main>
      </div>
      {/* <div>
        Made w/ ❤️ by regens
      </div> */}
    </div>
  );
};
