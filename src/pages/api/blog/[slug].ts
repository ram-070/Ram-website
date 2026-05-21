import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  if (req.method === 'GET') {
    const post = await prisma.blogPost.findUnique({ where: { slug: String(slug) } });
    if (!post) return res.status(404).json({ error: 'Not found' });
    return res.json(post);
  }

  if (req.method === 'PUT') {
    const { title, content, coverImage, tags = [], author, published = false } = req.body;
    const post = await prisma.blogPost.update({ where: { slug: String(slug) }, data: { title, content, coverImage, author, published, publishedAt: published ? new Date() : null } });
    return res.json(post);
  }

  if (req.method === 'DELETE') {
    await prisma.blogPost.delete({ where: { slug: String(slug) } });
    return res.status(204).end();
  }

  res.status(405).end();
}
