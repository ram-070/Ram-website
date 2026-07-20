'use client';

import Image from 'next/image';
import { Reveal } from '@/components/ui';
import { certifications } from '@/content/site';

// Rendered inside the Experience section flow as supporting credentials —
// two items don't need a carousel.
export default function Certifications() {
  return (
    <section id="certifications" className="py-14 md:py-20">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow mb-3">Credentials</p>
          <h2 className="text-[clamp(2.4rem,5vw,3.6rem)] font-semibold tracking-[-0.03em]">Certifications</h2>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {certifications.map((cert, idx) => (
            <Reveal key={cert.title} delay={idx * 0.08} className="h-full">
              <a
                href={cert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="panel panel-hover h-full flex flex-col overflow-hidden group"
              >
                <div
                  className="relative aspect-[16/10] border-b"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
                >
                  <Image
                    src={cert.image}
                    alt={cert.title}
                    fill
                    className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.015]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-6 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[1rem] font-semibold leading-snug">{cert.title}</h3>
                    <p className="mt-1 text-sm">
                      {cert.issuer}
                      <span style={{ color: 'var(--text-4)' }}> · {cert.date}</span>
                    </p>
                  </div>
                  <span className="link text-sm shrink-0 mt-0.5">View ↗</span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
