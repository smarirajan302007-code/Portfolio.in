/**
 * Seed Script — Run once to initialize the database with:
 *  - Admin account
 *  - Default profile
 *  - Sample skills, projects, education, certifications, social links
 *
 * Usage: node seed.js
 */

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');

const Admin = require('./models/Admin');
const Profile = require('./models/Profile');
const Skill = require('./models/Skill');
const Project = require('./models/Project');
const Education = require('./models/Education');
const Certification = require('./models/Certification');
const SocialLink = require('./models/SocialLink');
const SiteSettings = require('./models/SiteSettings');

const seedData = async () => {
  await connectDB();

  try {
    console.log('🌱 Starting database seed...\n');

    // ── Clear existing data ──────────────────────────────────────
    await Promise.all([
      Admin.deleteMany(),
      Profile.deleteMany(),
      Skill.deleteMany(),
      Project.deleteMany(),
      Education.deleteMany(),
      Certification.deleteMany(),
      SocialLink.deleteMany(),
      SiteSettings.deleteMany(),
    ]);
    console.log('✅ Cleared existing data');

    // ── Admin ────────────────────────────────────────────────────
    await Admin.create({
      name: 'S. Mari Rajan',
      email: 'admin',
      password: 'admin1234',
    });
    console.log('✅ Admin created  →  admin / admin1234');

    // ── Profile ──────────────────────────────────────────────────
    await Profile.create({
      name: 'S. Mari Rajan',
      title: 'Full Stack Developer | Final Year CS Student',
      bio: 'I am a passionate Computer Science student with a love for building elegant, scalable web applications. I thrive on turning complex problems into intuitive, beautiful digital experiences. Currently in my final year at MIT, I am actively looking for opportunities to contribute to impactful projects.',
      careerObjective: 'To leverage my skills in full-stack development and contribute to impactful projects that make a real difference, while continuing to grow as a software engineer and becoming a leading figure in the tech industry.',
      interests: ['Web Development', 'Open Source', 'Problem Solving', 'AI/ML', 'UI/UX Design', 'Cloud Computing'],
      location: 'Boston, MA, USA',
      email: 'smari@example.com',
      phone: '+1 (555) 123-4567',
      yearsOfExperience: 2,
      projectsCompleted: 15,
      typingTexts: ['Full Stack Developer', 'React Developer', 'Node.js Developer', 'Problem Solver', 'CS Student'],
    });
    console.log('✅ Profile created');

    // ── Skills ───────────────────────────────────────────────────
    const skills = [
      // Languages
      { name: 'JavaScript', category: 'Languages', level: 90, color: '#F7DF1E', order: 1 },
      { name: 'TypeScript', category: 'Languages', level: 75, color: '#3178C6', order: 2 },
      { name: 'Python', category: 'Languages', level: 80, color: '#3776AB', order: 3 },
      { name: 'Java', category: 'Languages', level: 70, color: '#ED8B00', order: 4 },
      { name: 'C++', category: 'Languages', level: 65, color: '#00599C', order: 5 },
      // Frontend
      { name: 'React.js', category: 'Frontend', level: 88, color: '#61DAFB', order: 1 },
      { name: 'HTML5', category: 'Frontend', level: 95, color: '#E34F26', order: 2 },
      { name: 'CSS3', category: 'Frontend', level: 90, color: '#1572B6', order: 3 },
      { name: 'Tailwind CSS', category: 'Frontend', level: 85, color: '#06B6D4', order: 4 },
      { name: 'Next.js', category: 'Frontend', level: 72, color: '#FFFFFF', order: 5 },
      // Backend
      { name: 'Node.js', category: 'Backend', level: 85, color: '#339933', order: 1 },
      { name: 'Express.js', category: 'Backend', level: 85, color: '#4ADE80', order: 2 },
      { name: 'REST APIs', category: 'Backend', level: 88, color: '#4ADE80', order: 3 },
      { name: 'GraphQL', category: 'Backend', level: 60, color: '#E10098', order: 4 },
      // Database
      { name: 'MongoDB', category: 'Database', level: 82, color: '#47A248', order: 1 },
      { name: 'MySQL', category: 'Database', level: 75, color: '#4479A1', order: 2 },
      { name: 'PostgreSQL', category: 'Database', level: 65, color: '#336791', order: 3 },
      { name: 'Redis', category: 'Database', level: 55, color: '#DC382D', order: 4 },
      // Tools
      { name: 'Git', category: 'Tools', level: 88, color: '#F05032', order: 1 },
      { name: 'Docker', category: 'Tools', level: 60, color: '#2496ED', order: 2 },
      { name: 'VS Code', category: 'Tools', level: 95, color: '#007ACC', order: 3 },
      { name: 'Postman', category: 'Tools', level: 85, color: '#FF6C37', order: 4 },
      { name: 'Figma', category: 'Tools', level: 70, color: '#F24E1E', order: 5 },
      // Frameworks
      { name: 'Framer Motion', category: 'Frameworks', level: 75, color: '#BB4BC6', order: 1 },
      { name: 'JWT', category: 'Frameworks', level: 82, color: '#D63AFF', order: 2 },
      { name: 'Mongoose', category: 'Frameworks', level: 85, color: '#880000', order: 3 },
    ];
    await Skill.insertMany(skills);
    console.log(`✅ ${skills.length} skills created`);

    // ── Projects ─────────────────────────────────────────────────
    const projects = [
      {
        title: 'E-Commerce Platform',
        description: 'A full-featured MERN stack e-commerce application with payment integration, real-time inventory management, and an admin dashboard.',
        longDescription: 'Built a production-ready e-commerce platform serving thousands of users. Features include product catalog, shopping cart, Stripe payment integration, order tracking, and a comprehensive admin dashboard for inventory and order management.',
        features: ['JWT Authentication', 'Stripe Payment Gateway', 'Real-time Inventory', 'Admin Dashboard', 'Order Tracking', 'Email Notifications', 'Product Reviews', 'Search & Filter'],
        techStack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Redux Toolkit', 'Stripe API', 'Cloudinary', 'Tailwind CSS'],
        githubUrl: 'https://github.com/alexjohnson/ecommerce-platform',
        liveUrl: 'https://ecommerce-demo.vercel.app',
        featured: true,
        order: 1,
        category: 'Web Development',
      },
      {
        title: 'Real-Time Chat Application',
        description: 'A scalable real-time messaging application with Socket.io, supporting group chats, direct messages, and file sharing.',
        longDescription: 'Developed a modern chat application with WebSocket support for real-time messaging. Includes features like typing indicators, online status, message reactions, and end-to-end encrypted messages.',
        features: ['Real-time Messaging', 'Group Chats', 'File Sharing', 'Typing Indicators', 'Online Status', 'Message Reactions', 'Emoji Support', 'Push Notifications'],
        techStack: ['React.js', 'Node.js', 'Socket.io', 'MongoDB', 'Express.js', 'JWT', 'Cloudinary'],
        githubUrl: 'https://github.com/alexjohnson/chat-app',
        liveUrl: 'https://chat-app-demo.vercel.app',
        featured: true,
        order: 2,
        category: 'Web Development',
      },
      {
        title: 'AI Task Manager',
        description: 'An intelligent task management app with AI-powered suggestions, priority scoring, and natural language processing for task creation.',
        longDescription: 'Integrated OpenAI GPT-4 into a task management system to provide smart task suggestions, automated priority scoring based on deadlines and context, and natural language task input processing.',
        features: ['AI-Powered Suggestions', 'Natural Language Input', 'Priority Scoring', 'Kanban Board', 'Team Collaboration', 'Calendar Integration', 'Analytics Dashboard'],
        techStack: ['Next.js', 'TypeScript', 'OpenAI API', 'PostgreSQL', 'Prisma', 'Tailwind CSS', 'NextAuth.js'],
        githubUrl: 'https://github.com/alexjohnson/ai-task-manager',
        liveUrl: 'https://ai-tasks-demo.vercel.app',
        featured: true,
        order: 3,
        category: 'AI/ML',
      },
      {
        title: 'Portfolio CMS',
        description: 'This very portfolio website — a headless CMS-backed portfolio with a full admin dashboard for content management.',
        longDescription: 'A production-grade portfolio with a fully decoupled MERN backend, protected admin dashboard, Cloudinary media management, and a blazing-fast React frontend.',
        features: ['Headless CMS', 'Admin Dashboard', 'Media Upload', 'JWT Auth', 'SEO Optimized', 'Dark Mode', 'Responsive Design'],
        techStack: ['React.js', 'Vite', 'Node.js', 'MongoDB', 'Cloudinary', 'Tailwind CSS', 'Framer Motion'],
        githubUrl: 'https://github.com/alexjohnson/portfolio',
        liveUrl: 'https://alexjohnson.dev',
        featured: false,
        order: 4,
        category: 'Web Development',
      },
    ];
    await Project.insertMany(projects);
    console.log(`✅ ${projects.length} projects created`);

    // ── Education ────────────────────────────────────────────────
    const education = [
      {
        degree: 'Bachelor of Technology in Computer Science & Engineering',
        institution: 'Massachusetts Institute of Technology',
        location: 'Cambridge, MA',
        startYear: '2021',
        endYear: '2025',
        cgpa: '8.9/10',
        description: 'Specialized in Software Engineering and Distributed Systems. Active member of the ACM Student Chapter and Web Development Club.',
        order: 1,
      },
      {
        degree: 'Higher Secondary Certificate (Class XII)',
        institution: 'Springfield High School',
        location: 'Springfield, MA',
        startYear: '2019',
        endYear: '2021',
        percentage: '94.5%',
        description: 'Science stream with Computer Science. School topper in Mathematics and Computer Science.',
        order: 2,
      },
    ];
    await Education.insertMany(education);
    console.log(`✅ ${education.length} education records created`);

    // ── Certifications ───────────────────────────────────────────
    const certifications = [
      {
        title: 'AWS Certified Developer – Associate',
        issuer: 'Amazon Web Services',
        issueDate: '2024-03',
        credentialUrl: 'https://aws.amazon.com/certification/',
        skills: ['AWS', 'Cloud Computing', 'Lambda', 'S3', 'DynamoDB'],
        order: 1,
      },
      {
        title: 'MongoDB Certified Developer',
        issuer: 'MongoDB University',
        issueDate: '2023-11',
        credentialUrl: 'https://university.mongodb.com/certification',
        skills: ['MongoDB', 'Aggregation', 'Indexing', 'Schema Design'],
        order: 2,
      },
      {
        title: 'The Complete JavaScript Course 2024',
        issuer: 'Udemy',
        issueDate: '2023-06',
        credentialUrl: 'https://udemy.com',
        skills: ['JavaScript', 'ES6+', 'Async/Await', 'OOP'],
        order: 3,
      },
      {
        title: 'React — The Complete Guide',
        issuer: 'Udemy',
        issueDate: '2023-08',
        credentialUrl: 'https://udemy.com',
        skills: ['React', 'Hooks', 'Redux', 'Context API'],
        order: 4,
      },
    ];
    await Certification.insertMany(certifications);
    console.log(`✅ ${certifications.length} certifications created`);

    // ── Social Links ─────────────────────────────────────────────
    const socialLinks = [
      { platform: 'GitHub', url: 'https://github.com/alexjohnson', username: 'alexjohnson', isCodingProfile: true, isVisible: true, order: 1 },
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/alexjohnson', username: 'alexjohnson', isCodingProfile: false, isVisible: true, order: 2 },
      { platform: 'LeetCode', url: 'https://leetcode.com/alexjohnson', username: 'alexjohnson', isCodingProfile: true, isVisible: true, order: 3 },
      { platform: 'HackerRank', url: 'https://hackerrank.com/alexjohnson', username: 'alexjohnson', isCodingProfile: true, isVisible: true, order: 4 },
      { platform: 'CodeChef', url: 'https://codechef.com/users/alexjohnson', username: 'alexjohnson', isCodingProfile: true, isVisible: true, order: 5 },
      { platform: 'Codeforces', url: 'https://codeforces.com/profile/alexjohnson', username: 'alexjohnson', isCodingProfile: true, isVisible: true, order: 6 },
      { platform: 'Twitter', url: 'https://twitter.com/alexjohnson_dev', username: 'alexjohnson_dev', isCodingProfile: false, isVisible: true, order: 7 },
    ];
    await SocialLink.insertMany(socialLinks);
    console.log(`✅ ${socialLinks.length} social links created`);

    // ── Site Settings ────────────────────────────────────────────
    await SiteSettings.create({
      siteTitle: 'S. Mari Rajan | Full Stack Developer',
      siteDescription: 'Portfolio of S. Mari Rajan — Full Stack Developer & Final Year CS Student specializing in MERN stack, React, and Node.js.',
      siteKeywords: 'S. Mari Rajan, Full Stack Developer, React Developer, Node.js, MERN Stack, Portfolio, CS Student',
      themeColor: '#4ADE80',
      accentColor: '#22c55e',
    });
    console.log('✅ Site settings created');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Login Credentials:');
    console.log('  Username: admin');
    console.log('  Password: admin1234');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedData();
