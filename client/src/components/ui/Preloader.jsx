import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCode } from 'react-icons/fa';

const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress to 100% over 2.5 seconds
    const duration = 2500;
    const intervalTime = 30;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const currentProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(currentProgress);

      if (currentStep >= steps) {
        clearInterval(interval);
        setTimeout(onComplete, 400); // Wait a bit after hitting 100%
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-dark-950 overflow-hidden"
    >
      {/* Background glowing blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-400/5 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 bg-dark-900 border border-dark-700/50 rounded-2xl flex items-center justify-center shadow-glow mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-green-400/10 animate-pulse" />
          <FaCode className="text-green-400 text-3xl relative z-10" />
        </motion.div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white font-bold tracking-widest uppercase text-sm"
          >
            Initializing System
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-1"
          >
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </motion.div>
        </div>

        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 250 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="h-1 bg-dark-800 rounded-full overflow-hidden relative"
        >
          <div 
            className="absolute top-0 left-0 h-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)] transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </motion.div>

        {/* Progress Text */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-dark-500 font-mono text-xs mt-3"
        >
          {Math.round(progress)}%
        </motion.p>
      </div>

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    </motion.div>
  );
};

export default Preloader;
