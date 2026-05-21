'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Archive,
  ArrowLeft,
  Bold,
  CheckSquare,
  Clock3,
  Code2,
  FileText,
  Folder,
  FolderPlus,
  Image as ImageIcon,
  Italic,
  List,
  ListOrdered,
  Menu,
  Moon,
  Paperclip,
  Pin,
  PinOff,
  Plus,
  PencilLine,
  Quote,
  Search,
  Settings2,
  Star,
  SunMedium,
  Trash2,
  Underline,
  Undo2,
  Redo2,
  MoreHorizontal,
} from 'lucide-react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import styles from './NotesWorkspace.module.css';

type NoteStatus = 'active' | 'archived' | 'trashed';
type NoteFilter = 'all' | 'favorites' | 'recent' | 'archived' | 'trash';
type Theme = 'light' | 'dark';

type AttachmentKind = 'image' | 'file';

interface FolderItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  kind: AttachmentKind;
  createdAt: string;
}

interface Note {
  id: string;
  title: string;
  contentHtml: string;
  tags: string[];
  pinned: boolean;
  favorite: boolean;
  status: NoteStatus;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
}

interface WorkspaceData {
  notes: Note[];
  folders: FolderItem[];
}

interface Prefs {
  theme: Theme;
  workspaceName: string;
}

const STORAGE_KEY = 'portfolio_notes_v2';
const PREFS_KEY = 'portfolio_notes_prefs_v2';
const EMPTY_HTML = '<p></p>';
const SEED_TIMESTAMP = '2026-05-21T00:00:00.000Z';

const now = () => new Date().toISOString();
const uid = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

function createSeedFolders(): FolderItem[] {
  return [
    {
      id: 'research_folder',
      name: 'Research',
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    },
  ];
}

function createSeedNotes(): Note[] {
  return [
    {
      id: 'welcome_note',
      title: 'Research Notes',
      contentHtml: '<p>Use this space for experiments, ideas, paper summaries, and project plans.</p><ul><li>Keep it clean</li><li>Write naturally</li><li>Paste from anywhere</li></ul>',
      tags: ['AI', 'ML'],
      pinned: true,
      favorite: true,
      status: 'active',
      folderId: 'research_folder',
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
      attachments: [],
    },
  ];
}

function normalizeFolder(folder: Partial<FolderItem>): FolderItem {
  return {
    id: folder.id ?? uid('folder'),
    name: folder.name ?? 'Untitled folder',
    createdAt: folder.createdAt ?? SEED_TIMESTAMP,
    updatedAt: folder.updatedAt ?? SEED_TIMESTAMP,
  };
}

function normalizeNote(note: Partial<Note>): Note {
  return {
    id: note.id ?? uid('note'),
    title: note.title ?? 'Untitled note',
    contentHtml: note.contentHtml ?? EMPTY_HTML,
    tags: Array.isArray(note.tags) ? note.tags : [],
    pinned: Boolean(note.pinned),
    favorite: Boolean(note.favorite),
    status: note.status === 'archived' || note.status === 'trashed' ? note.status : 'active',
    folderId: typeof note.folderId === 'string' ? note.folderId : null,
    createdAt: note.createdAt ?? SEED_TIMESTAMP,
    updatedAt: note.updatedAt ?? SEED_TIMESTAMP,
    attachments: Array.isArray(note.attachments) ? note.attachments : [],
  };
}

