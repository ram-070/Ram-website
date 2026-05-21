'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Upload, X, Star, Pin } from 'lucide-react';

const NoteEditor = ({ note = null, onSave = null }: any) => {
  const [title, setTitle] = useState(note?.title || '');
  const [tags, setTags] = useState((note?.tags || []).map((t: any) => t.name));
  const [tagInput, setTagInput] = useState('');
  const [attachments, setAttachments] = useState(note?.attachments || []);
  const [favorite, setFavorite] = useState(note?.favorite || false);
  const [pinned, setPinned] = useState(note?.pinned || false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Image, Link.configure({ openOnClick: false })],
    content: note?.content || '<p>Start typing...</p>',
  });

  // Autosave every 10 seconds
  useEffect(() => {
    if (!editor || !title) return;
    const timer = setTimeout(async () => {
      setIsSaving(true);
      setAutoSaveStatus('Saving...');
      const content = editor.getHTML();
      try {
        if (note?.id) {
          await fetch(`/api/notes/${note.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, tags, favorite, pinned, attachments }),
          });
        } else {
          await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, tags, favorite, pinned, attachments }),
          });
        }
        setAutoSaveStatus('Saved ✓');
        setTimeout(() => setAutoSaveStatus(''), 3000);
      } catch (e) {
        setAutoSaveStatus('Save failed');
      } finally {
        setIsSaving(false);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [editor, title, tags, favorite, pinned, attachments, note?.id]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput)) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t: string) => t !== tag));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }

    try {
      const res = await fetch('/api/uploads', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.files) {
        setAttachments([...attachments, ...data.files]);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleRemoveAttachment = (url: string) => {
    setAttachments(attachments.filter((a: any) => a.url !== url));
  };

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="text-3xl font-bold bg-transparent outline-none flex-1"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setPinned(!pinned)}
            className={`p-2 rounded ${pinned ? 'bg-accent text-white' : 'bg-gray-200'}`}
            title="Pin note"
          >
            <Pin size={18} />
          </button>
          <button
            onClick={() => setFavorite(!favorite)}
            className={`p-2 rounded ${favorite ? 'bg-yellow-400' : 'bg-gray-200'}`}
            title="Favorite"
          >
            <Star size={18} />
          </button>
        </div>
      </div>

      {autoSaveStatus && <p className="text-sm text-muted mb-2">{autoSaveStatus}</p>}

      {/* Tags */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag: string) => (
            <span key={tag} className="bg-accent text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {tag}
              <button onClick={() => handleRemoveTag(tag)} className="hover:opacity-70">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            placeholder="Add tag..."
            className="flex-1 px-3 py-2 border rounded"
          />
          <button onClick={handleAddTag} className="btn-gradient px-4 py-2 rounded text-white">
            Add Tag
          </button>
        </div>
      </div>

      {/* Editor Toolbar */}
      <div className="flex gap-2 mb-4 border-b pb-2">
        <button onClick={() => editor?.chain().focus().toggleBold().run()} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          <strong>B</strong>
        </button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          <em>I</em>
        </button>
        <button onClick={() => editor?.chain().focus().toggleCode().run()} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 font-mono">
          {'<>'}
        </button>
        <button onClick={addImage} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          🖼️
        </button>
        <button onClick={addLink} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          🔗
        </button>
      </div>

      {/* Editor */}
      <div className="card p-4 mb-4 min-h-96 prose prose-sm max-w-none dark:prose-invert">
        <EditorContent editor={editor} />
      </div>

      {/* Attachments */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Attachments ({attachments.length})</h3>
        <div className="flex gap-2 mb-2">
          <label className="flex items-center gap-2 btn-gradient px-4 py-2 rounded text-white cursor-pointer">
            <Upload size={16} /> Upload
            <input type="file" multiple onChange={handleUpload} className="hidden" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {attachments.map((att: any) => (
            <div key={att.url} className="flex items-center justify-between bg-gray-100 p-2 rounded">
              <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-accent truncate text-sm flex-1">
                {att.filename}
              </a>
              <button onClick={() => handleRemoveAttachment(att.url)} className="text-red-500 hover:opacity-70">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
