'use client';

import { Section, Reveal } from '@/components/ui';
import { experiences, type Experience } from '@/content/site';

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

function ExperienceCard({ exp }: { exp: Experience }) {
  return (
    <div>
      <p
        className="flex flex-wrap items-center gap-2.5 text-[0.75rem] tracking-wide"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-4)' }}
      >
        <span>{exp.duration}</span>
        <span aria-hidden="true">·</span>
        <span>{exp.type}</span>
      </p>
      <h3 className="mt-4 text-[1.05rem] font-semibold leading-snug">
        {exp.role}
        <span style={{ color: 'var(--text-4)', fontWeight: 450 }}> · {renderWithEmphasis(exp.company)}</span>
      </h3>
      <ul className="mt-7 flex flex-col gap-4">
        {exp.highlights.map((highlight) => (
          <li key={highlight} className="text-sm leading-relaxed flex gap-2.5" style={{ color: 'var(--text-3)' }}>
            <span
              className="mt-[0.62em] inline-block w-1 h-1 rounded-full shrink-0"
              style={{ background: 'var(--border-strong)' }}
            />
            <span className="min-w-0">{renderWithEmphasis(highlight)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-7 flex flex-wrap gap-2">
        {exp.stack.map((tech) => (
          <span key={tech} className="chip">
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Experience() {
  return (
    <Section id="experience" eyebrow="Experience" title="Where I've worked">
      <ol className="relative flex flex-col">
        {/* Rail */}
        <div
          className="absolute left-[5px] top-2 bottom-2 border-l-2 border-dashed"
          style={{ borderColor: 'var(--border-strong)' }}
          aria-hidden="true"
        />

        {experiences.map((exp, idx) => (
          <li key={`${exp.role}-${exp.company}`} className="relative pl-8 pb-24 last:pb-0">
            {/* Node */}
            <span
              className="absolute left-0 top-1.5 w-[11px] h-[11px] rounded-full border-2"
              style={{ borderColor: 'var(--accent)', background: 'var(--bg-base)' }}
              aria-hidden="true"
            />

            <Reveal delay={idx * 0.05}>
              <ExperienceCard exp={exp} />
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