function normalizeWorkspaceData(value: unknown): WorkspaceData {
  if (Array.isArray(value)) {
    return {
      notes: value.map((entry) => normalizeNote(entry as Partial<Note>)),
      folders: [],
    };
  }

  if (value && typeof value === 'object') {
    const payload = value as Partial<WorkspaceData>;
    const notes = Array.isArray(payload.notes) ? payload.notes.map((entry) => normalizeNote(entry as Partial<Note>)) : createSeedNotes();
    const folders = Array.isArray(payload.folders) ? payload.folders.map((entry) => normalizeFolder(entry as Partial<FolderItem>)) : [];
    return { notes, folders };
  }

  return {
    notes: createSeedNotes(),
    folders: createSeedFolders(),
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function toRelativeLabel(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

function plainTextToHtml(text: string) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const parts: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      const items: string[] = [];
      while (index < lines.length) {
        const current = lines[index].trim();
        const match = current.match(/^[-*•]\s+(.*)$/);
        if (!match) break;
        items.push(`<li>${escapeHtml(match[1])}</li>`);
        index += 1;
      }
      parts.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    const numberedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (numberedMatch) {
      const items: string[] = [];
      while (index < lines.length) {
        const current = lines[index].trim();
        const match = current.match(/^\d+\.\s+(.*)$/);
        if (!match) break;
        items.push(`<li>${escapeHtml(match[1])}</li>`);
        index += 1;
      }
      parts.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length) {
      const current = lines[index];
      const currentTrimmed = current.trim();
      if (!currentTrimmed) break;
      if (/^[-*•]\s+/.test(currentTrimmed) || /^\d+\.\s+/.test(currentTrimmed)) break;
      paragraph.push(escapeHtml(currentTrimmed));
      index += 1;
    }

    if (paragraph.length) {
      parts.push(`<p>${paragraph.join('<br>')}</p>`);
      continue;
    }

    index += 1;
  }

  return parts.join('') || EMPTY_HTML;
}

function createMarkdownExport(note: Note) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = note.contentHtml;
  const lines: string[] = [];

  const walk = (node: ChildNode, prefix = '') => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) lines.push(`${prefix}${text}`);
      return;
    }

    const element = node as HTMLElement;
    switch (element.tagName) {
      case 'H1':
        lines.push(`# ${element.textContent?.trim() ?? ''}`);
        break;
      case 'H2':
        lines.push(`## ${element.textContent?.trim() ?? ''}`);
        break;
      case 'H3':
        lines.push(`### ${element.textContent?.trim() ?? ''}`);
        break;
      case 'BLOCKQUOTE':
        lines.push(`> ${element.textContent?.trim() ?? ''}`);
        break;
      case 'LI':
        lines.push(`${prefix}- ${element.textContent?.trim() ?? ''}`);
        break;
      case 'UL':
      case 'OL':
        Array.from(element.childNodes).forEach((child) => walk(child, prefix));
        lines.push('');
        break;
      case 'BR':
        lines.push('');
        break;
      default:
        Array.from(element.childNodes).forEach((child) => walk(child, prefix));
        if (element.tagName === 'P') lines.push('');
        break;
    }
  };

  Array.from(wrapper.childNodes).forEach((child) => walk(child));
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() || note.title;
}

function noteMatchesFilter(note: Note, filter: NoteFilter) {
  if (filter === 'favorites') return note.status === 'active' && note.favorite;
  if (filter === 'recent') return note.status === 'active';
  if (filter === 'archived') return note.status === 'archived';
  if (filter === 'trash') return note.status === 'trashed';
  return note.status === 'active';
}

