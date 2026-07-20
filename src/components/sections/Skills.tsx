'use client';

import { Section, Reveal } from '@/components/ui';
import { skillGroups } from '@/content/site';

// Grid of category blocks with tag chips — deliberately distinct from the
// editorial row-list used by Experience/Projects, so each section reads
// differently while staying borderless and whitespace-driven.
export default function Skills() {
  return (
    <Section
      id="skills"
      eyebrow="Skills"
      title="Skills & expertise"
      lede="The stack I reach for, organised by discipline."
    >
      <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((group, idx) => (
          <Reveal key={group.category} delay={idx * 0.05}>
            <div>
              <p
                className="text-[0.72rem] font-semibold uppercase tracking-[0.12em]"
                style={{ color: 'var(--text-4)' }}
              >
                {group.category}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
