'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, SunMedium } from 'lucide-react';

export const NAV_SECTIONS = ['Home', 'Projects', 'Experience'] as const;

export const SECTION_IDS: Record<string, string> = {
  Home: 'home',
  Projects: 'projects',
  Experience: 'experience',
};

export default function Nav({
  activeSection,
  scrollToSection,
  theme,
  onToggleTheme,
  onOpenResume,
}: {
  activeSection: string;
  scrollToSection: (s: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenResume: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300"
      style={{
        background: scrolled ? 'color-mix(in srgb, var(--bg-base) 88%, transparent)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      }}
    >
      <div className="wrap flex items-center justify-between h-16">
        {/* Wordmark */}
        <button
          type="button"
          onClick={() => scrollToSection('Home')}
          className="font-bold tracking-tight text-[1.05rem]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}
        >
          <span style={{ color: 'var(--text-4)' }}>&lt;</span>
          ram
          <span style={{ color: 'var(--text-4)' }}>/&gt;</span>
        </button>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-3">
          {NAV_SECTIONS.map((sec) => (
            <button
              key={sec}
              onClick={() => scrollToSection(sec)}
              className="px-4 py-1.5 rounded-md text-sm transition-colors"
              style={{
                color: activeSection === sec ? 'var(--text-1)' : 'var(--text-4)',
                background: activeSection === sec ? 'var(--bg-elevated)' : 'transparent',
                fontWeight: activeSection === sec ? 550 : 450,
              }}
            >
              {sec}
            </button>
          ))}
          <a
            href="/notes"
            className="px-4 py-1.5 rounded-md text-sm transition-colors hover:text-[var(--text-1)]"
            style={{ color: 'var(--text-4)' }}
          >
            Notes
          </a>

          <div className="w-px h-5 mx-3" style={{ background: 'var(--border)' }} />

          <button type="button" onClick={onOpenResume} className="btn btn-quiet !px-5 !py-1.5 text-sm">
            Resume
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-elevated)]"
            style={{ color: 'var(--text-3)' }}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            {theme === 'light' ? <Moon size={15} /> : <SunMedium size={15} />}
          </button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 lg:hidden">
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md"
            style={{ color: 'var(--text-3)' }}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            {theme === 'light' ? <Moon size={16} /> : <SunMedium size={16} />}
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md"
            style={{ color: 'var(--text-3)' }}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
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
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden"
            style={{
              background: 'var(--bg-base)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div className="wrap py-4 flex flex-col gap-1">
              {NAV_SECTIONS.map((sec) => (
                <button
                  key={sec}
                  onClick={() => {
                    scrollToSection(sec);
                    setIsOpen(false);
                  }}
                  className="text-left px-3 py-2.5 rounded-md text-[0.95rem]"
                  style={{
                    color: activeSection === sec ? 'var(--text-1)' : 'var(--text-3)',
                    background: activeSection === sec ? 'var(--bg-elevated)' : 'transparent',
                  }}
                >
                  {sec}
                </button>
              ))}
              <a
                href="/notes"
                className="px-3 py-2.5 rounded-md text-[0.95rem]"
                style={{ color: 'var(--text-3)' }}
              >
                Notes
              </a>
              <button
                type="button"
                onClick={() => {
                  onOpenResume();
                  setIsOpen(false);
                }}
                className="btn btn-solid mt-2 w-fit"
              >
                View Resume
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
