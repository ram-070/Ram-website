'use client';

import { motion, type Variants } from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

/** Motion wrapper: fades content up once it scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Section shell: consistent rhythm, left-aligned eyebrow + title header. */
export function Section({
  id,
  eyebrow,
  title,
  lede,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-14 md:py-20">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h2 className="text-[clamp(2.4rem,5vw,3.6rem)] font-semibold tracking-[-0.03em]">{title}</h2>
          {lede ? <p className="mt-5 text-[1.05rem]">{lede}</p> : null}
        </Reveal>
        <div className="mt-10 md:mt-12">{children}</div>
      </div>
    </section>
  );
}
