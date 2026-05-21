'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Trash2, Edit3, Save, X, ArrowLeft,
  BookOpen, Calendar, Clock, ChevronRight,
  Eye, Pen, AlertCircle, Check, Sparkles,
} from 'lucide-react';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────
interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  category: string;
  coverColor: string;
  readTime: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ['All', 'Deep Learning', 'NLP', 'MLOps', 'Computer Vision', 'Career', 'Research', 'Tutorial'];
const FEATURED_TAGS = CATEGORIES.filter((category) => category !== 'All');

const CAT_COLORS: Record<string, string> = {
  'Deep Learning': '#3b82f6',
  'NLP':           '#8b5cf6',
  'MLOps':         '#14b8a6',
  'Computer Vision':'#f59e0b',
  'Career':        '#10b981',
  'Research':      '#6366f1',
  'Tutorial':      '#ec4899',
};

const COVER_GRADIENTS: Record<string, string> = {
  blue:   'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
  purple: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
  teal:   'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
  amber:  'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
  green:  'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
  indigo: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
};

const STORAGE_KEY = 'portfolio_blog_v3';
const generateId  = () => `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const readTimeCalc = (content: string) => Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ─────────────────────────────────────────────────────────────
//  SAMPLE POSTS
// ─────────────────────────────────────────────────────────────
const SAMPLE_POSTS: Post[] = [];

// ─────────────────────────────────────────────────────────────
//  HOOKS
// ─────────────────────────────────────────────────────────────
function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const parsedPosts = stored ? (JSON.parse(stored) as Post[]) : SAMPLE_POSTS;
        setPosts(Array.isArray(parsedPosts) ? parsedPosts : []);
        if (!stored) localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_POSTS));
      } catch {
        setPosts([]);
      }
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((updated: Post[] | ((prev: Post[]) => Post[])) => {
    setPosts((prev) => {
      const next = typeof updated === 'function' ? updated(prev) : updated;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors.
      }
      return next;
    });
  }, []);

  const addPost = useCallback(
    (data: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'readTime'>) => {
      const post: Post = {
        ...data,
        id: generateId(),
        readTime: readTimeCalc(data.content),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      persist((previous) => [post, ...previous]);
      return post.id;
    },
    [persist],
  );

  const updatePost = useCallback(
    (id: string, data: Partial<Omit<Post, 'id' | 'createdAt'>>) => {
      persist((previous) =>
        previous.map((post) =>
          post.id === id
            ? {
                ...post,
                ...data,
                readTime: readTimeCalc(data.content ?? post.content),
                updatedAt: new Date().toISOString(),
              }
            : post,
        ),
      );
    },
    [persist],
  );

  const deletePost = useCallback(
    (id: string) => {
      persist((previous) => previous.filter((post) => post.id !== id));
    },
    [persist],
  );

  return { posts, loaded, addPost, updatePost, deletePost };
}

// ─────────────────────────────────────────────────────────────
//  EDITOR
// ─────────────────────────────────────────────────────────────
interface EditorProps {
  post?: Post | null;
  onSave: (data: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'readTime'>) => void;
  onClose: () => void;
}

const PostEditor: React.FC<EditorProps> = ({ post, onSave, onClose }) => {
  const [title, setTitle]     = useState(post?.title || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [tags, setTags]       = useState(post?.tags.join(', ') || '');
  const [category, setCategory] = useState(post?.category || 'Deep Learning');
  const [color, setColor]     = useState(post?.coverColor || 'blue');
  const [published, setPublished] = useState(post?.published ?? false);
  const [tab, setTab]         = useState<'write' | 'preview'>('write');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), excerpt: excerpt.trim() || content.slice(0, 120) + '...', content, tags: tags.split(',').map(t => t.trim()).filter(Boolean), category, coverColor: color, published });
    onClose();
  };

  // Simple markdown-to-HTML renderer
  const renderPreview = (md: string) => {
    return md
      .replace(/^### (.+)$/gm, '<h3 style="font-family:var(--font-display);color:var(--text-1);font-size:1.1rem;font-weight:700;letter-spacing:-0.02em;margin:1.8em 0 0.6em">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="font-family:var(--font-display);color:var(--text-1);font-size:1.35rem;font-weight:800;letter-spacing:-0.025em;margin:2em 0 0.7em">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 style="font-family:var(--font-display);color:var(--text-1);font-size:1.75rem;font-weight:900;letter-spacing:-0.03em;margin:0 0 0.7em">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text-1);font-weight:700">$1</strong>')
      .replace(/`([^`]+)`/g, '<code style="background:var(--bg-sunken);border:1px solid var(--border);padding:0.15em 0.4em;border-radius:4px;font-family:var(--font-mono);font-size:0.85em;color:var(--accent)">$1</code>')
      .replace(/```([\w]*)\n([\s\S]*?)```/g, '<pre style="background:var(--bg-sunken);border:1px solid var(--border);border-radius:10px;padding:1rem;overflow-x:auto;margin:1.5em 0;font-family:var(--font-mono);font-size:0.8rem;color:var(--text-2)"><code>$2</code></pre>')
      .replace(/^- (.+)$/gm, '<li style="color:var(--text-2);margin-bottom:0.3em">$1</li>')
      .replace(/(<li.*<\/li>\n?)+/g, '<ul style="padding-left:1.5em;margin-bottom:1.2em">$&</ul>')
      .replace(/^(?!<[huplo]|```)(.+)$/gm, '<p style="color:var(--text-3);line-height:1.85;margin-bottom:1.2em">$1</p>')
      .replace(/<p style[^>]+><\/p>/g, '');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-4 border-b glass" style={{ borderColor: 'var(--border)' }}>
        <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ border: '1px solid var(--border)', color: 'var(--text-3)', background: 'var(--bg-elevated)' }}>
          <X size={15} />
        </button>
        <span className="font-bold text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
          {post ? 'Edit Post' : 'New Post'}
        </span>

        <div className="flex rounded-xl border overflow-hidden ml-4" style={{ border: '1px solid var(--border)' }}>
          {(['write', 'preview'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className="px-4 py-2 text-xs font-medium flex items-center gap-1.5 capitalize transition-colors" style={{ background: tab === t ? 'var(--accent-subtle)' : 'var(--bg-elevated)', color: tab === t ? 'var(--accent)' : 'var(--text-4)', fontFamily: 'var(--font-display)' }}>
              {t === 'write' ? <Pen size={11} /> : <Eye size={11} />} {t}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
            <div onClick={() => setPublished(p => !p)} className="w-10 h-5.5 rounded-full relative cursor-pointer transition-colors" style={{ background: published ? 'var(--accent)' : 'var(--border)', padding: '2px' }}>
              <div className="w-4 h-4 rounded-full bg-white shadow transition-transform" style={{ transform: published ? 'translateX(18px)' : 'translateX(0)' }} />
            </div>
            {published ? 'Published' : 'Draft'}
          </label>
          <button onClick={handleSave} disabled={!title.trim()} className="btn btn-primary px-5 py-2.5 text-sm gap-1.5 disabled:opacity-40">
            <Save size={13} /> {post ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r flex-shrink-0 p-5 space-y-5 overflow-y-auto" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
          <div>
            <label className="section-label mb-2 block">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input text-sm" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="section-label mb-2 block">Cover Color</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(COVER_GRADIENTS).map(([key, grad]) => (
                <button key={key} onClick={() => setColor(key)} className="w-7 h-7 rounded-lg border-2 transition-all" style={{ background: grad, borderColor: color === key ? 'var(--text-1)' : 'transparent', transform: color === key ? 'scale(1.15)' : 'scale(1)' }} title={key} />
              ))}
            </div>
          </div>
          <div>
            <label className="section-label mb-2 block">Tags</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="tag1, tag2..." className="input text-sm" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }} />
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>Comma separated</p>
          </div>
          <div>
            <label className="section-label mb-2 block">Word Count</label>
            <p className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)' }}>{content.split(/\s+/).filter(Boolean).length}</p>
            <p className="text-xs" style={{ color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>~{readTimeCalc(content)} min read</p>
          </div>
        </div>

        {/* Main editor */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <input
              ref={titleRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Post title..."
              className="w-full text-3xl font-black outline-none bg-transparent mb-3 leading-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-1)', letterSpacing: '-0.035em' }}
            />
            <input
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="Short excerpt (shown on listing page)..."
              className="w-full text-base outline-none bg-transparent mb-6 leading-relaxed"
              style={{ color: 'var(--text-3)', fontFamily: 'var(--font-body)' }}
            />
            <div className="border-b mb-6" style={{ borderColor: 'var(--border)' }} />

            {tab === 'write' ? (
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={`Write your post in Markdown...\n\n## Heading\n\nParagraph text with **bold** and \`code\`.\n\n- List item\n\n\`\`\`python\nprint("Hello, World!")\n\`\`\``}
                className="w-full min-h-[60vh] text-sm outline-none bg-transparent resize-none leading-relaxed"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-2)', fontSize: '0.875rem' }}
              />
            ) : (
              <div className="prose-content" dangerouslySetInnerHTML={{ __html: renderPreview(content) || '<p style="color:var(--text-4);font-style:italic">Nothing to preview yet...</p>' }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  POST READER
// ─────────────────────────────────────────────────────────────
const PostReader: React.FC<{
  post: Post;
  onEdit: () => void;
  onClose: () => void;
  onDelete: () => void;
}> = ({ post, onEdit, onClose, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const renderMd = (md: string) => md
    .replace(/^### (.+)$/gm, '<h3 style="font-family:var(--font-display);color:var(--text-1);font-size:1.15rem;font-weight:700;letter-spacing:-0.02em;margin:1.8em 0 0.6em">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-family:var(--font-display);color:var(--text-1);font-size:1.45rem;font-weight:800;letter-spacing:-0.025em;margin:2em 0 0.7em">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-family:var(--font-display);color:var(--text-1);font-size:1.8rem;font-weight:900;letter-spacing:-0.03em;margin:0 0 0.7em">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text-1);font-weight:700">$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--bg-sunken);border:1px solid var(--border);padding:0.15em 0.4em;border-radius:4px;font-family:var(--font-mono);font-size:0.85em;color:var(--accent)">$1</code>')
    .replace(/```([\w]*)\n([\s\S]*?)```/g, '<pre style="background:var(--bg-sunken);border:1px solid var(--border);border-radius:12px;padding:1.25rem;overflow-x:auto;margin:1.5em 0;font-family:var(--font-mono);font-size:0.82rem;color:var(--text-2)"><code>$2</code></pre>')
    .replace(/^- (.+)$/gm, '<li style="color:var(--text-2);margin-bottom:0.35em;line-height:1.7">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul style="padding-left:1.5em;margin-bottom:1.2em">$&</ul>')
    .replace(/^(?!<[huplo]|```)(.+)$/gm, '<p style="color:var(--text-3);line-height:1.88;margin-bottom:1.25em">$1</p>')
    .replace(/<p style[^>]+><\/p>/g, '');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-y-auto" style={{ background: 'var(--bg-base)' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-10 glass border-b px-6 py-4 flex items-center gap-4" style={{ borderColor: 'var(--border)' }}>
        <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ border: '1px solid var(--border)', color: 'var(--text-3)', background: 'var(--bg-elevated)' }}>
          <ArrowLeft size={15} />
        </button>
        <span className="text-sm flex-1 truncate" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-4)' }}>{post.title}</span>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="btn btn-outline px-3.5 py-2 text-xs gap-1.5"><Edit3 size={12} /> Edit</button>
          <button
            onClick={() => { if (confirmDelete) { onDelete(); onClose(); } else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 2500); } }}
            className="btn px-3.5 py-2 text-xs gap-1.5 transition-all"
            style={{ background: confirmDelete ? 'rgba(239,68,68,0.1)' : 'var(--bg-sunken)', color: confirmDelete ? '#ef4444' : 'var(--text-3)', border: `1px solid ${confirmDelete ? 'rgba(239,68,68,0.25)' : 'var(--border)'}` }}
          >
            {confirmDelete ? <><Check size={12} /> Confirm</> : <><Trash2 size={12} /> Delete</>}
          </button>
        </div>
      </div>

      {/* Cover */}
      <div className="w-full h-48 flex items-end px-8 py-6" style={{ background: COVER_GRADIENTS[post.coverColor] || COVER_GRADIENTS.blue }}>
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: 'var(--font-display)', backdropFilter: 'blur(8px)' }}>{post.category}</span>
            {!post.published && <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(251,191,36,0.25)', color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>Draft</span>}
          </div>
          <h1 className="text-2xl font-black leading-snug" style={{ fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '-0.03em', maxWidth: '640px' }}>{post.title}</h1>
        </div>
      </div>

      {/* Meta */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="flex items-center gap-5 mb-8 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>
            <Calendar size={12} /> {formatDate(post.createdAt)}
          </div>
          <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>
            <Clock size={12} /> {post.readTime} min read
          </div>
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-sunken)', color: 'var(--text-4)', fontSize: '0.7rem' }}>#{tag}</span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="prose-content" dangerouslySetInnerHTML={{ __html: renderMd(post.content) }} />
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────
//  BLOG PAGE
// ─────────────────────────────────────────────────────────────
export default function BlogPage() {
  const { posts, loaded, addPost, updatePost, deletePost } = usePosts();
  const [editor, setEditor]   = useState<'new' | Post | null>(null);
  const [reader, setReader]   = useState<Post | null>(null);
  const [search, setSearch]   = useState('');
  const [category, setCategory] = useState('All');
  const [showDrafts, setShowDrafts] = useState(false);

  // Filter
  const filtered = posts.filter(p => {
    if (!showDrafts && !p.published) return false;
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
    const matchCat = category === 'All' || p.category === category;
    return matchSearch && matchCat;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const featured = filtered[0];
  const rest     = filtered.slice(1);
  const publishedCount = posts.filter((post) => post.published).length;
  const draftCount = posts.filter((post) => !post.published).length;

  const handleSave = useCallback((data: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'readTime'>) => {
    if (editor && typeof editor === 'object') {
      updatePost(editor.id, data);
      if (reader?.id === editor.id) setReader({ ...reader, ...data });
    } else {
      addPost(data);
    }
  }, [editor, addPost, updatePost, reader]);

  const handleReset = useCallback(() => {
    setSearch('');
    setCategory('All');
    setShowDrafts(false);
    setReader(null);
    setEditor(null);
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(circle at top left, rgba(124, 58, 237, 0.1), transparent 25%), radial-gradient(circle at top right, rgba(59, 130, 246, 0.09), transparent 24%), #ffffff',
      }}
    >
      <div className="sticky top-0 z-40 border-b backdrop-blur-xl" style={{ borderColor: 'rgba(15,23,42,0.08)', background: 'rgba(255,255,255,0.76)' }}>
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-white text-slate-600 shadow-sm transition-transform hover:-translate-y-0.5"
            style={{ borderColor: 'rgba(15,23,42,0.08)' }}
          >
            <ArrowLeft size={15} />
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-[0_18px_40px_rgba(99,102,241,0.32)]"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 55%, #22d3ee 100%)' }}
            >
              <BookOpen size={15} />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">AI/ML Blog</div>
              <h1
                className="text-lg font-black tracking-[-0.04em] text-slate-950 sm:text-xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Insights for ML Engineers
              </h1>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setEditor('new')}
            className="ml-auto inline-flex items-center gap-2 rounded-2xl border border-white/50 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(124,58,237,0.28)] backdrop-blur-xl transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.92), rgba(59,130,246,0.88))',
              boxShadow: '0 18px 45px rgba(79,70,229,0.24), inset 0 1px 0 rgba(255,255,255,0.24)',
            }}
          >
            <Plus size={14} />
            Write Post
          </motion.button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section
          className="relative overflow-hidden rounded-[2rem] border bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]"
          style={{ borderColor: 'rgba(15,23,42,0.08)' }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-24 top-[-7rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.22)_0%,rgba(124,58,237,0)_70%)] blur-2xl" />
            <div className="absolute right-[-5rem] top-[-4rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.20)_0%,rgba(37,99,235,0)_70%)] blur-2xl" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
          </div>

          <div className="relative grid gap-8 px-6 py-6 sm:px-8 sm:py-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-center xl:gap-10 xl:px-10 xl:py-10">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-violet-200/80 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">Featured post</span>
                <span className="rounded-full border border-sky-200/80 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">Production RAG</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">Updated weekly</span>
              </div>

              <h2
                className="max-w-3xl text-4xl font-black tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-6xl"
                style={{ fontFamily: 'var(--font-display)', lineHeight: 0.96 }}
              >
                Building a Production RAG System: Lessons from the Field
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Modern AI engineering notes, deployment lessons, and practical experiments for ML engineers building reliable systems.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5"> <Calendar size={13} /> {formatDate(featured?.createdAt ?? new Date().toISOString())}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5"> <Clock size={13} /> {featured?.readTime ?? 1} min read</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5"> <Sparkles size={13} /> AI/ML Portfolio</span>
              </div>

              <div className="mt-7 flex flex-wrap gap-2">
                {FEATURED_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setCategory(tag)}
                    className="rounded-full border px-3.5 py-2 text-xs font-semibold transition-all hover:-translate-y-0.5"
                    style={{
                      borderColor: category === tag ? 'rgba(124,58,237,0.22)' : 'rgba(15,23,42,0.08)',
                      background: category === tag ? 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.10))' : 'rgba(255,255,255,0.95)',
                      color: category === tag ? '#5b21b6' : '#475569',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <motion.div
              whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-[linear-gradient(135deg,rgba(17,24,39,0.98),rgba(88,28,135,0.92)_45%,rgba(37,99,235,0.92))] p-5 text-white shadow-[0_28px_70px_rgba(79,70,229,0.24)]"
            >
              <div className="absolute inset-0 opacity-90" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 25%), radial-gradient(circle at 80% 18%, rgba(56,189,248,0.18), transparent 18%), radial-gradient(circle at 70% 80%, rgba(168,85,247,0.18), transparent 22%)' }} />
              <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0)_26%,rgba(255,255,255,0.08)_52%,rgba(255,255,255,0)_76%)]" />
              <div className="relative z-10 flex h-full min-h-[24rem] flex-col justify-between rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/90">Cinematic cover</span>
                  <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-[0.7rem] font-semibold text-emerald-200">Featured</span>
                </div>

                <div className="relative mt-10 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.11),rgba(255,255,255,0.04))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                  <div className="absolute inset-0 overflow-hidden rounded-[1.5rem]">
                    <div className="absolute left-[-8%] top-[-10%] h-44 w-44 rounded-full bg-violet-500/30 blur-3xl" />
                    <div className="absolute right-[-2rem] top-6 h-40 w-40 rounded-full bg-sky-400/25 blur-3xl" />
                    <div className="absolute bottom-[-15%] left-10 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl" />
                  </div>

                  <div className="relative z-10 grid gap-4">
                    <div className="flex gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-300/90" />
                      <span className="h-2.5 w-2.5 rounded-full bg-violet-300/90" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 w-28 rounded-full bg-white/20" />
                      <div className="h-24 rounded-[1.25rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))]" />
                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-20 rounded-2xl bg-white/8" />
                        <div className="h-20 rounded-2xl bg-white/12" />
                        <div className="h-20 rounded-2xl bg-white/8" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-white/90">Production RAG for modern AI teams</div>
                    <div className="text-xs text-white/65">Hybrid retrieval, evals, and deployment lessons</div>
                  </div>
                  <button
                    onClick={() => setReader(featured ?? null)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/15"
                    disabled={!featured}
                  >
                    Read story <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div
            className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
            style={{ borderColor: 'rgba(15,23,42,0.08)' }}
          >
            <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles, topics, or tags..."
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: '#0f172a', fontFamily: 'var(--font-body)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ color: '#94a3b8' }} aria-label="Clear search">
                <X size={12} />
              </button>
            )}
          </div>

          <motion.button
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDrafts((value) => !value)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition-all"
            style={{
              borderColor: showDrafts ? 'rgba(124,58,237,0.22)' : 'rgba(15,23,42,0.08)',
              background: showDrafts ? 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.08))' : '#fff',
              color: showDrafts ? '#5b21b6' : '#475569',
              boxShadow: showDrafts ? '0 16px 40px rgba(124,58,237,0.12)' : '0 12px 30px rgba(15,23,42,0.05)',
            }}
          >
            <AlertCircle size={13} /> Drafts {draftCount > 0 ? `(${draftCount})` : ''}
          </motion.button>
        </section>

        <div className="mt-4 flex items-center justify-end">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:text-violet-700"
          >
            <X size={13} /> Reset
          </button>
        </div>

        <section className="mt-5 flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="rounded-full border px-4 py-2 text-xs font-semibold transition-all hover:-translate-y-0.5"
              style={{
                borderColor: category === cat ? 'rgba(124,58,237,0.22)' : 'rgba(15,23,42,0.08)',
                background: category === cat ? 'linear-gradient(135deg, rgba(124,58,237,0.14), rgba(59,130,246,0.10))' : '#fff',
                color: category === cat ? '#5b21b6' : '#475569',
              }}
            >
              {cat}
            </button>
          ))}
          <div className="ml-auto hidden text-sm text-slate-500 lg:block">
            {publishedCount} published · {draftCount} drafts
          </div>
        </section>

        {/* Content */}
        <div className="pt-8">
        {!loaded ? (
          <div className="space-y-4">
            <div className="h-72 rounded-[2rem] bg-gradient-to-br from-violet-50 via-white to-sky-50 shadow-[0_18px_50px_rgba(15,23,42,0.05)]" />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-44 rounded-[1.75rem] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]" />)}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <BookOpen size={40} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--text-4)' }} />
            <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-2)', letterSpacing: '-0.02em' }}>
              {search || category !== 'All' ? 'No posts found' : 'No posts yet'}
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-4)' }}>
              {search || category !== 'All' ? 'Try different filters' : 'Write your first post'}
            </p>
            {!search && category === 'All' && (
              <button onClick={() => setEditor('new')} className="btn btn-primary px-5 py-2.5 text-sm gap-1.5">
                <Plus size={14} /> Write Post
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                onClick={() => setReader(featured)}
                className="group mb-8 cursor-pointer overflow-hidden rounded-[2rem] border bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)] transition-all"
                style={{ borderColor: 'rgba(15,23,42,0.08)' }}
              >
                <div className="grid gap-0 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="relative overflow-hidden bg-white px-6 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.08),transparent_32%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.07),transparent_28%)]" />
                    <div className="relative z-10">
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{featured.category}</span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">Featured article</span>
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          <Sparkles size={9} className="mr-1 inline" />Production ready
                        </span>
                      </div>

                      <h2
                        className="max-w-3xl text-4xl font-black tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-6xl"
                        style={{ fontFamily: 'var(--font-display)', lineHeight: 0.96 }}
                      >
                        {featured.title}
                      </h2>

                      <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{featured.excerpt}</p>

                      <div className="mt-7 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5"> <Calendar size={11} /> {formatDate(featured.createdAt)}</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5"> <Clock size={11} /> {featured.readTime} min read</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5"> <Eye size={11} /> Deep AI/ML dive</span>
                      </div>

                      <div className="mt-7 flex flex-wrap gap-2.5">
                        {featured.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">#{tag}</span>
                        ))}
                      </div>

                      <div className="mt-8 flex flex-wrap items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditor(featured); }}
                          className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 transition-all hover:-translate-y-0.5 hover:bg-violet-100"
                        >
                          <Edit3 size={13} /> Edit post
                        </button>
                        <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm">
                          Read story <ChevronRight size={13} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#4c1d95_40%,#2563eb_100%)] px-5 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                    <div className="absolute inset-0 opacity-90" style={{ background: 'radial-gradient(circle at 18% 18%, rgba(255,255,255,0.20), transparent 18%), radial-gradient(circle at 82% 16%, rgba(56,189,248,0.22), transparent 22%), radial-gradient(circle at 68% 82%, rgba(192,132,252,0.20), transparent 22%)' }} />
                    <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_35%,rgba(255,255,255,0.08)_66%,rgba(255,255,255,0.02)_100%)]" />
                    <div className="relative z-10 flex min-h-[28rem] flex-col justify-between rounded-[1.5rem] border border-white/10 bg-white/8 p-5 text-white backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/85">
                          Cinematic thumbnail
                        </div>
                        <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.68rem] font-semibold text-white/85">
                          {featured.category}
                        </div>
                      </div>

                      <div className="relative mt-8 flex-1 overflow-hidden rounded-[1.6rem] border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                        <div className="absolute left-[-5rem] top-[-5rem] h-56 w-56 rounded-full bg-violet-400/30 blur-3xl" />
                        <div className="absolute right-[-4rem] top-10 h-52 w-52 rounded-full bg-sky-400/25 blur-3xl" />
                        <div className="absolute bottom-[-4rem] left-12 h-60 w-60 rounded-full bg-fuchsia-400/20 blur-3xl" />
                        <div className="relative z-10 grid h-full gap-4 p-5">
                          <div className="flex gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-white/85" />
                            <div className="h-2.5 w-2.5 rounded-full bg-sky-300/85" />
                            <div className="h-2.5 w-2.5 rounded-full bg-violet-300/85" />
                          </div>
                          <div className="grid flex-1 gap-3">
                            <div className="h-3 w-28 rounded-full bg-white/20" />
                            <div className="grid flex-1 gap-3 rounded-[1.35rem] border border-white/10 bg-white/8 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                              <div className="grid grid-cols-[1.2fr_0.8fr] gap-3">
                                <div className="rounded-[1rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))] p-4">
                                  <div className="mb-2 h-2 w-20 rounded-full bg-white/25" />
                                  <div className="h-20 rounded-[0.9rem] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_35%),linear-gradient(135deg,rgba(124,58,237,0.22),rgba(37,99,235,0.16))]" />
                                </div>
                                <div className="grid gap-3">
                                  <div className="rounded-[1rem] bg-white/8 p-3">
                                    <div className="h-2.5 w-16 rounded-full bg-white/20" />
                                    <div className="mt-3 h-8 rounded-[0.8rem] bg-white/10" />
                                  </div>
                                  <div className="rounded-[1rem] bg-white/8 p-3">
                                    <div className="h-2.5 w-20 rounded-full bg-white/20" />
                                    <div className="mt-3 h-8 rounded-[0.8rem] bg-white/10" />
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="h-16 rounded-[1rem] bg-white/8" />
                                <div className="h-16 rounded-[1rem] bg-white/12" />
                                <div className="h-16 rounded-[1rem] bg-white/8" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex items-end justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-white/90">Research-driven writing for ML engineers</div>
                          <div className="mt-1 text-xs text-white/70">Medium-like readability with Linear-style polish</div>
                        </div>
                        <button
                          onClick={() => setReader(featured)}
                          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/16"
                        >
                          Open article <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    onClick={() => setReader(post)}
                    whileHover={{ y: -4 }}
                    className="group cursor-pointer overflow-hidden rounded-[1.7rem] border bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition-all"
                    style={{ borderColor: 'rgba(15,23,42,0.08)' }}
                  >
                    <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#4c1d95_50%,#2563eb_100%)] px-5 py-4 text-white">
                      <div className="absolute inset-0 opacity-90" style={{ background: 'radial-gradient(circle at 18% 20%, rgba(255,255,255,0.18), transparent 18%), radial-gradient(circle at 82% 22%, rgba(125,211,252,0.22), transparent 18%), radial-gradient(circle at 70% 82%, rgba(192,132,252,0.20), transparent 20%)' }} />
                      <div className="relative z-10 flex items-end justify-between gap-3">
                        <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-white/90">{post.category}</span>
                        {!post.published && <span className="rounded-full border border-amber-200/20 bg-amber-400/15 px-2.5 py-1 text-[0.65rem] font-semibold text-amber-100">Draft</span>}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="mb-2 text-base font-bold tracking-[-0.03em] text-slate-950 line-clamp-2" style={{ fontFamily: 'var(--font-display)' }}>
                        {post.title}
                      </h3>
                      <p className="mb-4 flex-1 text-sm leading-6 text-slate-600 line-clamp-3">{post.excerpt}</p>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5"><Calendar size={10} /> {formatDate(post.createdAt)}</span>
                          <span className="inline-flex items-center gap-1.5"><Clock size={10} /> {post.readTime}m</span>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); setEditor(post); }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:text-violet-700"
                        >
                          <Edit3 size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t py-5 text-center" style={{ borderColor: 'rgba(15,23,42,0.08)', background: '#fff' }}>
        <p className="text-xs text-slate-400" style={{ fontFamily: 'var(--font-mono)' }}>
          {publishedCount} published · {draftCount} drafts · saved locally
        </p>
      </div>

      {/* Post reader */}
      <AnimatePresence>
        {reader && (
          <PostReader
            post={reader}
            onEdit={() => { setEditor(reader); setReader(null); }}
            onClose={() => setReader(null)}
            onDelete={() => { deletePost(reader.id); setReader(null); }}
          />
        )}
      </AnimatePresence>

      {/* Editor */}
      <AnimatePresence>
        {editor !== null && (
          <PostEditor
            post={editor === 'new' ? null : editor}
            onSave={handleSave}
            onClose={() => setEditor(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}