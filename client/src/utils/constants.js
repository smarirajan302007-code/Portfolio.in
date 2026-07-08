// Shared utility constants and helpers

export const SOCIAL_ICONS = {
  GitHub: 'FaGithub',
  LinkedIn: 'FaLinkedin',
  Twitter: 'FaTwitter',
  LeetCode: 'SiLeetcode',
  HackerRank: 'FaHackerrank',
  CodeChef: 'SiCodechef',
  Codeforces: 'SiCodeforces',
  GeeksforGeeks: 'SiGeeksforgeeks',
  Instagram: 'FaInstagram',
  YouTube: 'FaYoutube',
  Portfolio: 'FaGlobe',
};

export const SKILL_CATEGORIES = [
  'Languages',
  'Frontend',
  'Backend',
  'Database',
  'Tools',
  'Frameworks',
  'Other',
];

export const SOCIAL_PLATFORMS = [
  'GitHub',
  'LinkedIn',
  'Twitter',
  'Instagram',
  'YouTube',
  'LeetCode',
  'HackerRank',
  'CodeChef',
  'Codeforces',
  'GeeksforGeeks',
  'Portfolio',
  'Other',
];

export const CODING_PLATFORMS = [
  'GitHub',
  'LeetCode',
  'HackerRank',
  'CodeChef',
  'Codeforces',
  'GeeksforGeeks',
  'Other',
];

export const PROJECT_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'AI/ML',
  'Data Science',
  'DevOps',
  'Open Source',
  'Other',
];

/**
 * Format a date string to readable format
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Format a date string to readable format with time
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

/**
 * Truncate text to n characters
 */
export const truncate = (text, n = 100) => {
  if (!text) return '';
  return text.length > n ? text.slice(0, n) + '...' : text;
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return 'AJ';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
