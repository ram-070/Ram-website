'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Upload, X } from 'lucide-react';

const BlogEditor = ({ post = null, onSave = null }: any) => {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || '');
  const [author, setAuthor] = useState(post?.author || '');
  const [tags, setTags] = useState((post?.tags || []).map((t: any) => t.name));
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState(post?.coverImage || '');
  const [published, setPublished] = useState(post?.published || false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  const editor = useEditor({
    extensions: [StarterKit, Image, Link.configure({ openOnClick: false })],
    content: post?.content || '<p>Start writing your blog post...</p>',
  });

  // Autosave every 15 seconds
  useEffect(() => {
    if (!editor || !title) return;
    const timer = setTimeout(async () => {
      setAutoSaveStatus('Saving...');
      const content = editor.getHTML();
      try {
        if (post?.slug) {
          await fetch(`/api/blog/${post.slug}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, author, tags, coverImage, published }),
          });
        }
        setAutoSaveStatus('Saved ✓');
        setTimeout(() => setAutoSaveStatus(''), 3000);
      } catch (e) {
        setAutoSaveStatus('Save failed');
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [editor, title, author, tags, coverImage, published, post?.slug]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput)) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t: string) => t !== tag));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const res = await fetch('/api/uploads', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.files && data.files[0]) {
        setCoverImage(data.files[0].url);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
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
      {/* Header */}
      <div className="mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Blog post title..."
          className="text-4xl font-bold bg-transparent outline-none w-full mb-2"
        />
        <p className="text-sm text-muted">{autoSaveStatus}</p>
      </div>

      {/* Cover Image */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Cover Image</h3>
        {coverImage ? (
          <div className="relative mb-2">
            <img src={coverImage} alt="cover" className="w-full h-64 object-cover rounded" />
            <button
              onClick={() => setCoverImage('')}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
            >
              <X size={18} />
            </button>
          </div>
        ) : null}
        <label className="flex items-center gap-2 btn-gradient px-4 py-2 rounded text-white cursor-pointer inline-block">
          <Upload size={16} /> Upload Cover Image
          <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
        </label>
      </div>

      {/* Metadata */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Author</label>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Publish Status</label>
          <select
            value={published ? 'published' : 'draft'}
            onChange={(e) => setPublished(e.target.value === 'published')}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Tags</h3>
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
      <div className="flex gap-2 mb-4 border-b pb-2 flex-wrap">
        <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          H1
        </button>
        <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          H2
        </button>
        <button onClick={() => editor?.chain().focus().toggleBold().run()} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          <strong>B</strong>
        </button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          <em>I</em>
        </button>
        <button onClick={() => editor?.chain().focus().toggleCode().run()} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 font-mono">
          {'<>'}
        </button>
        <button onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs">
          Code Block
        </button>
        <button onClick={addImage} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          🖼️
        </button>
        <button onClick={addLink} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          🔗
        </button>
      </div>

      {/* Editor */}
      <div className="card p-6 mb-6 min-h-96 prose prose-lg max-w-none dark:prose-invert">
        <EditorContent editor={editor} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={async () => {
            const content = editor?.getHTML();
            if (post?.slug) {
              await fetch(`/api/blog/${post.slug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, author, tags, coverImage, published: true }),
              });
            } else {
              await fetch('/api/blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, author, tags, coverImage, published: true }),
              });
            }
            router.push('/blog');
          }}
          className="btn-gradient px-6 py-2 rounded text-white"
        >
          Publish
        </button>
        <button
          onClick={async () => {
            const content = editor?.getHTML();
            if (!post?.slug) {
              await fetch('/api/blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, author, tags, coverImage, published: false }),
              });
            }
            router.push('/blog');
          }}
          className="px-6 py-2 rounded border hover:bg-gray-100"
        >
          Save as Draft
        </button>
      </div>
    </div>
  );
};

export default BlogEditor;
