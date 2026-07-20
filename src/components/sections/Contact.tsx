'use client';

import { useState } from 'react';
import { Section, Reveal } from '@/components/ui';
import { profile, contact } from '@/content/site';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus('idle');
    setStatusMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to send your message right now.');
      }

      setStatus('success');
      setStatusMessage('Message sent. I’ll get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Section id="contact" eyebrow="Contact" title="Let's talk" lede={contact.lede}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
        {/* Details */}
        <Reveal>
          <div className="flex flex-col gap-8">
            <div>
              <p
                className="text-[0.72rem] uppercase tracking-[0.14em] mb-2"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-4)' }}
              >
                Email
              </p>
              <a href={`mailto:${profile.email}`} className="link text-[1.05rem] font-medium">
                {profile.email}
              </a>
            </div>

            <div>
              <p
                className="text-[0.72rem] uppercase tracking-[0.14em] mb-2"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-4)' }}
              >
                Elsewhere
              </p>
              <div className="flex flex-col gap-2">
                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="link w-fit text-sm">
                  GitHub ↗
                </a>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="link w-fit text-sm">
                  LinkedIn ↗
                </a>
                <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="link w-fit text-sm">
                  Facebook ↗
                </a>
              </div>
            </div>

            <div>
              <p
                className="text-[0.72rem] uppercase tracking-[0.14em] mb-2"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-4)' }}
              >
                Based in
              </p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
                {profile.location}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Form */}
        <Reveal delay={0.08}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
                  Name
                </span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  autoComplete="name"
                  className="field"
                  placeholder="Your name"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
                  Email
                </span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  autoComplete="email"
                  className="field"
                  placeholder="you@example.com"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
                Message
              </span>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                required
                className="field resize-y min-h-[9rem]"
                placeholder="What are you building?"
              />
            </label>

            <div className="flex items-center gap-4">
              <button type="submit" disabled={sending} className="btn btn-solid">
                {sending ? 'Sending…' : 'Send message'}
              </button>
              {statusMessage ? (
                <p
                  aria-live="polite"
                  className="text-sm font-medium"
                  style={{ color: status === 'error' ? '#C2402A' : 'var(--accent)' }}
                >
                  {statusMessage}
                </p>
              ) : null}
            </div>
          </form>
        </Reveal>
      </div>
    </Section>
  );
}
