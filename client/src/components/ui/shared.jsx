import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

/**
 * Reusable loading spinner
 */
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div
      className={`${sizes[size]} border-2 border-dark-700 border-t-green-400 rounded-full animate-spin ${className}`}
    />
  );
};

/**
 * Full page loader
 */
export const PageLoader = () => (
  <div className="min-h-screen bg-dark-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="text-dark-400 text-sm animate-pulse">Loading...</p>
    </div>
  </div>
);

/**
 * Section heading with animated underline
 */
export const SectionHeading = ({ title, subtitle, center = true }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`mb-20 ${center ? 'text-center' : ''}`}
  >
    <div className={`flex items-center gap-3 mb-3 ${center ? 'justify-center' : ''}`}>
      <div className="w-8 h-0.5 bg-green-400" />
      <span className="text-green-400 text-sm font-medium uppercase tracking-widest">Portfolio</span>
      <div className="w-8 h-0.5 bg-green-400" />
    </div>
    <h2 className="section-title">{title}</h2>
    {subtitle && <p className="section-subtitle">{subtitle}</p>}
  </motion.div>
);

/**
 * Back / Undo button — use fixed=true for public pages (floats below navbar),
 * or inline (default) for admin pages.
 */
export const BackButton = ({ fallbackPath = '/', className = '', fixed = false }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  const location = window.location.pathname;
  if (fixed && location === '/') return null;

  if (fixed) {
    return (
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        onClick={handleBack}
        title="Go back"
        aria-label="Go back"
        className={`fixed top-20 left-4 z-40 w-10 h-10 rounded-full
                    bg-dark-900/90 border border-dark-700 backdrop-blur-md shadow-glass
                    flex items-center justify-center
                    text-dark-400 hover:text-green-400 hover:border-green-400/50 hover:bg-dark-800
                    transition-all duration-200 group ${className}`}
      >
        <FaArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
      </motion.button>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={handleBack}
      aria-label="Go back"
      className={`inline-flex items-center gap-2 text-dark-400 hover:text-green-400
                  transition-colors text-sm group ${className}`}
    >
      <FaArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
      <span>Back</span>
    </motion.button>
  );
};

/**
 * Skeleton loader card
 */
export const SkeletonCard = ({ className = '' }) => (
  <div className={`glass-card p-10 ${className}`}>
    <div className="skeleton h-4 w-3/4 rounded mb-3" />
    <div className="skeleton h-3 w-full rounded mb-2" />
    <div className="skeleton h-3 w-5/6 rounded mb-2" />
    <div className="skeleton h-3 w-2/3 rounded" />
  </div>
);

/**
 * Empty state
 */
export const EmptyState = ({ message = 'Nothing to show yet', icon: Icon }) => (
  <div className="flex flex-col items-center justify-center py-16 text-dark-500">
    {Icon && <Icon size={40} className="mb-4 text-dark-600" />}
    <p className="text-sm">{message}</p>
  </div>
);

/**
 * Badge component
 */
export const Badge = ({ children, color = 'green', className = '' }) => (
  <span className={`badge ${className}`}>{children}</span>
);

/**
 * Modal overlay
 */
export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-10"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-10 sm:p-8 z-10"
      >
        {title && (
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-dark-400 hover:text-white transition-colors text-xl leading-none"
            >
              ×
            </button>
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
};

/**
 * Custom Confirmation Dialog Modal
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure to proceed?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-10">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative glass-card w-full max-w-sm p-10 z-10 flex flex-col items-center text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/5 border border-red-500/20 flex items-center justify-center text-red-400 mb-5 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-dark-400 text-sm mb-8 leading-relaxed px-2">{message}</p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl text-sm font-semibold border border-dark-700 bg-dark-800/40 text-dark-300 hover:bg-dark-800 hover:text-white transition-all duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_14px_rgba(239,68,68,0.2)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.3)] hover:-translate-y-0.5 transition-all duration-200"
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
