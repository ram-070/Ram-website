'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { profile } from '@/content/site';
import { EASE } from '@/components/ui';

export default function Hero({ onOpenResume }: { onOpenResume: () => void }) {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-24 pb-16">
      <div className="wrap grid items-center gap-12 lg:gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
            className="inline-flex items-center gap-2 mb-6 text-[0.78rem]"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}
          >
            <span className="status-dot" />
            {profile.status}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.14 }}
            className="text-[clamp(2.8rem,6vw,4.8rem)] font-bold leading-[1.05] tracking-[-0.03em]"
          >
            Hi, I’m{' '}
            <span
              className="underline decoration-[3px] underline-offset-[8px]"
              style={{ textDecorationColor: 'var(--accent)' }}
            >
              Ram
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.22 }}
            className="mt-5 text-[clamp(1.2rem,2.2vw,1.5rem)] font-semibold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)' }}
          >
            {profile.title}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.28 }}
            className="mt-1.5 text-[0.8rem]"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}
          >
            {profile.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.34 }}
            className="mt-6 text-[1.05rem] max-w-[54ch] mx-auto lg:mx-0"
          >
            {profile.bio}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.42 }}
            className="mt-9 flex flex-wrap items-center justify-center lg:justify-start gap-3"
          >
            <a href="#projects" className="btn btn-solid">
              View work
            </a>
            <button type="button" onClick={onOpenResume} className="btn btn-quiet">
              Resume
            </button>
          </motion.div>
        </div>

        {/* Portrait */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
          className="flex justify-center lg:justify-end"
        >
          <div
            className="relative w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[320px] aspect-square rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}
          >
            <Image
              src="/hero.png"
              alt="Ram"
              fill
              priority
              className="object-cover"
              style={{ objectPosition: '50% 25%' }}
              sizes="(max-width: 640px) 240px, (max-width: 1024px) 280px, 320px"
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ color: 'var(--text-4)' }}
      >
        <ChevronDown size={20} />
      </motion.div>
    </section>
  );
}
