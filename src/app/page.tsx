'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, X } from 'lucide-react';

import Nav, { SECTION_IDS } from '@/components/sections/Nav';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Publications from '@/components/sections/Publications';
import Skills from '@/components/sections/Skills';
import Experience from '@/components/sections/Experience';
import Certifications from '@/components/sections/Certifications';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false });

const ResumeModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[100]" style={{ background: 'rgba(20, 24, 29, 0.5)' }} />
      <Dialog.Content
        className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(48rem,92vw)] h-[min(42rem,88vh)] rounded-xl overflow-hidden flex flex-col"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
      >
        <div
          className="flex items-center justify-between px-4 py-2.5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <Dialog.Title className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
            Resume
          </Dialog.Title>
          <Dialog.Close asChild>
            <button
              type="button"
              className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-elevated)]"
              style={{ color: 'var(--text-4)' }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </Dialog.Close>
        </div>
        <div className="flex-1 min-h-0">
          <PDFViewer url="/Ram-CV.pdf" name="Ram — Resume.pdf" />
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-7 right-7 z-40 w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-2)',
            boxShadow: 'var(--shadow-md)',
          }}
          aria-label="Back to top"
        >
          <ArrowUp size={16} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default function Home() {
  const [activeSection, setActiveSection] = useState('Home');
  const [resumeOpen, setResumeOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      return window.localStorage.getItem('portfolio_theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

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
    const top = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
    setActiveSection(section);
  };

  useEffect(() => {
    const onScroll = () => {
      const current = (Object.entries(SECTION_IDS) as [string, string][]).find(([, id]) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const { top, bottom } = el.getBoundingClientRect();
        return top <= 130 && bottom >= 130;
      });
      if (current) setActiveSection(current[0]);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="overflow-x-hidden">
      <Nav
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onOpenResume={() => setResumeOpen(true)}
      />

      <main>
        <Hero onOpenResume={() => setResumeOpen(true)} />
        <About />
        <div className="h-12 md:h-24" aria-hidden="true" />
        <Experience />
        <Projects />
        <Publications />
        <Skills />
        <Certifications />
        <Contact />
      </main>

      <Footer />
      <BackToTop />
      <ResumeModal open={resumeOpen} onOpenChange={setResumeOpen} />
    </div>
  );
}
