'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import styles from './SkillsSection.module.css';
import contactStyles from './ContactSection.module.css';
import {
  Download,
  ExternalLink,
  Menu,
  X,
  Moon,
  SunMedium,
  ArrowUp,
  Mail,
  FileText,
  ChevronDown,
  Cpu,
  Brain,
  Code2,
  ChevronLeft,
  ChevronRight,
  Award,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────────────────────

const profile = {
  name: 'Ram Dular Yadav',
  short: 'Ram',
  title: 'Machine Learning Engineer',
  tagline: 'GCP Certified',
  bio: 'I build intelligent AI systems that go from research to production. Currently at Fusemachines, I specialise in LLMs, NLP pipelines, computer vision, and time-series forecasting. I care deeply about clean architectures, reproducible experiments, and AI that actually ships.',
  github: 'https://github.com/ram-070/',
  linkedin: 'https://www.linkedin.com/in/ram-dular-yadav-1611b0228/',
  facebook: 'https://www.facebook.com/ramdular077',
  email: 'rammey115@gmail.com',
  location: 'Kathmandu, Nepal',
};

const projects = [
  {
    id: 1,
    title: 'AI-Based Online Exam Proctoring System',
    description:
      'Intelligent proctoring system using computer vision and ML to detect cheating in real-time online exams. Detects gaze deviation, face spoofing, and anomalous behaviour.',
    github: 'https://github.com/ram-070/AI-Based-online-exam-proctoring-System',
    demo: 'https://youtu.be/O8kfFmwkfOU?si=y5bgmDwDx3VHbjbI',
    image: '/ai-based-proctor.png',
  },
  {
    id: 2,
    title: 'Interview Agent',
    description:
      'Multi-agent LLM-powered system that conducts dynamic mock interviews, generates follow-up questions, and evaluates candidate responses with structured feedback.',
    github: 'https://github.com/ram-070/Interview-Agent',
    image: '/IA.png',
    demo: null as string | null,
  },
  {
    id: 3,
    title: 'Fake News Detection (NLP + Deep Learning)',
    description:
      'BERT-based classifier that identifies fake news articles with high accuracy using contextual embeddings and a fine-tuned transformer architecture.',
    github: 'https://github.com/ram-070/Fake-News-Detection-using-NLP-and-Deep-Learning',
    image: '/FN.png',
    demo: null as string | null,
  },
  {
    id: 4,
    title: 'Advanced Multimodal RAG Assistant',
    description:
      'RAG system that combines text and image understanding for intelligent document Q&A. Supports PDFs, images, and mixed-media content with vector retrieval.',
    github: 'https://github.com/ram-070/Advanced-Multimodal-RAG-Assistant',
    image: '/Rag.png',
    demo: null as string | null,
  },
  {
    id: 5,
    title: 'Image Caption Generator',
    description:
      'Attention-based neural network that generates natural language captions for images using a CNN encoder and LSTM decoder with Bahdanau attention.',
    github: 'https://github.com/ram-070/Image_caption_generator',
    image: '/imag-gen.png',

    demo: null as string | null,
  },
];

const skillGroups = [
  {
    category: 'ML & Deep Learning',
    icon: '🧠',
    items: ['ML Algorithms', 'Deep Learning', 'Neural Networks', 'Transfer Learning', 'Reinforcement Learning'],
  },
  {
    category: 'NLP & LLMs',
    icon: '💬',
    items: ['Transformers', 'BERT / GPT', 'LangChain', 'RAG Systems', 'Prompt Engineering'],
  },
  {
    category: 'Computer Vision',
    icon: '👁️',
    items: ['Image Classification', 'Object Detection', 'Face Recognition', 'OCR', 'OpenCV'],
  },
  {
    category: 'Frameworks',
    icon: '⚙️',
    items: ['TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Hugging Face'],
  },
  {
    category: 'Languages & Tools',
    icon: '🛠️',
    items: ['Python', 'SQL', 'Bash', 'Docker', 'Git'],
  },
  {
    category: 'Cloud & MLOps',
    icon: '☁️',
    items: ['Google Cloud provider', 'AWS', 'FastAPI', 'Streamlit', 'AI Studio'],
  },
];

const certifications = [
  {
    id: 1,
    title: 'Google Cloud Certified Professional ML Engineer',
    issuer: 'Google Cloud',
    date: '2024-01',
    url: 'https://drive.google.com/file/d/1TRZJzL6A3WS_ajHZFnt-RvVv050JAU6b/view',
    image: '/cert1.png',
    color: '#4285F4',
    badge: '☁️',
  },
  {
    id: 2,
    title: 'Microdegree in Artificial Intelligence',
    issuer: 'Fusemachines AI Fellowship',
    date: '2023-12',
    url: 'https://drive.google.com/file/d/1U1XAsaa8Ntjb2F0c3a0GbZfgZi8b73oU/view',
    image: '/cert2.png',
    color: '#00bfa6',
    badge: '🤖',
  },
];

const experiences = [
  {
    id: 1,
    title: 'Machine Learning Engineer',
    company: 'Fusemachines',
    duration: 'Sep 2025 – Present',
    type: 'Full-time',
    core: 'Building production-ready AI systems for customer insight extraction and demand forecasting.',
    highlights: [
      'Transformed unstructured e-commerce reviews into structured sentiment insights using LLMs',
      'Built automated NLP pipelines to extract product trends, issues, and feature feedback at scale',
      'Developed demand forecasting system comparing XGBoost, Prophet & Linear Regression (MAE/RMSE)',
      'Engineered time-series features: seasonality, lag variables, rolling statistics',
      'Deployed ML solutions into production via AI Studio',
    ],
    tags: ['LLMs', 'Time Series', 'XGBoost', 'Prophet', 'NLP', 'MLOps', 'AI Studio'],
    color: '#0b6ef6',
  },
  {
    id: 2,
    title: 'AI / ML Intern',
    company: 'Fusemachines',
    duration: 'May 2025 – Sep 2025',
    type: 'Internship',
    core: 'Built an LLM-powered multi-agent interview simulation system.',
    highlights: [
      'Developed multi-agent interview system using LangChain with dynamic conversation flow',
      'Simulated human-like technical and behavioural interview sessions',
      'Created structured technical learning content for the AI Fellowship curriculum',
    ],
    tags: ['LangChain', 'LLMs', 'Prompt Engineering', 'Multi-Agent'],
    color: '#00bfa6',
  },
  {
    id: 3,
    title: 'AI Fellowship',
    company: 'Fusemachines',
    duration: 'Apr 2024 – Nov 2024',
    type: 'Fellowship',
    core: 'Intensive end-to-end AI programme covering ML, CV, NLP, and production deployment.',
    highlights: [
      'Built and deployed ML, computer vision, and NLP applications end-to-end',
      'Developed real-time applications with Streamlit + Docker containerisation',
      'Deep-dived into Transformers, Generative AI, and MLOps best practices',
    ],
    tags: ['Deep Learning', 'NLP', 'Computer Vision', 'Docker', 'MLOps'],
    color: '#7c3aed',
  },
  {
    id: 4,
    title: 'Data Analyst',
    company: 'Karma Technology',
    duration: 'Nov 2023 – May 2024',
    type: 'Full-time',
    core: 'Built and maintained high-quality datasets for data-driven business decisions.',
    highlights: [
      'Collected, cleaned, and structured large-scale datasets for analytics',
      'Supported business intelligence workflows and insight reporting',
    ],
    tags: ['Data Analysis', 'SQL', 'Data Processing', 'BI'],
    color: '#f59e0b',
  },
];

// ─────────────────────────────────────────────────────────────
//  ICON COMPONENTS
// ─────────────────────────────────────────────────────────────

const GithubIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.866-.014-1.7-2.782.605-3.369-1.343-3.369-1.343-.455-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.071 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.84c.85.004 1.705.114 2.504.337 1.909-1.296 2.748-1.026 2.748-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.921.678 1.857 0 1.34-.012 2.421-.012 2.75 0 .269.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.523 2 12 2z" />
  </svg>
);

const LinkedinIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M19 3A2 2 0 0121 5v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm-9.5 7H6.5V18h3V10zM8 6.75A1.75 1.75 0 106.25 8.5 1.75 1.75 0 008 6.75zM18 13.5c0-2.35-1.2-3.65-3.2-3.65a2.8 2.8 0 00-2.45 1.35V10h-2.9v8h2.9v-4.2c0-1.1.2-2.15 1.55-2.15 1.33 0 1.35 1.25 1.35 2.2V18H18z" />
  </svg>
);

const FacebookIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.46H15.2c-1.2 0-1.57.75-1.57 1.52V12h2.67l-.43 2.89h-2.24v6.99A10 10 0 0022 12z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
//  SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────

/** Section header with label + title + accent divider */
const SectionHeader = ({
  inView,
  label,
  title,
}: {
  inView: boolean;
  label: string;
  title: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={inView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.5 }}
    className="text-center"
  >
    <p className="section-label mb-3">{label}</p>
    <h2 className="section-title text-4xl md:text-5xl">{title}</h2>
    <div
      className="w-14 h-0.5 mx-auto mt-4 rounded-full"
      style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)' }}
    />
  </motion.div>
);

// ─────────────────────────────────────────────────────────────
//  NAVIGATION
// ─────────────────────────────────────────────────────────────

const NAV_SECTIONS = ['Home', 'About', 'Projects', 'Skills', 'Experience', 'Certifications', 'Contact'];
const SECTION_IDS: Record<string, string> = {
  Home: 'home',
  About: 'about',
  Projects: 'projects',
  Skills: 'skills',
  Experience: 'experience',
  Certifications: 'certifications',
  Contact: 'contact',
};

