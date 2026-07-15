import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGithub, FaLinkedin, FaTwitter, FaPaperPlane } from 'react-icons/fa';
import { contactAPI, profileAPI } from '../../services/api';
import { SectionHeading, BackButton } from '../../components/ui/shared';
import toast from 'react-hot-toast';
import { encryptMessage } from '../../utils/encryption';

const ContactPage = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    profileAPI.get().then((r) => setProfile(r.data.data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Strict email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
    
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email format');
      return;
    }

    const domain = form.email.split('@')[1].toLowerCase();
    
    if (domain === 'gamil.com') {
      toast.error('Did you mean gmail.com? Please check your email.');
      return;
    }

    if (!validDomains.includes(domain)) {
      toast.error(`Please use a standard email provider (e.g., ${validDomains.join(', ')})`);
      return;
    }

    setLoading(true);
    try {
      // E2EE: Encrypt sensitive fields before sending
      const payload = {
        name: form.name,
        email: form.email,
        subject: encryptMessage(form.subject),
        message: encryptMessage(form.message),
      };

      await contactAPI.send(payload);
      toast.success('Message sent successfully! I\'ll get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { Icon: FaEnvelope, label: 'Email', value: profile?.email || '—', href: profile?.email ? `mailto:${profile.email}` : null },
    { Icon: FaPhone, label: 'Phone', value: profile?.phone || '—', href: profile?.phone ? `tel:${profile.phone}` : null },
    { Icon: FaMapMarkerAlt, label: 'Location', value: profile?.location || '—', href: null },
  ];

  return (
    <section className="section-container">
      <BackButton fixed />
      <SectionHeading
        title="Get In Touch"
        subtitle="Have a project in mind or just want to say hi? I'd love to hear from you!"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-2 flex flex-col gap-8"
        >
          <div className="glass-card p-10">
            <h3 className="text-white font-semibold text-lg mb-5">Contact Information</h3>
            <div className="flex flex-col gap-8 w-full">
              {contactInfo.map(({ Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-green-400/15 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="text-green-400 text-sm" />
                  </div>
                  <div>
                    <p className="text-dark-400 text-xs mb-0.5">{label}</p>
                    {href ? (
                      <a href={href} className="text-white font-medium text-sm hover:text-green-400 transition-colors">
                        {value}
                      </a>
                    ) : (
                      <p className="text-white font-medium text-sm">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="glass-card p-10">
            <h3 className="text-white font-semibold text-lg mb-4">Follow Me</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { Icon: FaGithub, href: 'https://github.com', label: 'GitHub' },
                { Icon: FaLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
                { Icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center
                             text-dark-400 hover:text-green-400 hover:border-green-400/40 transition-all hover:-translate-y-1"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="glass-card p-10 border border-green-400/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium text-sm">Available for Opportunities</span>
            </div>
            <p className="text-dark-400 text-xs leading-relaxed">
              I'm currently looking for full-time roles, internships, and freelance projects. 
              Response time: within 24 hours.
            </p>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-3"
        >
          <div className="glass-card p-10">
            <h3 className="text-white font-semibold text-lg mb-6">Send a Message</h3>
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 bg-green-400/15 rounded-full flex items-center justify-center mb-4">
                  <FaPaperPlane className="text-green-400 text-2xl" />
                </div>
                <h4 className="text-white font-bold text-xl mb-2">Message Sent! 🎉</h4>
                <p className="text-dark-400 text-sm">Thanks for reaching out. I'll get back to you within 24-48 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="contact-name" className="block text-dark-400 text-xs mb-1.5">Your Name *</label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="input-field text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-dark-400 text-xs mb-1.5">Email Address *</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="input-field text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-subject" className="block text-dark-400 text-xs mb-1.5">Subject *</label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Project Collaboration / Job Opportunity / ..."
                    className="input-field text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-dark-400 text-xs mb-1.5">Message *</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell me about your project or opportunity..."
                    className="input-field text-sm resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-dark-800 border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane size={13} /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactPage;
