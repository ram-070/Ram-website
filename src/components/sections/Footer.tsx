'use client';

import { profile } from '@/content/site';

export default function Footer() {
  return (
    <footer className="py-10 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="wrap flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm" style={{ color: 'var(--text-4)' }}>
          © 2026 {profile.name} · {profile.location}
        </p>
        <div className="flex items-center gap-5">
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm transition-colors hover:text-[var(--text-1)]"
            style={{ color: 'var(--text-4)' }}
          >
            GitHub
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm transition-colors hover:text-[var(--text-1)]"
            style={{ color: 'var(--text-4)' }}
          >
            LinkedIn
          </a>
          <a
            href={`mailto:${profile.email}`}
            className="text-sm transition-colors hover:text-[var(--text-1)]"
            style={{ color: 'var(--text-4)' }}
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
