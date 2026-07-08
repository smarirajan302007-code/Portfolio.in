import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import {
  FaGithub, FaLinkedin, FaTwitter, FaDownload, FaEnvelope,
  FaArrowRight, FaCode, FaMapMarkerAlt, FaInstagram, FaYoutube, FaGlobe,
} from 'react-icons/fa';
import { SiLeetcode, SiHackerrank, SiCodechef, SiCodeforces, SiGeeksforgeeks } from 'react-icons/si';
import { profileAPI, socialLinksAPI } from '../../services/api';
import AboutPage from './AboutPage';
import SkillsPage from './SkillsPage';
import ProjectsPage from './ProjectsPage';
import EducationPage from './EducationPage';
import CertificationsPage from './CertificationsPage';
import CodingProfilesPage from './CodingProfilesPage';
import ResumePage from './ResumePage';
import ContactPage from './ContactPage';

const SOCIAL_ICON_MAP = {
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

const floatVariants = {
  animate: {
    y: [0, -15, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
};

const HeroPage = () => {
  const [profile, setProfile] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    profileAPI.get().then((r) => setProfile(r.data.data));
    socialLinksAPI.getAll()
      .then((r) => setSocialLinks(r.data.data.filter((l) => !l.isCodingProfile)))
      .catch(() => {});
  }, []);

  const typingSequence = profile?.typingTexts && profile.typingTexts.length > 0
    ? profile.typingTexts.flatMap((t) => [t, 2000])
    : [];

  return (
    <div className="flex flex-col">
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden dots-bg">
      {/* Background blobs */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-green-400/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-green-400/5 rounded-full blur-3xl" />

      <div className="section-container w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="order-2 lg:order-1"
          >
            {profile?.location && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-400/10 border border-green-400/20 
                           rounded-full text-green-400 text-sm font-medium mb-6"
              >
                <FaMapMarkerAlt size={12} />
                {profile.location}
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Available for opportunities
              </motion.div>
            )}

            {/* Greeting */}
            {profile?.greeting && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-dark-400 text-lg mb-2 font-medium"
              >
                {profile.greeting}
              </motion.p>
            )}

            {profile?.name && (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight"
              >
                {profile.name.split(' ')[0]}
                <span className="gradient-text block">
                  {profile.name.split(' ').slice(1).join(' ')}
                </span>
              </motion.h1>
            )}

            {/* Typing animation */}
            {typingSequence.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xl sm:text-2xl text-dark-300 mb-6 h-8 flex items-center gap-2"
              >
                <span className="text-green-400 font-mono">&gt;</span>
                <TypeAnimation
                  sequence={typingSequence}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                  className="font-mono"
                />
              </motion.div>
            )}

            {/* Bio */}
            {profile?.bio && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-dark-400 text-base leading-relaxed mb-8 max-w-lg"
              >
                {profile.bio}
              </motion.p>
            )}

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-3 mb-8"
            >
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary gap-2 text-sm"
              >
                Let's Talk <FaArrowRight size={12} />
              </button>
              <button 
                onClick={() => document.getElementById('resume')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-outline gap-2 text-sm"
              >
                <FaDownload size={12} /> Download CV
              </button>
              <button 
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-ghost gap-2 text-sm border border-dark-700 rounded-xl hover:border-dark-500"
              >
                View Work <FaArrowRight size={12} />
              </button>
            </motion.div>

            {/* Social Icons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex items-center gap-6"
            >
              <span className="text-dark-500 text-xs uppercase tracking-widest">Follow me</span>
              <div className="flex gap-2">
                {/* Dynamic social links from DB */}
                {socialLinks.map((link) => {
                  const Icon = SOCIAL_ICON_MAP[link.platform] || FaGlobe;
                  return (
                    <a
                      key={link._id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform}
                      className="w-9 h-9 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center
                                 text-dark-400 hover:text-green-400 hover:border-green-400/40 hover:-translate-y-1 
                                 transition-all duration-200"
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
                {/* Always show email link */}
                {profile?.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    aria-label="Email"
                    className="w-9 h-9 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center
                               text-dark-400 hover:text-green-400 hover:border-green-400/40 hover:-translate-y-1 
                               transition-all duration-200"
                  >
                    <FaEnvelope size={16} />
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Profile Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-1 lg:order-2 flex justify-center"
          >
            <div className="relative">
              {/* Outer ring */}
              <div className="absolute -inset-3 bg-gradient-to-r from-green-400/30 to-green-600/10 rounded-full blur-lg" />
              <motion.div variants={floatVariants} animate="animate" className="relative">
                {/* Image container */}
                <div className="w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden 
                                border-4 border-green-400/30 shadow-glow-lg relative">
                  {profile?.photo?.url ? (
                    <img
                      src={profile.photo.url}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* Placeholder gradient avatar */
                    <div className="w-full h-full bg-gradient-to-br from-dark-700 via-dark-800 to-dark-900 
                                    flex items-center justify-center">
                      <FaCode className="text-green-400/40 text-8xl" />
                    </div>
                  )}
                </div>

                {/* Floating stat badge — Projects */}
                {profile?.projectsCompleted > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, type: 'spring' }}
                    className="absolute -bottom-4 -left-6 glass-card px-4 py-3 flex items-center gap-2"
                  >
                    <div className="w-8 h-8 bg-green-400/20 rounded-lg flex items-center justify-center">
                      <FaCode className="text-green-400 text-sm" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg leading-none">
                        {profile.projectsCompleted}+
                      </p>
                      <p className="text-dark-400 text-xs">Projects</p>
                    </div>
                  </motion.div>
                )}


              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-dark-500 text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-5 h-8 border-2 border-dark-600 rounded-full flex items-start justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-green-400 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
      <div id="about"><AboutPage /></div>
      <div id="skills"><SkillsPage /></div>
      <div id="projects"><ProjectsPage /></div>
      <div id="education"><EducationPage /></div>
      <div id="certifications"><CertificationsPage /></div>
      <div id="coding-profiles"><CodingProfilesPage /></div>
      <div id="resume"><ResumePage /></div>
      <div id="contact"><ContactPage /></div>
    </div>
  );
};

export default HeroPage;