const NavBar = ({
  activeSection,
  scrollProgress,
  scrollToSection,
  theme,
  onToggleTheme,
}: {
  activeSection: string;
  scrollProgress: number;
  scrollToSection: (s: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 28, delay: 0.1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? theme === 'dark'
            ? 'bg-[rgba(9,21,37,0.92)] backdrop-blur-xl border-b border-white/10 shadow-sm'
            : 'bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-16">
          {/* Brand mark */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="font-mono text-base font-bold cursor-default select-none"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}
          >
            <span className="text-slate-300">&lt;</span>
            ram
            <span className="text-slate-300">/&gt;</span>
          </motion.div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV_SECTIONS.map((sec) => (
              <motion.button
                key={sec}
                whileHover={{ scale: 1.05 }}
                onClick={() => scrollToSection(sec)}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 ${
                  activeSection === sec
                    ? 'text-[var(--accent)]'
                    : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                {sec}
              </motion.button>
            ))}
            <motion.a
              href="/notes"
              whileHover={{ scale: 1.05 }}
              className="text-sm font-medium text-slate-400 hover:text-slate-800 transition-colors"
            >
              Notes
            </motion.a>
            <motion.a
              href="/blog"
              whileHover={{ scale: 1.05 }}
              className="text-sm font-medium text-slate-400 hover:text-slate-800 transition-colors"
            >
              Blog
            </motion.a>
            <motion.a
              href="/Ram-CV.pdf"
              download
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)' }}
            >
              <Download size={13} />
              Resume
            </motion.a>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={onToggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-900"
              aria-label="Toggle theme"
              title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            >
              {theme === 'light' ? <Moon size={15} /> : <SunMedium size={15} />}
            </motion.button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-900"
              aria-label="Toggle theme"
              title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            >
              {theme === 'light' ? <Moon size={15} /> : <SunMedium size={15} />}
            </button>
            <button
              className="text-slate-500 transition-colors hover:text-slate-800"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="md:hidden overflow-hidden border-t border-slate-100"
            >
              <div className="py-5 flex flex-col gap-4">
                {NAV_SECTIONS.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      scrollToSection(sec);
                      setIsOpen(false);
                    }}
                    className={`text-left text-sm font-medium transition-colors ${
                      activeSection === sec ? 'text-[var(--accent)]' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
                <a href="/notes" className="text-sm font-medium text-slate-500 hover:text-slate-900">Notes</a>
                <a href="/blog" className="text-sm font-medium text-slate-500 hover:text-slate-900">Blog</a>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? <Moon size={14} /> : <SunMedium size={14} />}
                  {theme === 'light' ? 'Dark mode' : 'Light mode'}
                </button>
                <a
                  href="/Ram-CV.pdf"
                  download
                  className="w-fit flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)' }}
                >
                  <Download size={13} /> Resume
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll-progress bar */}
      <div
        className="h-[2px] transition-all duration-75"
        style={{
          width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-2) 100%)',
        }}
      />
    </motion.nav>
  );
};

// ─────────────────────────────────────────────────────────────
//  HERO
// ─────────────────────────────────────────────────────────────

const HeroSection = () => (
  <section
    id="home"
    className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
    style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f8fafc 55%, #eef2ff 100%)' }}
  >
    {/* Subtle dot grid */}
    <div
      className="absolute inset-0 bg-dot opacity-40 pointer-events-none"
    />

    {/* Ambient blobs */}
    <div
      className="blob blob-blue w-[520px] h-[520px] top-[10%] left-[5%]"
      style={{ opacity: 0.08 }}
    />
    <div
      className="blob blob-teal w-80 h-80 bottom-[15%] right-[8%]"
      style={{ opacity: 0.06, animationDelay: '1.2s' }}
    />

    <div className="relative z-10 section-shell w-full grid items-center gap-12 pt-24 lg:grid-cols-[1.08fr_0.92fr]">
      {/* ── Left copy ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl text-center lg:text-left"
      >
        {/* "Available" pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs mb-8"
          style={{
            fontFamily: 'var(--font-mono)',
            borderColor: 'rgba(99,102,241,0.18)',
            color: 'var(--accent)',
            background: 'rgba(99,102,241,0.04)',
          }}
        >
          <span className="status-dot" />
          Available for opportunities
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-semibold leading-[1.05] mb-4 tracking-tight"
          style={{
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.04em',
            fontSize: 'clamp(2.6rem, 6.5vw, 4.5rem)',
          }}
        >
          <span style={{ color: 'var(--text-3)' }}>Hi, I&apos;m </span>
          <span
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Ram
          </span>
        </motion.h1>

        {/* Sub-title */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-slate-600 font-semibold mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Machine Learning Engineer
        </motion.p>

        {/* Tagline (mono) */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38 }}
          className="text-slate-500 text-sm mb-8"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          GCP Certified
        </motion.p>

        {/* Bio */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44 }}
          className="text-slate-500 max-w-2xl mb-10 leading-relaxed text-base mx-auto lg:mx-0"
        >
          {profile.bio}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52 }}
          className="flex flex-col sm:flex-row gap-4 mb-10 justify-center lg:justify-start"
        >
          <motion.a
            href="#projects"
            whileHover={{
              scale: 1.04,
              boxShadow: '0 0 30px rgba(79,70,229,0.28)',
              background: 'linear-gradient(135deg, #4338ca 0%, #0369a1 100%)',
            }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3.5 rounded-xl font-semibold text-white text-sm"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              boxShadow: '0 12px 28px rgba(99,102,241,0.22)',
            }}
          >
            View Projects
          </motion.a>
          <motion.a
            href="/Ram-CV.pdf"
            download
            whileHover={{
              scale: 1.04,
              background: 'linear-gradient(135deg, #4338ca 0%, #0369a1 100%)',
              color: '#ffffff',
              borderColor: 'transparent',
              boxShadow: '0 0 24px rgba(79,70,229,0.2)',
            }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all"
            style={{
              borderColor: 'rgba(99,102,241,0.22)',
              color: '#3730a3',
              background: '#ffffff',
              boxShadow: '0 10px 24px rgba(15,23,42,0.06)',
            }}
          >
            <Download size={15} />
            Download CV
          </motion.a>
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.62 }}
          className="flex gap-3 justify-center lg:justify-start"
        >
          {[
            { Icon: GithubIcon,   url: profile.github,   label: 'GitHub',   color: '#0f172a' },
            { Icon: LinkedinIcon, url: profile.linkedin, label: 'LinkedIn', color: '#0A66C2' },
            { Icon: FacebookIcon, url: profile.facebook, label: 'Facebook', color: '#1877F2' },
          ].map(({ Icon, url, label, color }) => (
            <motion.a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.18, y: -3 }}
              aria-label={label}
              className="w-11 h-11 rounded-full flex items-center justify-center border transition-all"
              style={{ borderColor: 'var(--border)', background: '#ffffff', color }}
            >
              <Icon className="w-[18px] h-[18px]" />
            </motion.a>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Right – photo ── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="flex justify-center lg:justify-end"
      >
        <div className="relative w-64 h-64 lg:w-80 lg:h-80 mx-auto">
          {/* Glow ring behind photo */}
          <div
            className="absolute inset-0 rounded-2xl blur-2xl opacity-30 anim-pulse-soft"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          />
          {/* Photo frame */}
          <div
            className="relative w-full h-full rounded-2xl overflow-hidden border"
            style={{ borderColor: 'rgba(99,102,241,0.14)', background: '#f8fafc' }}
          >
            <Image
              src="/photos.png"
              alt="Ram Dular Yadav"
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Floating badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9, type: 'spring', stiffness: 260, damping: 18 }}
            className="absolute -bottom-4 -right-4 px-4 py-2 rounded-xl border text-xs font-bold shadow-lg"
            style={{
              background: '#ffffff',
              borderColor: 'rgba(6,182,212,0.22)',
              color: 'var(--accent-2)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            GCP Certified ✓
          </motion.div>
        </div>
      </motion.div>
    </div>

    {/* Scroll cue */}
    <motion.div
      animate={{ y: [0, 8, 0] }}
      transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400"
    >
      <ChevronDown size={20} />
    </motion.div>
  </section>
);

// ─────────────────────────────────────────────────────────────
//  ABOUT
// ─────────────────────────────────────────────────────────────

const AboutSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 });

  const stats = [
    { number: '2+', label: 'Years Experience', icon: <Cpu size={17} /> },
    { number: '5+', label: 'Major Projects',   icon: <Code2 size={17} /> },
    { number: '2',  label: 'Certifications',   icon: <Brain size={17} /> },
    { number: '∞',  label: 'Always Learning',  icon: <span className="text-base">🚀</span> },
  ];

  return (
    <section
      id="about"
      ref={ref}
      className="py-28 px-6"
      style={premiumSectionBackground}
    >
      <div className={sectionWidthClass}>
        <SectionHeader inView={inView} label="WHO AM I" title="About Me" />

        <div className="grid lg:grid-cols-2 gap-16 items-center mt-16">
          {/* Bio text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.55 }}
            className="space-y-5 text-center lg:text-left"
          >
            <p className="text-slate-500 leading-relaxed">
              I&apos;m a Machine Learning Engineer based in Kathmandu, Nepal. My journey into AI
              started with a deep fascination for how machines can understand language and visual
              context — and I&apos;ve been building in that space ever since.
            </p>
            <p className="text-slate-500 leading-relaxed">
              Currently at{' '}
              <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                Fusemachines
              </span>
              , I work on production AI systems: sentiment analysis pipelines, demand forecasting
              models, and LLM-powered agents. I&apos;ve also completed the Fusemachines AI
              Fellowship, where I built end-to-end AI applications spanning computer vision, NLP,
              and generative AI.
            </p>
            <p className="text-slate-500 leading-relaxed">
              I&apos;m a Google Cloud Certified Professional ML Engineer, and I believe strongly
              in clean code, reproducible experiments, and AI that genuinely ships to users.
            </p>
            <div className="pt-2">
              <motion.a
                href="/Ram-CV.pdf"
                download
                whileHover={{
                  scale: 1.04,
                  background: 'linear-gradient(135deg, #4338ca 0%, #0369a1 100%)',
                  color: '#ffffff',
                  boxShadow: '0 0 24px rgba(79,70,229,0.2)',
                }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  boxShadow: '0 10px 24px rgba(99,102,241,0.22)',
                }}
              >
                <FileText size={15} />
                Download Full Resume
              </motion.a>
            </div>
          </motion.div>

          {/* Stats 2 × 2 */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.55 }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5, borderColor: 'rgba(124,58,237,0.22)' }}
                className="p-6 rounded-2xl border transition-all duration-200"
                style={premiumGlassCard}
              >
                <div className="text-[var(--accent)] mb-3 flex justify-end">{s.icon}</div>
                <div
                  className="text-3xl font-black mb-1"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {s.number}
                </div>
                <div className="text-slate-500 text-sm">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
//  PROJECTS
// ─────────────────────────────────────────────────────────────

const ProjectsSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.04 });

  return (
    <section
      id="projects"
      ref={ref}
      className="py-28 px-6"
      style={premiumSectionBackground}
    >
      <div className={sectionWidthClass}>
        <SectionHeader inView={inView} label="WHAT I'VE BUILT" title="Featured Projects" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14 justify-items-center">
          {projects.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden p-6 rounded-2xl border flex flex-col transition-all duration-300 w-full max-w-[23rem]"
              style={{ ...premiumGlassCard }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(124,58,237,0.2)';
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 22px 48px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255, 255, 255, 0.86)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(226, 232, 240, 0.85)';
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 18px 40px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
              }}
            >
              {p.image && (
                <div className="mb-5 overflow-hidden rounded-[18px] border" style={{ borderColor: 'rgba(226, 232, 240, 0.85)' }}>
                  <div className="relative aspect-[16/10] w-full bg-[var(--bg-elevated)]">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </div>
                </div>
              )}

              {/* Index */}
              <span
                className="text-xs mb-2 block"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', opacity: 0.6 }}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>

              <h3 className="text-slate-900 font-bold text-lg mb-2 group-hover:text-[var(--accent)] transition-colors leading-snug">
                {p.title}
              </h3>
              <p className="text-slate-500 text-sm mb-5 leading-relaxed flex-1">{p.description}</p>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.a
                  href={p.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  aria-label={`Open ${p.title} GitHub repository`}
                  title="Open GitHub repository"
                  className="flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-medium border transition-all"
                  style={{ borderColor: 'rgba(226, 232, 240, 0.85)', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.72)' }}
                >
                  <GithubIcon className="w-5 h-5" />
                  <span className="sr-only">Code on GitHub</span>
                </motion.a>
                {p.demo && (
                  <motion.a
                    href={p.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all"
                    style={{ borderColor: 'rgba(124,58,237,0.22)', color: 'var(--accent)', background: 'rgba(124,58,237,0.06)' }}
                  >
                    <ExternalLink size={14} /> Watch Video
                  </motion.a>
                )}
              </div>

            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-6 flex justify-end"
        >
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-[var(--accent)] transition-colors"
          >
            <GithubIcon className="w-5 h-5" />
            See all projects on GitHub →
          </a>
        </motion.div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
//  SKILLS
// ─────────────────────────────────────────────────────────────

const SkillsSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.04 });
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const rootVars = {
    '--mx': pointer.x,
    '--my': pointer.y,
  } as React.CSSProperties;

  const skillPalettes = [
    { accent: '#7c3aed', soft: 'rgba(124, 58, 237, 0.18)', glow: 'rgba(124, 58, 237, 0.32)' },
    { accent: '#0ea5e9', soft: 'rgba(14, 165, 233, 0.16)', glow: 'rgba(14, 165, 233, 0.30)' },
    { accent: '#14b8a6', soft: 'rgba(20, 184, 166, 0.16)', glow: 'rgba(20, 184, 166, 0.30)' },
    { accent: '#f59e0b', soft: 'rgba(245, 158, 11, 0.16)', glow: 'rgba(245, 158, 11, 0.30)' },
    { accent: '#ec4899', soft: 'rgba(236, 72, 153, 0.16)', glow: 'rgba(236, 72, 153, 0.28)' },
    { accent: '#8b5cf6', soft: 'rgba(139, 92, 246, 0.16)', glow: 'rgba(139, 92, 246, 0.28)' },
  ];

  return (
    <section
      id="skills"
      ref={ref}
      className={styles.section}
      style={rootVars}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const nextX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const nextY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setPointer({ x: nextX, y: nextY });
      }}
      onMouseLeave={() => setPointer({ x: 0, y: 0 })}
    >
      <div className={styles.ambient} aria-hidden="true">
        <span className={`${styles.orb} ${styles.orbA}`} />
        <span className={`${styles.orb} ${styles.orbB}`} />
        <span className={`${styles.orb} ${styles.orbC}`} />
      </div>

      <div className={styles.shell}>
        <div className={styles.header}>
          <p className={styles.kicker}>Technical Toolkit</p>
          <h2 className={styles.title}>Skills & Expertise</h2>
        </div>

        <div className={styles.grid}>
          {skillGroups.map((sg, idx) => {
            const palette = skillPalettes[idx % skillPalettes.length];

            return (
              <motion.article
                key={sg.category}
                initial={{ opacity: 0, y: 28, scale: 0.98 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ delay: idx * 0.08, duration: 0.56, ease: 'easeOut' }}
                whileHover={{ y: -8, scale: 1.015 }}
                className={styles.cluster}
                style={{
                  '--accent': palette.accent,
                  '--accent-soft': palette.soft,
                  '--glow': palette.glow,
                  '--float-delay': `${idx * 0.45}s`,
                } as React.CSSProperties}
              >
                <div className={styles.clusterGlow} aria-hidden="true" />
                <div className={styles.clusterTop}>
                  <div className={styles.iconBubble} aria-hidden="true">
                    <span>{sg.icon}</span>
                  </div>
                  <div className={styles.headingBlock}>
                    <h3 className={styles.category}>{sg.category}</h3>
                  </div>
                </div>

                <div className={styles.tagRail}>
                  {sg.items.map((item, tagIdx) => (
                    <motion.span
                      key={item}
                      whileHover={{ y: -3, scale: 1.03 }}
                      className={styles.tag}
                      style={{
                        '--tag-delay': `${tagIdx * 0.04}s`,
                      } as React.CSSProperties}
                    >
                      {item}
                    </motion.span>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const premiumSectionBackground = {
  background:
    'radial-gradient(circle at top, rgba(124, 58, 237, 0.08), transparent 36%), radial-gradient(circle at 85% 20%, rgba(14, 165, 233, 0.06), transparent 30%), linear-gradient(180deg, #ffffff 0%, #f7fbff 100%)',
} as React.CSSProperties;

const premiumGlassCard = {
  background:
    'linear-gradient(145deg, rgba(255, 255, 255, 0.86), rgba(255, 255, 255, 0.62)), linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(248, 250, 252, 0.92))',
  borderColor: 'rgba(226, 232, 240, 0.85)',
  boxShadow:
    '0 18px 40px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
} as React.CSSProperties;

const sectionWidthClass = 'section-shell max-w-7xl';

// ─────────────────────────────────────────────────────────────
//  EXPERIENCE
// ─────────────────────────────────────────────────────────────

const ExperienceSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.04 });
  const [openId, setOpenId] = useState<number | null>(1);

  const toggle = (id: number) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section
      id="experience"
      ref={ref}
      className="py-32 px-6"
      style={premiumSectionBackground}
    >
      <div className={sectionWidthClass}>
        <SectionHeader inView={inView} label="WHERE I'VE WORKED" title="Experience" />

        <div className="mt-20 relative">
          {/* Central timeline spine */}
          <div
            className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 z-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(11,110,246,0.3) 0%, rgba(0,191,166,0.18) 50%, rgba(124,58,237,0.12) 80%, transparent 100%)',
            }}
          />

          <div className="flex flex-col gap-10 md:gap-0">
            {experiences.map((exp, idx) => {
              const isOpen = openId === exp.id;
              const isLeft = idx % 2 === 0;

              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 36 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: idx * 0.11, duration: 0.5 }}
                  className={`relative flex items-start md:mb-12 ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-col`}
                >
                  {/* Card */}
                  <div className={`w-full md:w-[46%] ${isLeft ? 'md:pr-10' : 'md:pl-10'}`}>
                    <motion.div
                      onClick={() => toggle(exp.id)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle(exp.id)}
                      role="button"
                      tabIndex={0}
                      whileHover={{ y: -3 }}
                      className="p-6 rounded-2xl border cursor-pointer transition-all duration-250 relative outline-none"
                      style={{
                        background: isOpen ? '#f0f7ff' : '#ffffff',
                        borderColor: isOpen ? `${exp.color}44` : 'var(--border)',
                        boxShadow: isOpen ? `0 0 28px ${exp.color}10` : 'var(--shadow-sm)',
                      }}
                    >
                      {/* Connector to spine */}
                      <div
                        className={`hidden md:block absolute top-7 h-px w-8 ${
                          isLeft ? 'right-0 translate-x-full' : 'left-0 -translate-x-full'
                        }`}
                        style={{ background: `${exp.color}50` }}
                      />

                      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className="text-xs px-2 py-0.5 rounded font-semibold"
                              style={{
                                fontFamily: 'var(--font-mono)',
                                background: `${exp.color}18`,
                                color: exp.color,
                              }}
                            >
                              {exp.type}
                            </span>
                            <span
                              className="text-xs text-slate-500"
                              style={{ fontFamily: 'var(--font-mono)' }}
                            >
                              {exp.duration}
                            </span>
                          </div>
                          <h3
                            className="text-slate-900 font-bold text-lg leading-tight"
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            {exp.title}
                          </h3>
                          <p className="text-slate-500 text-sm">@ {exp.company}</p>
                        </div>
                        <span
                          className="text-xs flex-shrink-0 mt-1"
                          style={{ color: exp.color, fontFamily: 'var(--font-mono)' }}
                        >
                          {isOpen ? '▲' : '▼'}
                        </span>
                      </div>

                      <p className="text-slate-400 text-sm leading-relaxed mb-3">{exp.core}</p>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22 }}
                            className="overflow-hidden"
                          >
                            <ul className="space-y-2 mb-4 mt-1">
                              {exp.highlights.map((h, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                                  <span
                                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ background: exp.color }}
                                  />
                                  {h}
                                </li>
                              ))}
                            </ul>
                            <div className="flex flex-wrap gap-2">
                              {exp.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2.5 py-1 rounded-md"
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    background: `${exp.color}12`,
                                    color: exp.color,
                                    border: `1px solid ${exp.color}24`,
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  {/* Spine node */}
                  <div className="hidden md:flex w-[8%] justify-center items-start pt-6 flex-shrink-0 z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={inView ? { scale: 1 } : {}}
                      transition={{ delay: idx * 0.11 + 0.1, type: 'spring', stiffness: 280, damping: 20 }}
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                      style={{
                        background: isOpen ? exp.color : '#ffffff',
                        borderColor: exp.color,
                        boxShadow: isOpen ? `0 0 14px ${exp.color}55` : 'none',
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: isOpen ? '#ffffff' : exp.color, opacity: isOpen ? 1 : 0.5 }}
                      />
                    </motion.div>
                  </div>

                  {/* Opposite side spacer */}
                  <div className="hidden md:block w-[46%]" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
//  CERTIFICATIONS
// ─────────────────────────────────────────────────────────────

const slideVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.36 },
  }),
};

const CertificationsSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const t = setInterval(() => {
      setDirection(1);
      setCurrentIdx((p) => (p + 1) % certifications.length);
    }, 5000);
    return () => clearInterval(t);
  }, [autoPlay]);

  const paginate = (dir: number) => {
    setDirection(dir);
    setCurrentIdx((p) => (p + dir + certifications.length) % certifications.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 8000);
  };

  const goTo = (idx: number) => {
    setDirection(idx > currentIdx ? 1 : -1);
    setCurrentIdx(idx);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 8000);
  };

  const cert = certifications[currentIdx];

  return (
    <section
      id="certifications"
      ref={ref}
      className="py-32 px-6"
      style={premiumSectionBackground}
    >
      <div className={`${sectionWidthClass} text-center`}>
        <SectionHeader inView={inView} label="CREDENTIALS" title="Certifications" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.55 }}
          className="mt-16"
        >
          {/* Outer card */}
          <div
            className="relative rounded-3xl overflow-hidden border"
            style={{
              background: 'linear-gradient(150deg, #ffffff, #eef6ff)',
              borderColor: `${cert.color}30`,
              boxShadow: `0 0 60px ${cert.color}0c`,
            }}
          >
            {/* Ambient glow overlay */}
            <div
              className="absolute inset-0 opacity-[0.08] pointer-events-none"
              style={{ background: `radial-gradient(ellipse at 50% 20%, ${cert.color}, transparent 65%)` }}
            />

            {/* Slide area */}
            <div className="relative overflow-hidden" style={{ height: 460 }}>
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={cert.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 flex items-center justify-center p-10"
                >
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative w-full h-full group/img block"
                    title="View full certificate"
                  >
                    <div
                      className="w-full h-full rounded-2xl overflow-hidden border relative"
                      style={{ borderColor: `${cert.color}20` }}
                    >
                      <Image
                        src={cert.image}
                        alt={cert.title}
                        fill
                        className="object-contain transition-transform duration-700 group-hover/img:scale-[1.03]"
                        priority
                      />
                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 rounded-2xl"
                        style={{ background: `${cert.color}0a` }}
                      >
                        <span
                          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold shadow-xl backdrop-blur-sm"
                          style={{ background: '#ffffffee', color: cert.color, border: `1px solid ${cert.color}35` }}
                        >
                          <ExternalLink size={14} />
                          View Full Certificate
                        </span>
                      </div>
                    </div>
                  </a>
                </motion.div>
              </AnimatePresence>

              {/* Prev */}
              <motion.button
                onClick={() => paginate(-1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center border shadow-lg"
                style={{ background: '#ffffffd0', borderColor: `${cert.color}35`, color: cert.color, backdropFilter: 'blur(8px)' }}
                aria-label="Previous certificate"
              >
                <ChevronLeft size={20} />
              </motion.button>

              {/* Next */}
              <motion.button
                onClick={() => paginate(1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center border shadow-lg"
                style={{ background: '#ffffffd0', borderColor: `${cert.color}35`, color: cert.color, backdropFilter: 'blur(8px)' }}
                aria-label="Next certificate"
              >
                <ChevronRight size={20} />
              </motion.button>

              {/* Counter */}
              <div
                className="absolute top-5 right-5 z-20 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  fontFamily: 'var(--font-mono)',
                  background: '#ffffffd0',
                  color: cert.color,
                  border: `1px solid ${cert.color}28`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                {currentIdx + 1} / {certifications.length}
              </div>
            </div>

            {/* Info row */}
            <div className="px-8 py-7 border-t text-left" style={{ borderColor: `${cert.color}12` }}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xl">{cert.badge}</span>
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        background: `${cert.color}14`,
                        color: cert.color,
                        border: `1px solid ${cert.color}22`,
                      }}
                    >
                      <Award size={10} />
                      Verified Credential
                    </span>
                  </div>
                  <h3 className="text-slate-900 font-bold text-xl leading-snug mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    {cert.title}
                  </h3>
                  <p className="text-sm font-semibold mb-1" style={{ color: cert.color }}>
                    {cert.issuer}
                  </p>
                  <p className="text-xs text-slate-500" style={{ fontFamily: 'var(--font-mono)' }}>
                    Issued:{' '}
                    {new Date(cert.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </p>
                </div>

                <div className="flex gap-3 flex-shrink-0">
                  <motion.a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                    style={{
                      background: `linear-gradient(135deg, ${cert.color}22, ${cert.color}0e)`,
                      color: cert.color,
                      border: `1px solid ${cert.color}30`,
                    }}
                  >
                    <ExternalLink size={14} /> View
                  </motion.a>
                  <motion.a
                    href={cert.url}
                    download
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--surface)' }}
                  >
                    <Download size={14} /> Save
                  </motion.a>
                </div>
              </div>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-3 mt-7">
            {certifications.map((c, idx) => (
              <motion.button
                key={idx}
                onClick={() => goTo(idx)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.85 }}
                aria-label={`Go to certificate ${idx + 1}`}
                className="rounded-full transition-all duration-300"
                style={{
                  height: 9,
                  width: idx === currentIdx ? 34 : 9,
                  background:
                    idx === currentIdx
                      ? `linear-gradient(90deg, ${c.color}, var(--accent-2))`
                      : 'rgba(15,23,42,0.10)',
                  boxShadow: idx === currentIdx ? `0 0 10px ${c.color}55` : 'none',
                }}
              />
            ))}
          </div>

          {/* Thumbnail strip */}
          <div className="flex gap-4 justify-center mt-6">
            {certifications.map((c, idx) => (
              <motion.button
                key={idx}
                onClick={() => goTo(idx)}
                whileHover={{ scale: 1.06, y: -2 }}
                aria-label={`Select certificate ${idx + 1}`}
                className="relative rounded-xl overflow-hidden border-2 transition-all duration-200"
                style={{
                  width: 96,
                  height: 58,
                  borderColor: idx === currentIdx ? c.color : 'var(--border)',
                  boxShadow: idx === currentIdx ? `0 0 14px ${c.color}40` : 'none',
                  opacity: idx === currentIdx ? 1 : 0.45,
                }}
              >
                <Image src={c.image} alt={c.title} fill className="object-cover" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
//  CONTACT
// ─────────────────────────────────────────────────────────────

const ContactSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 });
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus('idle');
    setStatusMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to send your message right now.');
      }

      setStatus('success');
      setStatusMessage('Thanks — your message was sent.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="contact"
      ref={ref}
      className={contactStyles.section}
    >
      <div className={contactStyles.ambient} aria-hidden="true">
        <span className={`${contactStyles.orb} ${contactStyles.orbA}`} />
        <span className={`${contactStyles.orb} ${contactStyles.orbB}`} />
      </div>

      <div className={contactStyles.shell}>
        <SectionHeader inView={inView} label="SAY HELLO" title="Get In Touch" />

        <div className={contactStyles.inner}>
          {/* Left – info */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className={`${contactStyles.panel} ${contactStyles.leftPanel}`}
          >
            <p className={contactStyles.copy}>
              I&apos;m open to full-time roles, freelance projects, and interesting
              collaborations in the ML/AI space. Drop me a message and I&apos;ll get back to
              you promptly.
            </p>

            <div className={contactStyles.metaList}>
              <motion.a
                href={`mailto:${profile.email}`}
                whileHover={{ x: 4 }}
                className={contactStyles.metaItem}
              >
                <div className={contactStyles.metaIcon}>
                  <Mail size={17} />
                </div>
                <div>
                  <div className={contactStyles.metaLabel}>Email</div>
                  <div className={contactStyles.metaValue}>{profile.email}</div>
                </div>
              </motion.a>
            </div>

            <div className={contactStyles.socialRow}>
              {[
                { Icon: GithubIcon,   url: profile.github,   label: 'GitHub',   color: '#0f172a' },
                { Icon: LinkedinIcon, url: profile.linkedin, label: 'LinkedIn', color: '#0A66C2' },
                { Icon: FacebookIcon, url: profile.facebook, label: 'Facebook', color: '#1877F2' },
              ].map(({ Icon, url, label, color }) => (
                <motion.a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.14, y: -3 }}
                  aria-label={label}
                  className={contactStyles.socialLink}
                  style={{ color }}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Right – form */}
          <motion.form
            initial={{ opacity: 0, x: 28 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.25, duration: 0.5 }}
            onSubmit={handleSubmit}
            className={`${contactStyles.panel} ${contactStyles.rightPanel} ${contactStyles.form}`}
          >
            {(['name', 'email'] as const).map((field) => (
              <input
                key={field}
                type={field === 'email' ? 'email' : 'text'}
                placeholder={field === 'name' ? 'Your Name' : 'Your Email'}
                value={formData[field]}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                required
                className={contactStyles.field}
              />
            ))}
            <textarea
              placeholder="Your Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={7}
              required
              className={`${contactStyles.field} ${contactStyles.textarea}`}
            />
            <motion.button
              type="submit"
              disabled={sending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={contactStyles.button}
            >
              {sending ? 'Sending...' : status === 'success' ? '✓ Message Sent!' : 'Send Message'}
            </motion.button>

            {statusMessage ? (
              <p
                aria-live="polite"
                className={status === 'error' ? contactStyles.errorText : contactStyles.successText}
              >
                {statusMessage}
              </p>
            ) : null}
          </motion.form>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────
//  FOOTER
// ─────────────────────────────────────────────────────────────

const Footer = () => (
  <footer
    className="py-8 px-6 border-t"
    style={{ background: '#ffffff', borderColor: 'var(--border)' }}
  >
    <div className="section-shell flex flex-col items-center justify-center gap-2 text-sm text-slate-400 text-center">
      <p>
        Built by{' '}
        <span className="font-semibold" style={{ color: 'var(--accent)' }}>
          Ram
        </span>{' '}
        · Machine Learning Engineer · Kathmandu, Nepal
      </p>
      <p>© 2026 · All rights reserved</p>
    </div>
  </footer>
);

// ─────────────────────────────────────────────────────────────
//  BACK TO TOP
// ─────────────────────────────────────────────────────────────

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-40 w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)' }}
          aria-label="Back to top"
        >
          <ArrowUp size={17} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────
//  PAGE ROOT
// ─────────────────────────────────────────────────────────────

export default function Home() {
  const [activeSection, setActiveSection] = useState('Home');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('portfolio_theme');
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored);
      }
    } catch {
      // Ignore storage errors.
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem('portfolio_theme', theme);
    } catch {
      // Ignore storage errors.
    }
  }, [theme]);

  const scrollToSection = (section: string) => {
    const el = document.getElementById(SECTION_IDS[section]);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: 'smooth' });
    setActiveSection(section);
  };

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);

      const current = (Object.entries(SECTION_IDS) as [string, string][]).find(([, id]) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const { top, bottom } = el.getBoundingClientRect();
        return top <= 120 && bottom >= 120;
      });
      if (current) setActiveSection(current[0]);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  const homeThemeClass = theme === 'dark' ? 'home-theme-dark' : 'home-theme-light';

  return (
    <div className={`overflow-x-hidden transition-colors duration-300 ${homeThemeClass}`} style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Page-load fade-in overlay */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="fixed inset-0 z-[200] pointer-events-none"
        style={{ background: 'var(--bg-base)' }}
      />

      <NavBar
        activeSection={activeSection}
        scrollProgress={scrollProgress}
        scrollToSection={scrollToSection}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <SkillsSection />
      <ExperienceSection />
      <CertificationsSection />
      <ContactSection />
      <Footer />

      <BackToTop />
    </div>
  );
}