import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { q, tag } = req.query;
    let where = {};
    if (q) {
      where = {
        OR: [{ title: { contains: String(q), mode: 'insensitive' } }, { content: { contains: String(q), mode: 'insensitive' } }],
      };
    }
    const notes = await prisma.note.findMany({
      where,
      include: { attachments: true, tags: true },
      orderBy: { updatedAt: 'desc' },
    });
    return res.json(notes);
  }

  if (req.method === 'POST') {
    const { title, content, dateTime, tags = [], pinned = false, favorite = false, attachments = [] } = req.body;

    // upsert tags
    const tagRecords = [];
    for (const t of tags) {
      const tt = await prisma.tag.upsert({ where: { name: t }, update: {}, create: { name: t } });
      tagRecords.push({ id: tt.id });
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        dateTime: dateTime ? new Date(dateTime) : undefined,
        pinned,
        favorite,
        tags: { connect: tagRecords },
        attachments: { create: attachments.map((a: any) => ({ filename: a.filename, mime: a.mime, url: a.url })) },
      },
      include: { attachments: true, tags: true },
    });

    res.status(201).json(note);
  }

  res.status(405).end();
}
