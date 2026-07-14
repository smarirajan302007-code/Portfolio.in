import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCode, FaHeart, FaGithub, FaLinkedin, FaTwitter,
  FaInstagram, FaYoutube, FaGlobe, FaEnvelope
} from 'react-icons/fa';
import { SiLeetcode, SiHackerrank, SiCodechef, SiCodeforces, SiGeeksforgeeks } from 'react-icons/si';
import { profileAPI, socialLinksAPI, settingsAPI } from '../../services/api';

// Platform → icon map
const ICON_MAP = {
  GitHub: FaGithub,
  LinkedIn: FaLinkedin,
  Twitter: FaTwitter,
  Instagram: FaInstagram,
  YouTube: FaYoutube,
  Portfolio: FaGlobe,
  LeetCode: SiLeetcode,
  HackerRank: SiHackerrank,
  CodeChef: SiCodechef,
  Codeforces: SiCodeforces,
  GeeksforGeeks: SiGeeksforgeeks,
  Other: FaGlobe,
};

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Projects', to: '/projects' },
  { label: 'Skills', to: '/skills' },
  { label: 'Education', to: '/education' },
  { label: 'Resume', to: '/resume' },
  { label: 'Contact', to: '/contact' },
];

const Footer = () => {
  const [profile, setProfile] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [settings, setSettings] = useState(null);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  useEffect(() => {
    profileAPI.get()
      .then((r) => setProfile(r.data.data))
      .catch(() => {});

    socialLinksAPI.getAll()
      .then((r) => setSocialLinks(r.data.data.filter((l) => !l.isCodingProfile)))
      .catch(() => {});

    settingsAPI.get()
      .then((r) => setSettings(r.data.data))
      .catch(() => {});
  }, []);

  const firstName = profile?.name?.split(' ')[0] || '';
  const fullName = profile?.name || '';

  if (!profile) return null;

  return (
    <footer className="relative border-t border-dark-800/50 bg-dark-950 overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-0 left-1/4 w-72 h-40 bg-green-400/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-72 h-40 bg-green-400/3 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full px-6 md:px-12 py-14">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">

          {/* ── Brand ─────────────────────────────────── */}
          <div className="flex-1 lg:pr-20">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                <FaCode className="text-dark-950 text-sm" />
              </div>
              <span className="font-black text-white text-xl tracking-tight">
                Portfolio<span className="text-green-400">.</span>
              </span>
            </Link>

            {settings?.footerText && (
              <p className="text-dark-400 text-sm leading-relaxed w-full">
                {settings.footerText}
              </p>
            )}

            {profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-2 mt-5 text-dark-500 text-xs hover:text-green-400 transition-colors"
              >
                <FaEnvelope size={11} />
                {profile.email}
              </a>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-10 md:gap-24 shrink-0">
            {/* ── Quick Links ───────────────────────────────── */}
            {settings?.footerLinks && settings.footerLinks.length > 0 && (
              <div className="flex flex-col items-start text-left">
                <h4 className="text-white font-semibold mb-5 flex items-center gap-2 text-xs uppercase tracking-widest justify-start">
                  Quick Links
                  <span className="w-10 h-px bg-green-400 inline-block" />
                </h4>
                <div className="flex flex-col gap-3">
                  {settings.footerLinks.map((link, idx) => (
                    <Link
                      key={idx}
                      to={link.url}
                      onClick={scrollToTop}
                      className="text-dark-400 text-sm hover:text-green-400 transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ── Connect ───────────────────────────────── */}
            <div className="flex flex-col items-start text-left max-w-[200px]">
              <h4 className="text-white font-semibold mb-5 flex items-center gap-2 text-xs uppercase tracking-widest justify-start">
                Connect
                <span className="w-10 h-px bg-green-400 inline-block" />
              </h4>

              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2.5 justify-start">
                  {socialLinks.map((link) => {
                    const Icon = ICON_MAP[link.platform] || FaGlobe;
                    return (
                      <motion.a
                        key={link._id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.platform}
                        title={link.platform}
                        whileHover={{ y: -3, scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-xl bg-dark-800/80 border border-dark-700/80
                                   flex items-center justify-center text-dark-400
                                   hover:text-green-400 hover:border-green-400/40 hover:bg-green-400/5
                                   transition-colors duration-200"
                      >
                        <Icon size={16} />
                      </motion.a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-dark-800/40">
          <p className="text-dark-500 text-xs flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            © {new Date().getFullYear()}
            <span className="text-dark-400 font-medium">{fullName}</span>
          </p>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
