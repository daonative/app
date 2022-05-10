import { useState } from 'react';
import { Feedback } from './FeedbackModal';
import HeaderNavigation from './HeaderNavigation';
import SidebarNavigation from './SidebarNavigation';

export const LayoutWrapper = ({ children }) => {
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);

  const handleShowMobileSidebar = () => setShowSidebarMobile(true);
  const handleCloseMobileSidebar = () => setShowSidebarMobile(false);

  return (
    <div className='h-full max-w-6xl m-auto'>
      <SidebarNavigation showMobile={showSidebarMobile} onClose={handleCloseMobileSidebar} />
      <HeaderNavigation onShowSidebar={handleShowMobileSidebar} onToggleDarkMode={() => { }} showLogWork={false} />
      <div
        style={{ height: 'calc(100% - 64px)' }}
        className="md:pl-64 flex-col md:flex overflow-auto bg-daonative-dark-300 text-daonative-gray-100 justify-between">
        <main className="w-full py-6">
          {children}
        </main>
        <div className="text-[#70708A] px-2 bottom-0 py-2 text-xs border-top border-daonative-border border-t-2 w-full flex justify-between items-center">
          <div>
            Made w/ ❤️ by regens
          </div>
          <Feedback />
        </div>
      </div>
    </div >
  );
};