function sortNotes(notes: Note[]) {
  return [...notes].sort((left, right) => {
    if (left.pinned !== right.pinned) return left.pinned ? -1 : 1;
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}

function StatusBadge({ value }: { value: NoteStatus }) {
  return <span className={styles.statusBadge}>{value}</span>;
}

function FolderActionsMenu({
  folder,
  onRename,
  onDelete,
}: {
  folder: FolderItem;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className={styles.menuButton} aria-label={`Folder actions for ${folder.name}`}>
          <MoreHorizontal size={14} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={8} align="end" className={styles.menuContent}>
          <DropdownMenu.Item className={styles.menuItem} onSelect={onRename}>
            <PencilLine size={14} />
            Rename
          </DropdownMenu.Item>
          <DropdownMenu.Item className={`${styles.menuItem} ${styles.menuDanger}`} onSelect={onDelete}>
            <Trash2 size={14} />
            Delete folder
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function NoteActionsMenu({
  note,
  folders,
  onTogglePin,
  onToggleFavorite,
  onRename,
  onArchive,
  onDelete,
  onDuplicate,
  onRestore,
  onExportMarkdown,
  onMoveToFolder,
}: {
  note: Note;
  folders: FolderItem[];
  onTogglePin: () => void;
  onToggleFavorite: () => void;
  onRename: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRestore: () => void;
  onExportMarkdown: () => void;
  onMoveToFolder: (folderId: string | null) => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className={styles.menuButton} aria-label="More actions">
          <MoreHorizontal size={14} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={8} align="end" className={styles.menuContent}>
          <DropdownMenu.Item className={styles.menuItem} onSelect={onTogglePin}>
            {note.pinned ? <PinOff size={14} /> : <Pin size={14} />}
            {note.pinned ? 'Unpin' : 'Pin'}
          </DropdownMenu.Item>
          <DropdownMenu.Item className={styles.menuItem} onSelect={onToggleFavorite}>
            <Star size={14} />
            {note.favorite ? 'Remove favorite' : 'Favorite'}
          </DropdownMenu.Item>
          <DropdownMenu.Item className={styles.menuItem} onSelect={onRename}>
            <PencilLine size={14} />
            Rename
          </DropdownMenu.Item>
          <DropdownMenu.Item className={styles.menuItem} onSelect={onDuplicate}>
            <Plus size={14} />
            Duplicate
          </DropdownMenu.Item>
          <DropdownMenu.Item className={styles.menuItem} onSelect={onExportMarkdown}>
            <FileText size={14} />
            Export markdown
          </DropdownMenu.Item>
          <DropdownMenu.Separator className={styles.menuSeparator} />
          <DropdownMenu.Label className={styles.menuLabel}>Move to folder</DropdownMenu.Label>
          <DropdownMenu.Item className={styles.menuItem} onSelect={() => onMoveToFolder(null)}>
            <Folder size={14} />
            No folder
          </DropdownMenu.Item>
          {folders.map((folder) => (
            <DropdownMenu.Item key={folder.id} className={styles.menuItem} onSelect={() => onMoveToFolder(folder.id)}>
              <Folder size={14} />
              {folder.name}
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className={styles.menuSeparator} />
          {note.status === 'trashed' ? (
            <DropdownMenu.Item className={styles.menuItem} onSelect={onRestore}>
              <Archive size={14} />
              Restore
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Item className={styles.menuItem} onSelect={onArchive}>
              <Archive size={14} />
              Archive
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item className={`${styles.menuItem} ${styles.menuDanger}`} onSelect={onDelete}>
            <Trash2 size={14} />
            {note.status === 'trashed' ? 'Delete forever' : 'Delete'}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function SettingsMenu({
  theme,
  onRenameWorkspace,
  onToggleTheme,
  onReset,
}: {
  theme: Theme;
  onRenameWorkspace: () => void;
  onToggleTheme: () => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={menuRef} className={styles.settingsMenu}>
      <button
        type="button"
        className={styles.settingsButton}
        aria-label="Settings"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Settings2 size={14} />
        Settings
      </button>
      {open ? (
        <div className={styles.settingsMenuContent} role="menu" aria-label="Settings menu">
          <button
            type="button"
            className={styles.settingsMenuItem}
            onClick={() => {
              onRenameWorkspace();
              setOpen(false);
            }}
          >
            <PencilLine size={14} />
            Rename workspace
          </button>
          <button
            type="button"
            className={styles.settingsMenuItem}
            onClick={() => {
              onToggleTheme();
              setOpen(false);
            }}
          >
            {theme === 'light' ? <Moon size={14} /> : <SunMedium size={14} />}
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
          <button
            type="button"
            className={styles.settingsMenuItem}
            onClick={() => {
              onReset();
              setOpen(false);
            }}
          >
            <Trash2 size={14} />
            Reset sample notes
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function NotesWorkspace({ initialNoteId, initialMode }: { initialNoteId?: string; initialMode?: string }) {
  const [notes, setNotes] = useState<Note[]>(() => createSeedNotes());
  const [folders, setFolders] = useState<FolderItem[]>(() => createSeedFolders());
  const [prefs, setPrefs] = useState<Prefs>({ theme: 'light', workspaceName: 'My Notes' });
  const [selectedId, setSelectedId] = useState<string | null>(() => initialNoteId ?? createSeedNotes()[0]?.id ?? null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<NoteFilter>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved');
  const [tagDraft, setTagDraft] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);

  const currentNote = useMemo(() => notes.find((note) => note.id === selectedId) ?? null, [notes, selectedId]);
  const noteAttachments = currentNote?.attachments ?? [];
  const currentNoteFolder = useMemo(
    () => folders.find((folder) => folder.id === currentNote?.folderId) ?? null,
    [currentNote?.folderId, folders],
  );

  const folderCounts = useMemo(
    () =>
      folders.reduce<Record<string, number>>((counts, folder) => {
        counts[folder.id] = notes.filter((note) => note.folderId === folder.id).length;
        return counts;
      }, {}),
    [folders, notes],
  );

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matched = notes.filter((note) => noteMatchesFilter(note, filter)).filter((note) => {
      if (selectedFolderId && note.folderId !== selectedFolderId) return false;
      if (!query) return true;
      const tagText = note.tags.join(' ').toLowerCase();
      const text = `${note.title} ${stripHtml(note.contentHtml)} ${tagText}`.toLowerCase();
      return text.includes(query);
    });

    return sortNotes(matched);
  }, [filter, notes, search, selectedFolderId]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Typography,
      ImageExtension.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: 'Write your note here. Paste from anywhere and keep the spacing.' }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: currentNote?.contentHtml ?? EMPTY_HTML,
    immediatelyRender: true,
    editorProps: {
      attributes: {
        class: styles.editorContent,
      },
      handlePaste: (_view, event) => {
        const html = event.clipboardData?.getData('text/html');
        if (html) return false;
        const text = event.clipboardData?.getData('text/plain');
        if (!text) return false;
        const converted = plainTextToHtml(text);
        editor?.commands.insertContent(converted);
        return true;
      },
    },
    onUpdate: ({ editor: instance }) => {
      if (!currentNote) return;
      const contentHtml = instance.getHTML();
      setNotes((previous) =>
        previous.map((note) =>
          note.id === currentNote.id ? { ...note, contentHtml, updatedAt: now() } : note,
        ),
      );
    },
  });

  useEffect(() => {
    if (!editor || !currentNote) return;
    if (editor.getHTML() !== currentNote.contentHtml) {
      editor.commands.setContent(currentNote.contentHtml || EMPTY_HTML, { emitUpdate: false });
    }
  }, [currentNote, editor]);

  useEffect(() => {
    try {
      const storedNotes = window.localStorage.getItem(STORAGE_KEY);
      if (storedNotes) {
        const parsed = normalizeWorkspaceData(JSON.parse(storedNotes));
        if (parsed.notes.length) {
          setNotes(parsed.notes);
          setFolders(parsed.folders);
          // Prefer explicit initialNoteId if provided and present in parsed notes
          if (initialNoteId && parsed.notes.some((note: Note) => note.id === initialNoteId)) {
            setSelectedId(initialNoteId);
          } else {
            setSelectedId((current) => (current && parsed.notes.some((note) => note.id === current) ? current : parsed.notes[0].id));
          }
        }
      }

      const storedPrefs = window.localStorage.getItem(PREFS_KEY);
      if (storedPrefs) {
        const parsedPrefs = JSON.parse(storedPrefs) as Partial<Prefs>;
        setPrefs({
          theme: parsedPrefs.theme === 'dark' ? 'dark' : 'light',
          workspaceName: typeof parsedPrefs.workspaceName === 'string' && parsedPrefs.workspaceName.trim() ? parsedPrefs.workspaceName.trim() : 'My Notes',
        });
      }
    } catch {
      // Ignore malformed localStorage data and keep the seed notes.
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setSaveState('saving');
    const timeout = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes, folders }));
        window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
      } catch {
        // Ignore storage failures.
      }
      setSaveState('saved');
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [folders, hydrated, notes, prefs]);

  useEffect(() => {
    setTagDraft(currentNote?.tags.join(', ') ?? '');
  }, [currentNote?.id]);

  const updateNote = useCallback((id: string, updater: (note: Note) => Note) => {
    setNotes((previous) => previous.map((note) => (note.id === id ? updater(note) : note)));
  }, []);

  const createNote = useCallback(() => {
    const note: Note = {
      id: uid('note'),
      title: 'Untitled note',
      contentHtml: '<p>Start writing...</p>',
      tags: [],
      pinned: false,
      favorite: false,
      status: 'active',
      folderId: selectedFolderId,
      createdAt: now(),
      updatedAt: now(),
      attachments: [],
    };
    setNotes((previous) => [note, ...previous]);
    setSelectedId(note.id);
    setFilter('all');
    setSidebarOpen(false);
  }, []);

  // If page requested a new note immediately, create one on mount
  useEffect(() => {
    if (initialMode === 'new') {
      createNote();
    }
  }, [initialMode, createNote]);

  const duplicateNote = useCallback((note: Note) => {
    const copy: Note = {
      ...note,
      id: uid('note'),
      title: `${note.title} (copy)`,
      createdAt: now(),
      updatedAt: now(),
      attachments: note.attachments.map((attachment) => ({ ...attachment, id: uid('att') })),
    };
    setNotes((previous) => [copy, ...previous]);
    setSelectedId(copy.id);
  }, []);

  const createFolder = useCallback(() => {
    const nextName = window.prompt('New folder name', 'Main topic')?.trim();
    if (!nextName) return;
    const folder: FolderItem = {
      id: uid('folder'),
      name: nextName,
      createdAt: now(),
      updatedAt: now(),
    };
    setFolders((previous) => [folder, ...previous]);
    setSelectedFolderId(folder.id);
  }, []);

  const renameFolder = useCallback((folder: FolderItem) => {
    const nextName = window.prompt('Rename folder', folder.name)?.trim();
    if (!nextName || nextName === folder.name) return;
    setFolders((previous) => previous.map((item) => (item.id === folder.id ? { ...item, name: nextName, updatedAt: now() } : item)));
  }, []);

  const deleteFolder = useCallback((folder: FolderItem) => {
    const confirmed = window.confirm(`Delete "${folder.name}"? Notes inside will move to No folder.`);
    if (!confirmed) return;

    setFolders((previous) => previous.filter((item) => item.id !== folder.id));
    setNotes((previous) => previous.map((note) => (note.folderId === folder.id ? { ...note, folderId: null, updatedAt: now() } : note)));
    setSelectedFolderId((current) => (current === folder.id ? null : current));
  }, []);

  const moveNoteToFolder = useCallback(
    (note: Note, folderId: string | null) => {
      updateNote(note.id, (current) => ({ ...current, folderId, updatedAt: now() }));
    },
    [updateNote],
  );

  const removeNote = useCallback(
    (note: Note) => {
      setNotes((previous) => {
        const remaining = previous.filter((item) => item.id !== note.id);
        if (selectedId === note.id) {
          const fallback = remaining.find((item) => item.status === 'active') ?? remaining[0] ?? null;
          setSelectedId(fallback?.id ?? null);
        }
        return remaining;
      });
    },
    [selectedId],
  );

  const archiveNote = useCallback(
    (note: Note) => {
      updateNote(note.id, (current) => ({ ...current, status: current.status === 'archived' ? 'active' : 'archived', updatedAt: now() }));
    },
    [updateNote],
  );

  const restoreNote = useCallback(
    (note: Note) => {
      updateNote(note.id, (current) => ({ ...current, status: 'active', updatedAt: now() }));
    },
    [updateNote],
  );

  const togglePin = useCallback(
    (note: Note) => {
      updateNote(note.id, (current) => ({ ...current, pinned: !current.pinned, updatedAt: now() }));
    },
    [updateNote],
  );

  const toggleFavorite = useCallback(
    (note: Note) => {
      updateNote(note.id, (current) => ({ ...current, favorite: !current.favorite, updatedAt: now() }));
    },
    [updateNote],
  );

  const deleteForever = useCallback(
    (note: Note) => {
      setNotes((previous) => {
        const remaining = previous.filter((item) => item.id !== note.id);
        if (selectedId === note.id) {
          const fallback = remaining.find((item) => item.status === 'active') ?? remaining[0] ?? null;
          setSelectedId(fallback?.id ?? null);
        }
        return remaining;
      });
    },
    [selectedId],
  );

  const onTitleChange = useCallback(
    (value: string) => {
      if (!currentNote) return;
      updateNote(currentNote.id, (current) => ({ ...current, title: value, updatedAt: now() }));
    },
    [currentNote, updateNote],
  );

  const onTagDraftCommit = useCallback(() => {
    if (!currentNote) return;
    const tags = tagDraft
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 8);
    updateNote(currentNote.id, (current) => ({ ...current, tags, updatedAt: now() }));
  }, [currentNote, tagDraft, updateNote]);

  const insertHeading = useCallback(
    (level: 0 | 1 | 2 | 3) => {
      if (!editor) return;
      if (level === 0) {
        editor.chain().focus().setParagraph().run();
      } else {
        editor.chain().focus().toggleHeading({ level }).run();
      }
    },
    [editor],
  );

  const attachFile = useCallback(
    async (file: File) => {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      if (!currentNote) return;
      const attachment: Attachment = {
        id: uid('att'),
        name: file.name,
        url: data,
        kind: file.type.startsWith('image/') ? 'image' : 'file',
        createdAt: now(),
      };

      updateNote(currentNote.id, (current) => ({
        ...current,
        attachments: [attachment, ...current.attachments],
        updatedAt: now(),
      }));

      if (attachment.kind === 'image') {
        editor?.chain().focus().setImage({ src: data, alt: file.name }).run();
      }
    },
    [currentNote, editor, updateNote],
  );

  const onImageInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) void attachFile(file);
      event.currentTarget.value = '';
    },
    [attachFile],
  );

  const onFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) void attachFile(file);
      event.currentTarget.value = '';
    },
    [attachFile],
  );

  const exportMarkdown = useCallback((note: Note) => {
    const markdown = createMarkdownExport(note);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.replace(/\s+/g, '-').toLowerCase() || 'note'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const selectNote = useCallback((note: Note) => {
    setSelectedId(note.id);
    setSidebarOpen(false);
  }, []);

  const renameNote = useCallback((note: Note) => {
    const nextTitle = window.prompt('Rename note', note.title)?.trim();
    if (!nextTitle || nextTitle === note.title) return;
    updateNote(note.id, (current) => ({ ...current, title: nextTitle, updatedAt: now() }));
  }, [updateNote]);

  const renameWorkspace = useCallback(() => {
    const nextName = window.prompt('Rename workspace', prefs.workspaceName)?.trim();
    if (!nextName || nextName === prefs.workspaceName) return;
    setPrefs((previous) => ({ ...previous, workspaceName: nextName }));
  }, [prefs.workspaceName]);

  const resetSeedNotes = useCallback(() => {
    const seedNotes = createSeedNotes();
    const seedFolders = createSeedFolders();
    setNotes(seedNotes);
    setFolders(seedFolders);
    setSelectedId(seedNotes[0]?.id ?? null);
    setFilter('all');
    setSelectedFolderId(seedFolders[0]?.id ?? null);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        createNote();
      }
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [createNote]);

  const themeClass = prefs.theme === 'dark' ? styles.dark : styles.light;

  return (
    <div className={`${styles.page} ${themeClass}`}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div className={styles.brand}>
            <div className={styles.brandMark}>
              <FileText size={16} />
            </div>
            <div>
              <div className={styles.brandTitle}>{prefs.workspaceName}</div>
              <div className={styles.brandSubtitle}>Calm writing space for AI/ML work</div>
            </div>
          </div>
          <div className={styles.topbarStatus}>
            <span className={styles.saveStatus}>{saveState === 'saving' ? 'Saving...' : 'Saved'}</span>
            <button className={styles.mobileMenuButton} onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <Menu size={16} />
            </button>
          </div>
        </header>

        <div className={styles.workspace}>
          <AnimatePresence>
            {sidebarOpen && <motion.button className={styles.backdrop} aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />}
          </AnimatePresence>

          <motion.aside
            className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}
            initial={{ x: -14, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.sidebarHeader}>
              <div>
                <div className={styles.sidebarLabel}>Workspace</div>
                <h1 className={styles.sidebarTitle}>Notes</h1>
              </div>
              <button className={styles.sidebarCollapseButton} onClick={() => setSidebarOpen(false)} aria-label="Collapse sidebar">
                <ArrowLeft size={16} />
              </button>
            </div>

            <button className={styles.primaryButton} onClick={createNote}>
              <Plus size={16} />
              New note
            </button>

            <div className={styles.folderSection}>
              <div className={styles.sectionHeaderRow}>
                <div>
                  <div className={styles.sidebarLabel}>Folders</div>
                  <h2 className={styles.sidebarTitle}>Topics</h2>
                </div>
                <button type="button" className={styles.sectionActionButton} onClick={createFolder} aria-label="Create folder">
                  <FolderPlus size={14} />
                </button>
              </div>

              <div className={styles.folderList}>
                <button
                  type="button"
                  className={`${styles.folderItem} ${selectedFolderId === null ? styles.folderItemActive : ''}`}
                  onClick={() => setSelectedFolderId(null)}
                >
                  <span className={styles.folderItemLeft}>
                    <Folder size={14} />
                    All topics
                  </span>
                  <span className={styles.folderCount}>{notes.length}</span>
                </button>

                {folders.map((folder) => (
                  <div key={folder.id} className={styles.folderRow}>
                    <button
                      type="button"
                      className={`${styles.folderItem} ${selectedFolderId === folder.id ? styles.folderItemActive : ''}`}
                      onClick={() => setSelectedFolderId(folder.id)}
                    >
                      <span className={styles.folderItemLeft}>
                        <Folder size={14} />
                        {folder.name}
                      </span>
                      <span className={styles.folderCount}>{folderCounts[folder.id] ?? 0}</span>
                    </button>
                    <FolderActionsMenu folder={folder} onRename={() => renameFolder(folder)} onDelete={() => deleteFolder(folder)} />
                  </div>
                ))}
              </div>
            </div>

            <label className={styles.searchBox}>
              <Search size={14} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notes" />
            </label>

            <div className={styles.filterList}>
              <button className={`${styles.filterButton} ${filter === 'all' ? styles.filterButtonActive : ''}`} onClick={() => setFilter('all')}>
                <FileText size={14} /> All Notes
              </button>
              <button className={`${styles.filterButton} ${filter === 'favorites' ? styles.filterButtonActive : ''}`} onClick={() => setFilter('favorites')}>
                <Star size={14} /> Favorites
              </button>
              <button className={`${styles.filterButton} ${filter === 'recent' ? styles.filterButtonActive : ''}`} onClick={() => setFilter('recent')}>
                <Clock3 size={14} /> Recent
              </button>
              <button className={`${styles.filterButton} ${filter === 'archived' ? styles.filterButtonActive : ''}`} onClick={() => setFilter('archived')}>
                <Archive size={14} /> Archived
              </button>
              <button className={`${styles.filterButton} ${filter === 'trash' ? styles.filterButtonActive : ''}`} onClick={() => setFilter('trash')}>
                <Trash2 size={14} /> Trash
              </button>
            </div>

            <div className={styles.sidebarSpacer} />

            <div className={styles.sidebarFooter}>
              <SettingsMenu
                theme={prefs.theme}
                onRenameWorkspace={renameWorkspace}
                onToggleTheme={() => setPrefs((previous) => ({ ...previous, theme: previous.theme === 'light' ? 'dark' : 'light' }))}
                onReset={resetSeedNotes}
              />
            </div>
          </motion.aside>

          <section className={styles.editorPanel}>
            {currentNote ? (
              <div className={styles.editorShell}>
                <div className={styles.panelHeader}>
                  <div>
                    <div className={styles.sectionLabel}>Editor</div>
                    <h2 className={styles.sectionTitle}>Writing area</h2>
                    {currentNoteFolder ? <div className={styles.currentFolderLabel}>Inside {currentNoteFolder.name}</div> : null}
                  </div>
                  <NoteActionsMenu
                    note={currentNote}
                    folders={folders}
                    onTogglePin={() => togglePin(currentNote)}
                    onToggleFavorite={() => toggleFavorite(currentNote)}
                    onRename={() => renameNote(currentNote)}
                    onArchive={() => archiveNote(currentNote)}
                    onDelete={() => removeNote(currentNote)}
                    onDuplicate={() => duplicateNote(currentNote)}
                    onRestore={() => restoreNote(currentNote)}
                    onExportMarkdown={() => exportMarkdown(currentNote)}
                    onMoveToFolder={(folderId) => moveNoteToFolder(currentNote, folderId)}
                  />
                </div>

                <div className={styles.editorTopBar}>
                  <div className={styles.titleFieldWrap}>
                    <input className={styles.titleInput} value={currentNote.title} onChange={(event) => onTitleChange(event.target.value)} placeholder="Untitled note" />
                    <div className={styles.noteMetaRow}>
                      <span>{formatTimestamp(currentNote.updatedAt)}</span>
                      <StatusBadge value={currentNote.status} />
                      {currentNote.folderId ? (
                        <span className={styles.folderMetaChip}>
                          <Folder size={12} />
                          {folders.find((folder) => folder.id === currentNote.folderId)?.name ?? 'No folder'}
                        </span>
                      ) : (
                        <span className={styles.folderMetaChip}>
                          <Folder size={12} />
                          No folder
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.tagRow}>
                    {currentNote.tags.map((tag) => (
                      <span key={tag} className={styles.tagChip}>
                        #{tag}
                      </span>
                    ))}
                    <input
                      className={styles.tagInput}
                      value={tagDraft}
                      onChange={(event) => setTagDraft(event.target.value)}
                      onBlur={onTagDraftCommit}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          onTagDraftCommit();
                        }
                      }}
                      placeholder="Add tags"
                    />
                  </div>
                </div>

                <div className={styles.toolbar}>
                  <button className={styles.toolButton} onClick={() => editor?.chain().focus().toggleBold().run()} aria-label="Bold" title="Bold">
                    <Bold size={14} />
                  </button>
                  <button className={styles.toolButton} onClick={() => editor?.chain().focus().toggleItalic().run()} aria-label="Italic" title="Italic">
                    <Italic size={14} />
                  </button>
                  <button className={styles.toolButton} onClick={() => editor?.chain().focus().toggleUnderline().run()} aria-label="Underline" title="Underline">
                    <Underline size={14} />
                  </button>
                  <select className={styles.headingSelect} defaultValue="0" onChange={(event) => insertHeading(Number(event.target.value) as 0 | 1 | 2 | 3)} aria-label="Heading level">
                    <option value="0">Normal</option>
                    <option value="1">Heading 1</option>
                    <option value="2">Heading 2</option>
                    <option value="3">Heading 3</option>
                  </select>
                  <button className={styles.toolButton} onClick={() => editor?.chain().focus().toggleBulletList().run()} aria-label="Bullet list" title="Bullet list">
                    <List size={14} />
                  </button>
                  <button className={styles.toolButton} onClick={() => editor?.chain().focus().toggleOrderedList().run()} aria-label="Numbered list" title="Numbered list">
                    <ListOrdered size={14} />
                  </button>
                  <button className={styles.toolButton} onClick={() => editor?.chain().focus().toggleTaskList().run()} aria-label="Checklist" title="Checklist">
                    <CheckSquare size={14} />
                  </button>
                  <button className={styles.toolButton} onClick={() => editor?.chain().focus().toggleBlockquote().run()} aria-label="Quote" title="Quote">
                    <Quote size={14} />
                  </button>
                  <button className={styles.toolButton} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} aria-label="Code block" title="Code block">
                    <Code2 size={14} />
                  </button>
                  <button className={styles.toolButton} onClick={() => editor?.chain().focus().undo().run()} aria-label="Undo" title="Undo">
                    <Undo2 size={14} />
                  </button>
                  <button className={styles.toolButton} onClick={() => editor?.chain().focus().redo().run()} aria-label="Redo" title="Redo">
                    <Redo2 size={14} />
                  </button>
                  <button className={styles.toolButton} onClick={() => imageInputRef.current?.click()} aria-label="Upload image" title="Upload image">
                    <ImageIcon size={14} />
                  </button>
                  <button className={styles.toolButton} onClick={() => fileInputRef.current?.click()} aria-label="Attach file" title="Attach file">
                    <Paperclip size={14} />
                  </button>
                </div>

                <div className={styles.editorScroll} ref={editorRef}>
                  <EditorContent editor={editor} />
                </div>

                {noteAttachments.length ? (
                  <div className={styles.attachmentRow}>
                    {noteAttachments.map((attachment) => (
                      <div key={attachment.id} className={styles.attachmentChip}>
                        <span>{attachment.name}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

              </div>
            ) : (
              <div className={styles.emptyStateLarge}>
                <div className={styles.emptyIcon}>
                  <FileText size={28} />
                </div>
                <h3>No note selected</h3>
                <p>Create a note to start writing.</p>
                <button className={styles.primaryButton} onClick={createNote}>
                  <Plus size={16} /> New note
                </button>
              </div>
            )}
          </section>

          <section className={styles.listPanel}>
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.sectionLabel}>Notes</div>
                <h2 className={styles.sectionTitle}>{filter === 'all' ? 'All notes' : filter.charAt(0).toUpperCase() + filter.slice(1)}</h2>
              </div>
              <button className={styles.inlineMenuButton} onClick={() => setSidebarOpen(true)} aria-label="Show sidebar">
                <Menu size={16} />
              </button>
            </div>

            <div className={styles.noteList}>
              {filteredNotes.length ? (
                filteredNotes.map((note) => (
                  <motion.article
                    key={note.id}
                    className={`${styles.noteItem} ${selectedId === note.id ? styles.noteItemActive : ''}`}
                    onClick={() => selectNote(note)}
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.16 }}
                  >
                    <div className={styles.noteItemBody}>
                      <div className={styles.noteItemTopRow}>
                        <h3 className={styles.noteItemTitle}>{note.title}</h3>
                        {note.pinned ? <Pin size={12} className={styles.mutedIcon} /> : null}
                      </div>
                      <p className={styles.noteItemPreview}>{stripHtml(note.contentHtml) || 'Empty note'}</p>
                      <div className={styles.noteItemTime}>{formatTimestamp(note.updatedAt)}</div>
                    </div>
                    <NoteActionsMenu
                      note={note}
                      folders={folders}
                      onTogglePin={() => togglePin(note)}
                      onToggleFavorite={() => toggleFavorite(note)}
                      onRename={() => renameNote(note)}
                      onArchive={() => archiveNote(note)}
                      onDelete={() => removeNote(note)}
                      onDuplicate={() => duplicateNote(note)}
                      onRestore={() => restoreNote(note)}
                      onExportMarkdown={() => exportMarkdown(note)}
                      onMoveToFolder={(folderId) => moveNoteToFolder(note, folderId)}
                    />
                  </motion.article>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <FileText size={22} />
                  </div>
                  <h3>No notes found</h3>
                  <p>Try another search or create a new note.</p>
                  <button className={styles.primaryButton} onClick={createNote}>
                    <Plus size={16} /> New note
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <input ref={imageInputRef} type="file" accept="image/*" className={styles.hiddenInput} onChange={onImageInput} />
      <input ref={fileInputRef} type="file" className={styles.hiddenInput} onChange={onFileInput} />
    </div>
  );
}
