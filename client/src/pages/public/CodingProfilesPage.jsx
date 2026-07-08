import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaGithub, FaLinkedin, FaTwitter, FaExternalLinkAlt, FaCode,
} from 'react-icons/fa';
import {
  SiLeetcode, SiHackerrank, SiCodechef, SiCodeforces, SiGeeksforgeeks,
} from 'react-icons/si';
import { socialLinksAPI } from '../../services/api';
import { SectionHeading, PageLoader, EmptyState, BackButton } from '../../components/ui/shared';

const iconMap = {
  GitHub: { Icon: FaGithub, color: '#ffffff', bg: '#24292e' },
  LinkedIn: { Icon: FaLinkedin, color: '#0A66C2', bg: '#e8f4fd' },
  Twitter: { Icon: FaTwitter, color: '#1DA1F2', bg: '#e8f5ff' },
  LeetCode: { Icon: SiLeetcode, color: '#FFA116', bg: '#fff5e0' },
  HackerRank: { Icon: SiHackerrank, color: '#00EA64', bg: '#e0fff2' },
  CodeChef: { Icon: SiCodechef, color: '#5B4638', bg: '#f0ece8' },
  Codeforces: { Icon: SiCodeforces, color: '#1F8ACB', bg: '#e8f4fb' },
  GeeksforGeeks: { Icon: SiGeeksforgeeks, color: '#2F8D46', bg: '#e8f5ec' },
};

const CodingProfilesPage = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socialLinksAPI
      .getAll()
      .then((r) => setLinks(r.data.data.filter((l) => l.isCodingProfile)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const codingPlatforms = links.filter((l) => l.isCodingProfile);

  return (
    <section className="section-container">
      <BackButton fixed />
      <SectionHeading
        title="Coding Profiles"
        subtitle="Find me on competitive programming and developer platforms"
      />

      {codingPlatforms.length === 0 ? (
        <EmptyState message="No coding profiles added yet" icon={FaCode} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {codingPlatforms.map((link, idx) => {
            const meta = iconMap[link.platform] || { Icon: FaCode, color: '#4ADE80', bg: '#0f2a1a' };
            const { Icon } = meta;

            return (
              <motion.a
                key={link._id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="glass-card p-10 flex flex-col items-center text-center group cursor-pointer
                           hover:border-green-400/30 transition-all duration-300"
              >
                {/* Icon circle */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 
                             group-hover:scale-110 transition-transform duration-300 shadow-lg"
                  style={{ backgroundColor: `${meta.color}15`, border: `2px solid ${meta.color}30` }}
                >
                  <Icon size={30} style={{ color: meta.color }} />
                </div>

                <h3 className="text-white font-bold text-lg mb-1">{link.platform}</h3>
                {link.username && (
                  <p className="text-dark-400 text-sm mb-3">@{link.username}</p>
                )}

                <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium 
                               opacity-0 group-hover:opacity-100 transition-opacity">
                  View Profile <FaExternalLinkAlt size={9} />
                </div>
              </motion.a>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CodingProfilesPage;
