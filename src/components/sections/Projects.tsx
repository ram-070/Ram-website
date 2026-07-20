'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Section, Reveal } from '@/components/ui';
import { projects, profile } from '@/content/site';

// Illustrative heterogeneous graph for the GNN project card
const GNN_NODES = [
  { id: 'player1', label: 'Player A', kind: 'player', x: 70, y: 70 },
  { id: 'player2', label: 'Player B', kind: 'player', x: 70, y: 270 },
  { id: 'player3', label: 'Player C', kind: 'player', x: 70, y: 170 },
  { id: 'device', label: 'Device', kind: 'entity', x: 250, y: 220 },
  { id: 'ip', label: 'IP Address', kind: 'entity', x: 250, y: 70 },
  { id: 'affiliate', label: 'Affiliate', kind: 'entity', x: 430, y: 70 },
  { id: 'bonus', label: 'Bonus', kind: 'entity', x: 430, y: 220 },
];

const GNN_EDGES = [
  ['player1', 'device'],
  ['player2', 'device'],
  ['player1', 'ip'],
  ['player3', 'ip'],
  ['player1', 'affiliate'],
  ['player2', 'bonus'],
  ['player3', 'bonus'],
];

function GNNGraph() {
  return (
    <div>
      <svg
        viewBox="0 0 500 300"
        className="w-full h-auto"
        role="img"
        aria-label="Heterogeneous graph linking Player, Device, IP Address, Affiliate, and Bonus nodes"
      >
        {GNN_EDGES.map(([from, to]) => {
          const a = GNN_NODES.find((n) => n.id === from)!;
          const b = GNN_NODES.find((n) => n.id === to)!;
          return (
            <line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--border-strong)"
              strokeWidth={1.5}
            />
          );
        })}
        {GNN_NODES.map((node) => {
          const color = node.kind === 'player' ? 'var(--accent)' : 'var(--accent-2)';
          return (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} r={node.kind === 'player' ? 20 : 16} fill={color} opacity={0.14} />
              <circle cx={node.x} cy={node.y} r={node.kind === 'player' ? 8 : 6} fill={color} />
              <text
                x={node.x}
                y={node.y + (node.kind === 'player' ? 36 : 32)}
                textAnchor="middle"
                fontSize="11"
                fill="var(--text-3)"
                fontFamily="var(--font-body)"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-xs mt-2" style={{ color: 'var(--text-4)' }}>
        Players A &amp; B share a device; A &amp; C share an IP — the hidden links a heterogeneous GNN
        learns to flag as a likely abuse ring.
      </p>
    </div>
  );
}

export default function Projects() {
  const [graphOpen, setGraphOpen] = useState(false);

  return (
    <Section
      id="projects"
      eyebrow="Work"
      title="Selected projects"
      lede="Systems across vision, language, and graphs — each built end-to-end, from data to deployment."
    >
      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
        {projects.map((p, idx) => (
          <Reveal key={p.title} delay={idx * 0.04}>
            <div
              className="grid gap-6 py-10 md:py-12 md:gap-10 items-start border-b md:grid-cols-[220px_1fr]"
              style={{ borderColor: 'var(--border)' }}
            >
              {p.image && (
                <div
                  className="relative aspect-[4/3] w-full rounded-lg overflow-hidden"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}
                >
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 220px"
                  />
                </div>
              )}

              <div className={p.image ? '' : 'md:col-span-2'}>
                <h3 className="text-[1.1rem] font-semibold leading-snug">{p.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed">{p.description}</p>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-4)' }}>
                  {p.impact}
                </p>

                {p.graph && (
                  <AnimatePresence initial={false}>
                    {graphOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="mt-4 rounded-lg border p-3"
                          style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
                        >
                          <GNNGraph />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {p.stack.map((tech) => (
                    <span key={tech} className="chip">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-5">
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noopener noreferrer" className="link text-sm">
                      GitHub ↗
                    </a>
                  )}
                  {p.demo && (
                    <a href={p.demo} target="_blank" rel="noopener noreferrer" className="link text-sm">
                      Watch demo ↗
                    </a>
                  )}
                  {p.graph && (
                    <button
                      type="button"
                      onClick={() => setGraphOpen((v) => !v)}
                      className="link text-sm cursor-pointer bg-transparent"
                    >
                      {graphOpen ? 'Hide graph' : 'View node graph'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-8 flex justify-end">
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="link text-sm">
            All projects on GitHub ↗
          </a>
        </div>
      </Reveal>
    </Section>
  );
}
