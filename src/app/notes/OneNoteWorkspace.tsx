'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import { marked } from 'marked';
import {
  Bold,
  Book,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  FileText,
  Highlighter,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Menu,
  MoreHorizontal,
  Plus,
  Redo2,
  Search,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import styles from './OneNoteWorkspace.module.css';

interface PageSummary {
  id: string;
  title: string;
  updatedAt: string;
}

interface SectionData {
  id: string;
  name: string;
  notebookId: string;
  pages: PageSummary[];
}

interface NotebookData {
  id: string;
  name: string;
  sections: SectionData[];
}

interface PageDetail {
  id: string;
  title: string;
  contentHtml: string;
  sectionId: string;
  updatedAt: string;
}

interface SearchResult {
  id: string;
  title: string;
  updatedAt: string;
  section: { name: string; notebook: { name: string } };
}

const EMPTY_HTML = '<p></p>';

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok && res.status !== 204) throw new Error(`Request failed: ${res.status}`);
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

function formatDateline(value: string) {
  const date = new Date(value);
  const datePart = date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timePart = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${datePart}   ${timePart}`;
}

const MARKDOWN_PATTERN =
  /(^|\n)\s{0,3}#{1,6}\s+\S|(^|\n)\s{0,3}[-*+]\s+\S|(^|\n)\s{0,3}\d+\.\s+\S|\*\*[^*\n]+\*\*|__[^_\n]+__|(^|\n)\s{0,3}\|.+\|\s*(\n|$)/;
const RICH_HTML_PATTERN = /<(table|strong|b|em|i|ul|ol|li|h[1-6]|code|pre)\b/i;

function findLocation(notebooks: NotebookData[], pageId: string) {
  for (const notebook of notebooks) {
    for (const section of notebook.sections) {
      const page = section.pages.find((p) => p.id === pageId);
      if (page) return { notebook, section, page };
    }
  }
  return null;
}

export default function OneNoteWorkspace() {
  const [notebooks, setNotebooks] = useState<NotebookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<PageDetail | null>(null);
  const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchTimeout = useRef<number | null>(null);
  const saveTimeout = useRef<number | null>(null);

  const refreshNotebooks = useCallback(async () => {
    const data = await api<NotebookData[]>('/api/notebooks');
    setNotebooks(data);
    return data;
  }, []);

  useEffect(() => {
    (async () => {
      let data = await refreshNotebooks();
      if (data.length === 0) {
        const notebook = await api<{ id: string; name: string }>('/api/notebooks', {
          method: 'POST',
          body: JSON.stringify({ name: 'My Notebook' }),
        });
        const section = await api<{ id: string; name: string }>('/api/sections', {
          method: 'POST',
          body: JSON.stringify({ name: 'General', notebookId: notebook.id }),
        });
        const page = await api<PageDetail>('/api/pages', {
          method: 'POST',
          body: JSON.stringify({ title: 'Welcome', sectionId: section.id }),
        });
        data = await refreshNotebooks();
        setExpandedNotebooks(new Set([notebook.id]));
        setExpandedSections(new Set([section.id]));
        setSelectedPageId(page.id);
        setCurrentPage(page);
      } else {
        setExpandedNotebooks(new Set([data[0].id]));
        setExpandedSections(new Set(data[0].sections[0] ? [data[0].sections[0].id] : []));

        const firstPage = data.flatMap((nb) => nb.sections).flatMap((s) => s.pages)[0];
        if (firstPage) setSelectedPageId(firstPage.id);
      }
      setLoading(false);
    })();
  }, [refreshNotebooks]);

  useEffect(() => {
    if (!selectedPageId) {
      setCurrentPage(null);
      return;
    }
    api<PageDetail>(`/api/pages/${selectedPageId}`).then(setCurrentPage);
  }, [selectedPageId]);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Highlight.configure({ multicolor: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Start writing…' }),
      Image.configure({ inline: false, allowBase64: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: currentPage?.contentHtml ?? EMPTY_HTML,
    immediatelyRender: true,
    editorProps: {
      attributes: { class: styles.editorContent },
      handlePaste: (_view, event) => {
        const clipboardData = event.clipboardData;
        const text = clipboardData?.getData('text/plain');
        if (!text || !MARKDOWN_PATTERN.test(text)) return false;

        const html = clipboardData?.getData('text/html');
        if (html && RICH_HTML_PATTERN.test(html)) return false;

        const parsedHtml = marked.parse(text, { async: false }) as string;
        editor?.chain().focus().insertContent(parsedHtml, { parseOptions: { preserveWhitespace: false } }).run();
        event.preventDefault();
        return true;
      },
    },
    onUpdate: ({ editor: instance }) => {
      if (!currentPage) return;
      queueSave({ contentHtml: instance.getHTML() });
    },
  });

  useEffect(() => {
    if (!editor) return;
    const html = editor.getHTML();
    const next = currentPage?.contentHtml ?? EMPTY_HTML;
    if (html !== next) editor.commands.setContent(next, { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage?.id, editor]);

  const uploadImage = useCallback(
    async (file: File) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(file.type)) {
        alert('Only JPG, PNG, WEBP, and GIF images are supported.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Image must be under 10 MB.');
        return;
      }
      setImageUploading(true);
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/uploads', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Upload failed');
        const data: { files: { url: string }[] } = await res.json();
        const url = data.files[0]?.url;
        if (url && editor) editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      } catch {
        alert('Image upload failed. Please try again.');
      } finally {
        setImageUploading(false);
      }
    },
    [editor],
  );

  const handleImageDrop = useCallback(
    (event: React.DragEvent) => {
      const files = Array.from(event.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
      if (!files.length) return;
      event.preventDefault();
      files.forEach(uploadImage);
    },
    [uploadImage],
  );

  const queueSave = useCallback(
    (patch: { title?: string; contentHtml?: string }) => {
      if (!currentPage) return;
      const pageId = currentPage.id;
      setCurrentPage((prev) => (prev ? { ...prev, ...patch } : prev));
      setNotebooks((prev) =>
        prev.map((notebook) => ({
          ...notebook,
          sections: notebook.sections.map((section) => ({
            ...section,
            pages: section.pages.map((page) =>
              page.id === pageId && patch.title !== undefined ? { ...page, title: patch.title } : page,
            ),
          })),
        })),
      );

      setSaveState('saving');
      if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
      saveTimeout.current = window.setTimeout(async () => {
        const updated = await api<PageDetail>(`/api/pages/${pageId}`, { method: 'PATCH', body: JSON.stringify(patch) });
        setSaveState('saved');
        setNotebooks((prev) =>
          prev.map((notebook) => ({
            ...notebook,
            sections: notebook.sections.map((section) => ({
              ...section,
              pages: section.pages.map((page) => (page.id === pageId ? { ...page, updatedAt: updated.updatedAt } : page)),
            })),
          })),
        );
      }, 500);
    },
    [currentPage],
  );

  const onTitleChange = useCallback(
    (value: string) => {
      queueSave({ title: value });
    },
    [queueSave],
  );

  const toggleNotebook = useCallback((id: string) => {
    setExpandedNotebooks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSection = useCallback((id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const createNotebook = useCallback(async () => {
    const name = window.prompt('New notebook name', 'Untitled notebook')?.trim();
    if (!name) return;
    const notebook = await api<{ id: string }>('/api/notebooks', { method: 'POST', body: JSON.stringify({ name }) });
    await refreshNotebooks();
    setExpandedNotebooks((prev) => new Set(prev).add(notebook.id));
  }, [refreshNotebooks]);

  const renameNotebook = useCallback(
    async (notebook: NotebookData) => {
      const name = window.prompt('Rename notebook', notebook.name)?.trim();
      if (!name || name === notebook.name) return;
      await api(`/api/notebooks/${notebook.id}`, { method: 'PATCH', body: JSON.stringify({ name }) });
      await refreshNotebooks();
    },
    [refreshNotebooks],
  );

  const deleteNotebook = useCallback(
    async (notebook: NotebookData) => {
      const confirmed = window.confirm(`Delete notebook "${notebook.name}" and everything inside it?`);
      if (!confirmed) return;
      await api(`/api/notebooks/${notebook.id}`, { method: 'DELETE' });
      if (currentPage && notebook.sections.some((s) => s.pages.some((p) => p.id === currentPage.id))) {
        setSelectedPageId(null);
      }
      await refreshNotebooks();
    },
    [currentPage, refreshNotebooks],
  );

  const createSection = useCallback(
    async (notebookId: string) => {
      const name = window.prompt('New section name', 'Untitled section')?.trim();
      if (!name) return;
      const section = await api<{ id: string }>('/api/sections', { method: 'POST', body: JSON.stringify({ name, notebookId }) });
      await refreshNotebooks();
      setExpandedSections((prev) => new Set(prev).add(section.id));
    },
    [refreshNotebooks],
  );

  const renameSection = useCallback(
    async (section: SectionData) => {
      const name = window.prompt('Rename section', section.name)?.trim();
      if (!name || name === section.name) return;
      await api(`/api/sections/${section.id}`, { method: 'PATCH', body: JSON.stringify({ name }) });
      await refreshNotebooks();
    },
    [refreshNotebooks],
  );

  const deleteSection = useCallback(
    async (section: SectionData) => {
      const confirmed = window.confirm(`Delete section "${section.name}" and its pages?`);
      if (!confirmed) return;
      await api(`/api/sections/${section.id}`, { method: 'DELETE' });
      if (currentPage && section.pages.some((p) => p.id === currentPage.id)) setSelectedPageId(null);
      await refreshNotebooks();
    },
    [currentPage, refreshNotebooks],
  );

  const createPage = useCallback(
    async (sectionId: string) => {
      const page = await api<PageDetail>('/api/pages', { method: 'POST', body: JSON.stringify({ title: 'Untitled page', sectionId }) });
      await refreshNotebooks();
      setSelectedPageId(page.id);
      setCurrentPage(page);
      setSidebarOpen(false);
    },
    [refreshNotebooks],
  );

  const deletePage = useCallback(
    async (page: PageSummary) => {
      const confirmed = window.confirm(`Delete page "${page.title || 'Untitled page'}"?`);
      if (!confirmed) return;
      await api(`/api/pages/${page.id}`, { method: 'DELETE' });
      if (selectedPageId === page.id) setSelectedPageId(null);
      await refreshNotebooks();
    },
    [refreshNotebooks, selectedPageId],
  );

  useEffect(() => {
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    const query = search.trim();
    if (!query) {
      setSearchResults(null);
      return;
    }
    searchTimeout.current = window.setTimeout(async () => {
      const results = await api<SearchResult[]>(`/api/pages?q=${encodeURIComponent(query)}`);
      setSearchResults(results);
    }, 250);
  }, [search]);

  const openSearchResult = useCallback(
    (result: SearchResult) => {
      const location = findLocation(notebooks, result.id);
      if (location) {
        setExpandedNotebooks((prev) => new Set(prev).add(location.notebook.id));
        setExpandedSections((prev) => new Set(prev).add(location.section.id));
      }
      setSelectedPageId(result.id);
      setSearch('');
      setSearchResults(null);
      setSidebarOpen(false);
    },
    [notebooks],
  );

  const breadcrumb = useMemo(() => {
    if (!currentPage) return null;
    return findLocation(notebooks, currentPage.id);
  }, [currentPage, notebooks]);

  // The notebook/section the "Add section" / "Add page" toolbar buttons act on —
  // whichever the current page belongs to, falling back to the first expanded one.
  const currentNotebookId =
    breadcrumb?.notebook.id ?? notebooks.find((nb) => expandedNotebooks.has(nb.id))?.id ?? notebooks[0]?.id;
  const currentSectionId =
    breadcrumb?.section.id ??
    notebooks
      .flatMap((nb) => nb.sections)
      .find((section) => expandedSections.has(section.id))?.id;

  return (
    <div className={styles.page}>
      <button className={styles.mobileMenuButton} onClick={() => setSidebarOpen(true)} aria-label="Open notebooks">
        <Menu size={16} />
      </button>

      {sidebarOpen ? <button className={styles.backdrop} aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} /> : null}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Book size={16} />
          <h1 className={styles.sidebarTitle}>Ram — Notes</h1>
        </div>

        <div className={styles.sidebarActions}>
          <button
            type="button"
            className={styles.sidebarActionButton}
            onClick={() => createSection(currentNotebookId ?? notebooks[0]?.id)}
            disabled={!currentNotebookId && !notebooks[0]}
          >
            <Plus size={14} /> Add section
          </button>
          <button
            type="button"
            className={styles.sidebarActionButton}
            onClick={() => createPage(currentSectionId ?? '')}
            disabled={!currentSectionId}
          >
            <Plus size={14} /> Add page
          </button>
        </div>

        <label className={styles.searchBox}>
          <Search size={14} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search all pages" />
        </label>

        <div className={styles.tree}>
          {searchResults ? (
            <div className={styles.searchResults}>
              {searchResults.length ? (
                searchResults.map((result) => (
                  <button key={result.id} type="button" className={styles.searchResultItem} onClick={() => openSearchResult(result)}>
                    <div className={styles.searchResultTitle}>{result.title || 'Untitled page'}</div>
                    <div className={styles.searchResultPath}>
                      {result.section.notebook.name} / {result.section.name}
                    </div>
                  </button>
                ))
              ) : (
                <div className={styles.emptyTreeState}>No matching pages.</div>
              )}
            </div>
          ) : loading ? (
            <div className={styles.emptyTreeState}>Loading…</div>
          ) : (
            notebooks.map((notebook) => (
              <div key={notebook.id} className={styles.notebookGroup}>
                <div className={styles.treeRow}>
                  <button type="button" className={styles.treeRowMain} onClick={() => toggleNotebook(notebook.id)}>
                    {expandedNotebooks.has(notebook.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <Book size={14} />
                    <span className={styles.treeLabel}>{notebook.name}</span>
                  </button>
                  <button type="button" className={styles.treeIconButton} title="Add section" onClick={() => createSection(notebook.id)}>
                    <Plus size={13} />
                  </button>
                  <TreeMenu onRename={() => renameNotebook(notebook)} onDelete={() => deleteNotebook(notebook)} />
                </div>

                {expandedNotebooks.has(notebook.id) &&
                  notebook.sections.map((section) => (
                    <div key={section.id} className={styles.sectionGroup}>
                      <div className={`${styles.treeRow} ${styles.sectionRow}`}>
                        <button type="button" className={styles.treeRowMain} onClick={() => toggleSection(section.id)}>
                          {expandedSections.has(section.id) ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                          <span className={styles.sectionDot} />
                          <span className={styles.treeLabel}>{section.name}</span>
                        </button>
                        <button type="button" className={styles.treeIconButton} title="Add page" onClick={() => createPage(section.id)}>
                          <Plus size={13} />
                        </button>
                        <TreeMenu onRename={() => renameSection(section)} onDelete={() => deleteSection(section)} />
                      </div>

                      {expandedSections.has(section.id) &&
                        section.pages.map((page) => (
                          <div key={page.id} className={`${styles.treeRow} ${styles.pageRow}`}>
                            <button
                              type="button"
                              className={`${styles.treeRowMain} ${selectedPageId === page.id ? styles.pageRowActive : ''}`}
                              onClick={() => {
                                setSelectedPageId(page.id);
                                setSidebarOpen(false);
                              }}
                            >
                              <FileText size={13} />
                              <span className={styles.treeLabel}>{page.title || 'Untitled page'}</span>
                            </button>
                            <button type="button" className={styles.treeIconButton} title="Delete page" onClick={() => deletePage(page)}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                    </div>
                  ))}
              </div>
            ))
          )}
        </div>

        <button type="button" className={styles.newNotebookButton} onClick={createNotebook}>
          <Plus size={15} /> New notebook
        </button>
      </aside>

      <main className={styles.editorPanel}>
        {currentPage ? (
          <div className={styles.editorShell}>
            <div className={styles.editorHeader}>
              {breadcrumb ? (
                <div className={styles.breadcrumb}>
                  {breadcrumb.notebook.name} / {breadcrumb.section.name}
                </div>
              ) : null}
              <span className={styles.saveStatus}>{saveState === 'saving' ? 'Saving…' : 'Saved'}</span>
            </div>

            <input
              className={styles.titleInput}
              value={currentPage.title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Untitled page"
            />
            <div className={styles.dateline}>{formatDateline(currentPage.updatedAt)}</div>

            <div className={styles.toolbar}>
              <button className={styles.toolButton} onClick={() => editor?.chain().focus().toggleBold().run()} aria-label="Bold" title="Bold">
                <Bold size={14} />
              </button>
              <button className={styles.toolButton} onClick={() => editor?.chain().focus().toggleItalic().run()} aria-label="Italic" title="Italic">
                <Italic size={14} />
              </button>
              <button className={styles.toolButton} onClick={() => editor?.chain().focus().toggleUnderline().run()} aria-label="Underline" title="Underline">
                <UnderlineIcon size={14} />
              </button>
              <button className={styles.toolButton} onClick={() => editor?.chain().focus().toggleHighlight().run()} aria-label="Highlight" title="Highlight">
                <Highlighter size={14} />
              </button>
              <select
                className={styles.headingSelect}
                defaultValue="0"
                onChange={(event) => {
                  const level = Number(event.target.value);
                  if (level === 0) editor?.chain().focus().setParagraph().run();
                  else editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
                }}
                aria-label="Heading level"
              >
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
              <button className={styles.toolButton} onClick={() => editor?.chain().focus().undo().run()} aria-label="Undo" title="Undo">
                <Undo2 size={14} />
              </button>
              <button className={styles.toolButton} onClick={() => editor?.chain().focus().redo().run()} aria-label="Redo" title="Redo">
                <Redo2 size={14} />
              </button>
              <div className={styles.toolbarDivider} />
              <button
                className={`${styles.toolButton} ${imageUploading ? styles.toolButtonDisabled : ''}`}
                onClick={() => imageInputRef.current?.click()}
                aria-label="Insert image"
                title="Insert image (JPG, PNG, WEBP, GIF — max 10 MB)"
                disabled={imageUploading}
              >
                {imageUploading ? <span className={styles.toolSpinner} /> : <ImageIcon size={14} />}
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className={styles.hiddenInput}
                onChange={(e) => {
                  Array.from(e.target.files ?? []).forEach(uploadImage);
                  e.target.value = '';
                }}
              />
            </div>

            <div
              className={styles.editorScroll}
              onDrop={handleImageDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <EditorContent editor={editor} />
            </div>
          </div>
        ) : (
          <div className={styles.emptyPageState}>
            <FileText size={26} />
            <h2>No page selected</h2>
            <p>Choose a page from the sidebar, or create one inside a section.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function TreeMenu({ onRename, onDelete }: { onRename: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className={styles.treeMenuWrap}>
      <button type="button" className={styles.treeIconButton} aria-label="More actions" onClick={() => setOpen((v) => !v)}>
        <MoreHorizontal size={13} />
      </button>
      {open ? (
        <div className={styles.treeMenu}>
          <button
            type="button"
            onClick={() => {
              onRename();
              setOpen(false);
            }}
          >
            Rename
          </button>
          <button
            type="button"
            className={styles.treeMenuDanger}
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}
