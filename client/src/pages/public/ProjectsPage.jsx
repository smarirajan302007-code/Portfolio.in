import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt, FaStar, FaTimes, FaCode } from 'react-icons/fa';
import { projectsAPI } from '../../services/api';
import { SectionHeading, PageLoader, EmptyState, Badge, BackButton } from '../../components/ui/shared';

const ProjectCard = ({ project, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -4 }}
    className="glass-card overflow-hidden cursor-pointer group"
    onClick={() => onClick(project)}
  >
    {/* Cover image */}
    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-dark-700 to-dark-800">
      {project.coverImage?.url ? (
        <img
          src={project.coverImage.url}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <FaCode className="text-dark-600 text-6xl" />
        </div>
      )}
      {project.featured && (
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-green-400 
                        text-dark-950 rounded-full text-xs font-bold">
          <FaStar size={10} /> Featured
        </div>
      )}
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-dark-950/60 opacity-0 group-hover:opacity-100 transition-opacity 
                      flex items-center justify-center gap-6">
        <span className="text-white text-sm font-medium">View Details</span>
      </div>
    </div>
      {/* Content */}
      <div className="p-10">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">
            {project.title}
          </h3>
          <div className="flex gap-2">
            <span className="badge text-[10px] py-0.5">{project.category}</span>
          </div>
        </div>
        
        <p className="text-dark-300 text-sm mb-6 line-clamp-2">{project.description}</p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {(project.techStack || []).slice(0, 4).map((tech, idx) => (
            <span key={idx} className="text-xs px-2 py-1 bg-dark-800 text-dark-300 rounded border border-dark-700">
              {tech}
            </span>
          ))}
          {(project.techStack || []).length > 4 && (
            <span className="text-xs px-2 py-1 bg-dark-800 text-dark-400 rounded border border-dark-700">
              +{(project.techStack || []).length - 4}
            </span>
          )}
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 mt-auto">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs font-medium text-dark-400 hover:text-white transition-colors"
            >
              <FaGithub size={14} /> GitHub
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs font-medium text-dark-400 hover:text-white transition-colors ml-auto"
            >
              <FaExternalLinkAlt size={12} /> Live Demo
            </a>
          )}
        </div>
      </div>
  </motion.div>
);

const ProjectModal = ({ project, onClose }) => {
  if (!project) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10"
      >
        {/* Header image */}
        <div className="relative h-56 overflow-hidden rounded-t-2xl bg-gradient-to-br from-dark-700 to-dark-800">
          {project.coverImage?.url && (
            <img src={project.coverImage.url} alt={project.title} className="w-full h-full object-cover" />
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-dark-950/80 rounded-full flex items-center justify-center
                       text-white hover:text-green-400 transition-colors"
          >
            <FaTimes size={14} />
          </button>
          {project.featured && (
            <div className="absolute top-4 left-4 flex items-center gap-1 px-2.5 py-1 bg-green-400 
                            text-dark-950 rounded-full text-xs font-bold">
              <FaStar size={10} /> Featured
            </div>
          )}
        </div>

        <div className="p-10">
          <div className="flex items-start justify-between gap-6 mb-4">
            <h2 className="text-2xl font-bold text-white">{project.title}</h2>
            <span className="badge whitespace-nowrap">{project.category}</span>
          </div>

          <p className="text-dark-300 text-sm leading-relaxed mb-8">
            {project.longDescription || project.description}
          </p>

          {/* Features */}
          {project.features?.length > 0 && (
            <div className="mb-5">
              <h4 className="text-white font-semibold mb-3 text-sm">Key Features</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {project.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-dark-300 text-sm">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tech stack */}
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-3 text-sm">Technologies Used</h4>
            <div className="flex flex-wrap gap-2">
              {(project.techStack || []).map((tech) => (
                <span key={tech} className="px-3 py-1 bg-dark-700 text-dark-200 text-xs rounded-lg border border-dark-600">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-3">
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">
                <FaGithub /> View Code
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
                <FaExternalLinkAlt size={12} /> Live Demo
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    projectsAPI
      .getAll()
      .then((r) => setProjects(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const categories = ['All', ...new Set(projects.map((p) => p.category))];
  const filtered = filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  return (
    <section className="section-container">
      <BackButton fixed />
      <SectionHeading
        title="My Projects"
        subtitle="A selection of real-world applications I've built"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              filter === cat
                ? 'bg-green-400 text-dark-950 border-green-400 shadow-glow'
                : 'bg-dark-800 text-dark-300 border-dark-700 hover:border-green-400/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {projects.length === 0 ? (
        <EmptyState message="No projects added yet" icon={FaCode} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence>
            {filtered.map((project) => (
              <ProjectCard key={project._id} project={project} onClick={setSelected} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
};

export default ProjectsPage;
