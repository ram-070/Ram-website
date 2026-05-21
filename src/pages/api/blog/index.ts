import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import slugify from 'slugify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const posts = await prisma.blogPost.findMany({ orderBy: { publishedAt: 'desc' } });
    return res.json(posts);
  }

  if (req.method === 'POST') {
    const { title, content, coverImage, tags = [], author, published = false } = req.body;
    const slug = slugify(title || 'post', { lower: true, strict: true }) + '-' + Math.random().toString(36).slice(2, 8);

    const tagRecords = [];
    for (const t of tags) {
      const tt = await prisma.tag.upsert({ where: { name: t }, update: {}, create: { name: t } });
      tagRecords.push({ id: tt.id });
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        content,
        coverImage,
        author,
        slug,
        published,
        publishedAt: published ? new Date() : undefined,
        tags: { connect: tagRecords },
      },
    });

    return res.status(201).json(post);
  }

  res.status(405).end();
}
