'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { Section, Reveal } from '@/components/ui';
import { publication } from '@/content/site';

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false });

export default function Publications() {
  const [open, setOpen] = useState(false);

  return (
    <Section id="research" eyebrow="Research" title="Publications">
      <Reveal>
        <article className="panel p-7 md:p-9">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div>
              <h3 className="text-[1.15rem] font-semibold leading-snug max-w-[38ch]">
                {publication.title}
              </h3>
              <p className="mt-2 text-sm">{publication.authors}</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-4)' }}>
                {publication.affiliation}
              </p>
              <p
                className="mt-3 text-xs"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-2)' }}
              >
                {publication.venue}
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button type="button" onClick={() => setOpen((v) => !v)} className="btn btn-solid">
                {open ? 'Hide paper' : 'Read paper'}
              </button>
              <a href={publication.pdf} download className="btn btn-quiet">
                Download PDF
              </a>
            </div>
          </div>

          <p className="mt-6 text-sm leading-relaxed">{publication.abstract}</p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {publication.keywords.map((keyword) => (
              <span key={keyword} className="chip">
                {keyword}
              </span>
            ))}
          </div>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div
                  className="mt-6 rounded-lg border overflow-hidden"
                  style={{ borderColor: 'var(--border)', height: 640 }}
                >
                  <PDFViewer url={publication.pdf} name="AI-based Online Exam Proctoring System.pdf" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </article>
      </Reveal>
    </Section>
  );
}
