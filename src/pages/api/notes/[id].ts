import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method === 'GET') {
    const note = await prisma.note.findUnique({ where: { id: String(id) }, include: { attachments: true, tags: true } });
    if (!note) return res.status(404).json({ error: 'Not found' });
    return res.json(note);
  }

  if (req.method === 'PUT') {
    const { title, content, dateTime, tags = [], pinned = false, favorite = false, attachments = [] } = req.body;

    const tagRecords = [];
    for (const t of tags) {
      const tt = await prisma.tag.upsert({ where: { name: t }, update: {}, create: { name: t } });
      tagRecords.push({ id: tt.id });
    }

    const note = await prisma.note.update({
      where: { id: String(id) },
      data: {
        title,
        content,
        dateTime: dateTime ? new Date(dateTime) : undefined,
        pinned,
        favorite,
        tags: { set: tagRecords },
      },
      include: { attachments: true, tags: true },
    });

    // attachments management omitted for brevity

    return res.json(note);
  }

  if (req.method === 'DELETE') {
    await prisma.note.delete({ where: { id: String(id) } });
    return res.status(204).end();
  }

  res.status(405).end();
}
