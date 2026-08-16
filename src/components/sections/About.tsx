'use client';

import Image from 'next/image';
import { Section, Reveal } from '@/components/ui';
import { about, education } from '@/content/site';

function renderWithEmphasis(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} style={{ color: 'var(--text-1)', fontWeight: 700 }}>
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

export default function About() {
  return (
    <Section id="about" eyebrow="About" title="About me">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 items-start">
        {/* Photo */}
        <Reveal>
          <div
            className="relative w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden mx-auto lg:mx-0"
            style={{ border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}
          >
            <Image
              src={about.image}
              alt="Ram"
              fill
              className="object-cover"
              style={{ objectPosition: '38% 22%' }}
              sizes="(max-width: 1024px) 420px, 420px"
            />
          </div>
        </Reveal>

        {/* Story */}
        <Reveal delay={0.08}>
          <div className="flex flex-col gap-6">
            {/* Education */}
            <div className="pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="eyebrow mb-3">Education</p>
              <h3 className="text-[1.05rem] font-semibold leading-snug">{education.institution}</h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-3)' }}>
                {education.degree}
              </p>
              <p
                className="mt-2 text-xs"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-4)' }}
              >
                {education.duration} · {education.grade}
              </p>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--text-3)' }}>
                Thesis —{' '}
                <a href={education.thesisLink} className="link font-medium">
                  {education.thesis}
                </a>
              </p>
            </div>

            {about.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="text-[1.02rem] leading-[1.85]">
                {renderWithEmphasis(paragraph)}
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
