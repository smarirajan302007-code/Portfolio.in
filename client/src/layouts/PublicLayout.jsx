import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import Preloader from '../components/ui/Preloader';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const PublicLayout = () => {
  const [loading, setLoading] = useState(() => {
    return !sessionStorage.getItem('portfolio_preloader_shown');
  });

  const handlePreloaderComplete = () => {
    sessionStorage.setItem('portfolio_preloader_shown', 'true');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatePresence>
        {loading && <Preloader key="preloader" onComplete={handlePreloaderComplete} />}
      </AnimatePresence>

      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col w-full h-full"
        >
          <Navbar />
          <AnimatePresence mode="wait">
            <motion.main
              className="flex-1 pt-16"
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
          <Footer />
        </motion.div>
      )}
    </div>
  );
};

export default PublicLayout;
