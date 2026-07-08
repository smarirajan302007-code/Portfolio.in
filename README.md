# 🚀 Premium Developer Portfolio — Full Stack MERN

A **production-ready, premium-quality developer portfolio** built with the MERN stack, featuring a beautifully animated public website and a fully-featured admin dashboard.

## ✨ Features

### Public Portfolio
- 🎨 Dark theme with glassmorphism & green accent (#4ADE80)
- ✍️ Typing animation hero section
- 📊 Animated skill progress bars
- 🎞️ Project cards with modal details
- 📚 Education timeline
- 🏆 Certifications gallery
- 💻 Coding profiles showcase
- 📧 Contact form with email notifications
- 📱 Fully responsive (mobile-first)

### Admin Dashboard
- 🔐 JWT-secured authentication
- 👤 Profile management with photo/resume upload
- 🔧 Skills CRUD with category grouping
- 💼 Projects CRUD with image upload
- 🎓 Education management
- 📜 Certifications management
- 🔗 Social & coding profiles management
- 📩 Contact messages with inbox UI
- ⚙️ Site settings (SEO, theme, favicon)
- 🔑 Password change

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Animations | Framer Motion |
| Routing | React Router v6 |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + bcrypt |
| File Uploads | Multer + Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| Deployment | Vercel (client) + Render (server) |

## 🏁 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Gmail account (for email)

### 1. Clone & Setup

```bash
git clone <your-repo>
cd Portfolio
```

### 2. Configure Backend

```bash
cd server
cp .env.example .env
# Edit .env with your credentials
npm install
```

### 3. Seed Database

```bash
npm run seed
# Admin: admin@portfolio.com / Admin@123
```

### 4. Start Backend

```bash
npm run dev
# Server starts at http://localhost:5000
```

### 5. Configure Frontend

```bash
cd ../client
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
npm install
```

### 6. Start Frontend

```bash
npm run dev
# App opens at http://localhost:5173
```

## 🌐 Routes

### Public
| Route | Page |
|---|---|
| `/` | Hero / Home |
| `/about` | About Me |
| `/skills` | Skills |
| `/projects` | Projects |
| `/education` | Education |
| `/certifications` | Certifications |
| `/coding-profiles` | Coding Profiles |
| `/resume` | Resume |
| `/contact` | Contact |

### Admin (protected)
| Route | Page |
|---|---|
| `/admin/login` | Admin Login |
| `/admin/dashboard` | Dashboard |
| `/admin/profile` | Profile Management |
| `/admin/skills` | Skills CRUD |
| `/admin/projects` | Projects CRUD |
| `/admin/education` | Education CRUD |
| `/admin/certifications` | Certifications CRUD |
| `/admin/social-links` | Social/Coding Links |
| `/admin/messages` | Contact Messages |
| `/admin/settings` | Site Settings |
| `/admin/change-password` | Change Password |

## 📦 API Endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Access |
|---|---|---|
| POST | `/admin/login` | Public |
| GET | `/profile` | Public |
| PUT | `/profile` | Admin |
| GET | `/skills` | Public |
| POST/PUT/DELETE | `/skills` | Admin |
| GET | `/projects` | Public |
| POST/PUT/DELETE | `/projects` | Admin |
| GET | `/education` | Public |
| GET | `/certifications` | Public |
| GET | `/social-links` | Public |
| POST | `/contact` | Public |
| GET/DELETE | `/contact` | Admin |

## 🚀 Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Set Root Directory: `server`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add all environment variables

### Frontend (Vercel)
1. Import your GitHub repo to Vercel
2. Set Root Directory: `client`
3. Add `VITE_API_URL=https://your-render-url.onrender.com/api`
4. Deploy!

## 🔑 Default Admin Credentials
```
Email:    admin@portfolio.com
Password: Admin@123
```
> ⚠️ Change these immediately after first login!

## 📁 Project Structure
```
Portfolio/
├── client/          # React frontend
│   └── src/
│       ├── pages/   # public/ + admin/
│       ├── components/
│       ├── layouts/
│       ├── services/ # API layer
│       ├── context/  # Auth context
│       └── utils/
└── server/          # Express backend
    ├── models/
    ├── controllers/
    ├── routes/
    ├── middleware/
    └── services/
```

---

Built with ❤️ using React, Node.js, MongoDB and Tailwind CSS.
