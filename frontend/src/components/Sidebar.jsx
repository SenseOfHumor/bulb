import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On mobile, default to collapsed
      if (mobile) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update CSS custom property for main content margin
  useEffect(() => {
    const root = document.documentElement;
    if (isMobile) {
      root.style.setProperty('--sidebar-width', '0px');
    } else {
      root.style.setProperty('--sidebar-width', isExpanded ? '16rem' : '4rem');
    }
  }, [isExpanded, isMobile]);

  // Prevent body scroll when mobile sidebar is open and keep background visible
  useEffect(() => {
    if (isMobile && isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isExpanded]);

  // Close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (isMobile) {
      setIsExpanded(false);
    }
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v14a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
        </svg>
      )
    },
    {
      label: 'Upload',
      href: '/upload',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )
    },
    {
      label: 'Projects',
      href: '/projects',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      label: 'Knowledge Graph',
      href: '/knowledge-graph',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      )
    },
    {
      label: 'Assistant',
      href: '/assistant',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isExpanded && (
        <div 
          className="fixed inset-0 z-40 md:hidden backdrop-blur-sm bg-white/10"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full backdrop-blur-xl bg-white/5 border-r border-white/10 
        transition-all duration-300 ease-in-out z-50 shadow-2xl
        ${isExpanded ? 'w-64' : 'w-16'}
        ${isMobile && !isExpanded ? '-translate-x-full' : 'translate-x-0'}
      `}>
        
        {/* Header with toggle aligned to icons when collapsed */}
        <div className="flex items-center p-4 border-b border-white/10">
          <div className={`flex items-center transition-all duration-300 ${isExpanded ? 'flex-1 opacity-100 scale-100' : 'flex-none w-0 opacity-0 scale-95 overflow-hidden'}`}>
            <img src="/bulb/fixmynotes-ring.svg" alt="FixMyNotes" className="w-8 h-8 mr-3" />
            {isExpanded && <span className="text-xl font-bold text-white whitespace-nowrap">FixMyNotes</span>}
          </div>

          {/* Toggle: when collapsed, this container takes full width and centers the icon so it lines up with nav icons */}
          <div className={`flex items-center ${!isExpanded ? 'justify-center w-full' : 'justify-end'}`}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`relative flex items-center transition-all duration-200 group ${!isExpanded ? 'justify-center p-3 w-8 h-8' : 'p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white'} text-gray-300 hover:backdrop-blur-sm`}
              aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <span className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}>
                {isExpanded ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`mt-8 px-4 ${!isExpanded ? 'flex flex-col items-center' : ''}`}>
          <ul className={isExpanded ? 'space-y-2' : 'flex flex-col gap-6'}>
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={handleLinkClick}
                    className={`
                      relative flex items-center transition-all duration-200 group
                      ${!isExpanded ? 'justify-center p-3 w-8 h-8 mx-auto' : 'p-3'}
                      ${isActive 
                        ? (isExpanded 
                            ? 'bg-white/20 text-white shadow-lg rounded-xl border border-white/30 backdrop-blur-sm' 
                            : 'bg-white/20 text-white shadow-lg rounded-lg border border-white/30 backdrop-blur-sm'
                          )
                        : (isExpanded 
                            ? 'text-gray-300 hover:bg-white/10 hover:text-white hover:backdrop-blur-sm rounded-xl'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white hover:backdrop-blur-sm rounded-lg'
                          )
                      }
                    `}
                  >
                    {/* Active indicator for expanded state only */}
                    {isActive && isExpanded && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                    )}
                    
                    <span className={`flex-shrink-0 ${isExpanded ? 'mr-3' : ''} transition-transform duration-200 group-hover:scale-110`}>
                      {item.icon}
                    </span>
                    
                    <span className={`
                      transition-all duration-300 font-medium whitespace-nowrap
                      ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute pointer-events-none'}
                    `}>
                      {item.label}
                    </span>
                    
                    {/* Tooltip for collapsed state */}
                    {!isExpanded && (
                      <div className="absolute left-16 bg-gray-900/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className={`flex items-center ${!isExpanded ? 'justify-center' : ''}`}>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 ring-2 ring-white/20"
                }
              }}
            />
            {isExpanded && (
              <div className="ml-3">
                <p className="text-sm text-gray-300">Profile & Settings</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Hamburger Button */}
      {isMobile && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed top-4 left-4 z-30 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl shadow-lg transition-all duration-200 hover:scale-105 md:hidden border border-white/10"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </>
  );
}
