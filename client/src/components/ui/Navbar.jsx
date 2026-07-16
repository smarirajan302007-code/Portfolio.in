import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCode, FaBars, FaTimes, FaLock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { contactAPI } from '../../services/api';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Skills', to: '/skills' },
  { label: 'Projects', to: '/projects' },
  { label: 'Education', to: '/education' },
  { label: 'Certifications', to: '/certifications' },
  { label: 'Coding', to: '/coding-profiles' },
  { label: 'Resume', to: '/resume' },
  { label: 'Contact', to: '/contact' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('/');
  const location = useLocation();
  const navigate = useNavigate();

  const { admin } = useAuth();
  const { data: statsData } = useQuery({
    queryKey: ['adminStatsNavbar'],
    queryFn: async () => {
      const res = await contactAPI.getStats();
      return res.data.data;
    },
    enabled: !!admin,
    refetchInterval: 10000 // Poll every 10 seconds for new messages when logged in
  });
  
  const unreadCount = statsData?.unreadMessages || 0;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      if (location.pathname === '/') {
        // Scroll spy logic
        const sections = navLinks.map(l => l.to.replace('/', '')).filter(Boolean);
        let current = '/';
        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            // If the top of the section is near the top of the viewport
            if (rect.top <= 120) {
              current = '/' + section;
            }
          }
        }
        // Special case: if scrolled to the absolute bottom, highlight Contact
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
          current = '/contact';
        }
        setActiveSection(current);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleNavClick = (e, to) => {
    if (location.pathname === '/') {
      e.preventDefault();
      setMenuOpen(false);
      setTimeout(() => {
        if (to === '/') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const id = to.replace('/', '');
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          } else {
            navigate(to);
          }
        }
      }, 150);
    } else {
      setMenuOpen(false);
    }
  };

  const getLinkClasses = (linkTo) => {
    const isActive = location.pathname === '/' ? activeSection === linkTo : location.pathname === linkTo;
    return `nav-link px-3 py-2 rounded-lg transition-all text-sm flex-shrink-0 font-medium ${
      isActive
        ? 'text-green-400 bg-green-400/10'
        : 'text-dark-300 hover:text-white hover:bg-dark-800/50'
    }`;
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'bg-dark-950/90 backdrop-blur-xl border-b border-dark-800/50 shadow-glass'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full px-4 md:px-12">
        <div className="flex items-center justify-between h-16 gap-3">

          <div className="flex items-center gap-3 overflow-hidden flex-1">
            {/* Left: Hamburger button (Mobile only) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2.5 text-dark-300 hover:text-green-400 transition-colors flex items-center justify-center rounded-xl bg-dark-900/40 border border-dark-800/40 hover:border-green-400/20 flex-shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {menuOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
            </button>

            {/* Left: Horizontal Links (Desktop only) */}
            <div className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-hidden whitespace-nowrap">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={(e) => handleNavClick(e, link.to)}
                  className={getLinkClasses(link.to)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Logo and Admin Login */}
          <div className="flex items-center gap-4 flex-shrink-0 pl-2">
            <Link to="/" onClick={(e) => handleNavClick(e, '/')} className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                <FaCode className="text-dark-950 text-sm" />
              </div>
              <span className="font-bold text-white text-lg hidden sm:block tracking-tight">
                Portfolio<span className="text-green-400">.</span>
              </span>
            </Link>
            <div className="relative group/lock flex items-center">
              <Link to="/admin/login" className="text-dark-500 hover:text-green-400 transition-colors relative" title={admin ? undefined : "Admin Login"}>
                <FaLock size={14} />
                {admin && unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>
              {admin && unreadCount > 0 && (
                <div className="absolute top-full mt-3 -right-2 w-max bg-dark-900 border border-dark-800 rounded-lg p-2.5 opacity-0 group-hover/lock:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                  <p className="text-xs text-white">
                    <span className="text-green-400 font-bold">{unreadCount}</span> new message{unreadCount > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Navigation links dropdown list (Mobile) */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Blur Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 top-16 bg-dark-950/80 backdrop-blur-md z-40 lg:hidden"
            />

            {/* Dropdown Menu Container (Vertical List) */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="absolute top-16 left-0 w-full sm:w-80 bg-dark-900/95 backdrop-blur-xl border-b sm:border-r border-dark-800/50 sm:rounded-br-3xl z-50 overflow-hidden shadow-2xl lg:hidden"
            >
              <div className="w-full p-10 flex flex-col gap-2 max-h-[75vh] overflow-y-auto">
                {navLinks.map((link) => {
                  const isActive = location.pathname === '/' ? activeSection === link.to : location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={(e) => handleNavClick(e, link.to)}
                      className={`px-5 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 border flex items-center justify-start ${
                        isActive
                          ? 'text-green-400 bg-green-400/10 border-green-400/20'
                          : 'text-dark-300 border-dark-800/30 bg-dark-950/30 hover:border-dark-700/60 hover:bg-dark-800/50 hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
