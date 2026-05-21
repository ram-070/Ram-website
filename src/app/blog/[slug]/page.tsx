'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BlogEditor from '../../../components/BlogEditor';
import { ArrowLeft, Trash2, Share2, Calendar, User, Tag } from 'lucide-react';

interface BlogTag {
  id: string;
  name: string;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  coverImage?: string | null;
  author?: string | null;
  publishedAt?: string | null;
  tags?: BlogTag[];
}

const BlogDetail = () => {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blog/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this post?')) {
      await fetch(`/api/blog/${slug}`, { method: 'DELETE' });
      router.push('/blog');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (isEditing && post) {
    return (
      <>
        <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 m-6 rounded border hover:bg-gray-100">
          <ArrowLeft size={18} /> Back
        </button>
        <BlogEditor post={post} />
      </>
    );
  }

  if (!post) return <div className="p-6">Post not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2 rounded border hover:bg-gray-100">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}
            className="flex items-center gap-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            <Share2 size={16} /> Share
          </button>
          <button onClick={() => setIsEditing(true)} className="px-4 py-2 rounded bg-accent text-white hover:opacity-90">
            Edit
          </button>
          <button onClick={handleDelete} className="px-4 py-2 rounded bg-red-500 text-white hover:opacity-90">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Post Header */}
      <article>
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted mb-6">
            {post.author && (
              <span className="flex items-center gap-2">
                <User size={16} /> {post.author}
              </span>
            )}
            {post.publishedAt && (
              <span className="flex items-center gap-2">
                <Calendar size={16} /> {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span key={tag.id} className="inline-flex items-center gap-1 bg-accent text-white text-sm px-3 py-1 rounded-full">
                  <Tag size={14} /> {tag.name}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-8 -mx-6">
            <img src={post.coverImage} alt={post.title} className="w-screen md:w-full md:rounded-lg h-96 object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert mb-12" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>

      {/* Divider */}
      <hr className="my-12" />

      {/* Author Bio */}
      {post.author && (
        <div className="card p-6 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">About the author</h3>
          <p className="text-gray-700">{post.author}</p>
        </div>
      )}
    </div>
  );
};

export default BlogDetail;
