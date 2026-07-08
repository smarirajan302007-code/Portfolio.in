import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HeroPage from './pages/public/HeroPage';
import AboutPage from './pages/public/AboutPage';
import SkillsPage from './pages/public/SkillsPage';
import ProjectsPage from './pages/public/ProjectsPage';
import EducationPage from './pages/public/EducationPage';
import CertificationsPage from './pages/public/CertificationsPage';
import CodingProfilesPage from './pages/public/CodingProfilesPage';
import ResumePage from './pages/public/ResumePage';
import ContactPage from './pages/public/ContactPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import AdminSkillsPage from './pages/admin/AdminSkillsPage';
import AdminProjectsPage from './pages/admin/AdminProjectsPage';
import AdminEducationPage from './pages/admin/AdminEducationPage';
import AdminCertificationsPage from './pages/admin/AdminCertificationsPage';
import AdminSocialLinksPage from './pages/admin/AdminSocialLinksPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminChangePasswordPage from './pages/admin/AdminChangePasswordPage';
import AdminHistoryPage from './pages/admin/AdminHistoryPage';
import AdminFooterPage from './pages/admin/AdminFooterPage';
import AdminAboutPage from './pages/admin/AdminAboutPage';
import AdminResumePage from './pages/admin/AdminResumePage';
import AdminCodingPage from './pages/admin/AdminCodingPage';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#e2e8f0',
                border: '1px solid rgba(74, 222, 128, 0.2)',
                borderRadius: '12px',
              },
              success: { iconTheme: { primary: '#4ADE80', secondary: '#0f172a' } },
              error: { iconTheme: { primary: '#f87171', secondary: '#0f172a' } },
            }}
          />

          <Routes>
            {/* ── Public Routes ──────────────────────────────── */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HeroPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/education" element={<EducationPage />} />
              <Route path="/certifications" element={<CertificationsPage />} />
              <Route path="/coding-profiles" element={<CodingProfilesPage />} />
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* ── Admin Login ────────────────────────────────── */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* ── Protected Admin Routes ─────────────────────── */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="profile" element={<AdminProfilePage />} />
              <Route path="about" element={<AdminAboutPage />} />
            <Route path="skills" element={<AdminSkillsPage />} />
            <Route path="projects" element={<AdminProjectsPage />} />
            <Route path="education" element={<AdminEducationPage />} />
            <Route path="certifications" element={<AdminCertificationsPage />} />
            <Route path="coding" element={<AdminCodingPage />} />
            <Route path="resume" element={<AdminResumePage />} />
            <Route path="social-links" element={<AdminSocialLinksPage />} />
            <Route path="footer" element={<AdminFooterPage />} />
              <Route path="messages" element={<AdminMessagesPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="history" element={<AdminHistoryPage />} />
              <Route path="change-password" element={<AdminChangePasswordPage />} />
            </Route>

            {/* ── 404 fallback ───────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
