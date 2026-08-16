import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const page = await prisma.page.findUnique({ where: { id: String(id) } });
    if (!page) return res.status(404).json({ error: 'Not found' });
    return res.json(page);
  }

  if (req.method === 'PATCH') {
    const { title, contentHtml, canvasData } = req.body ?? {};
    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (contentHtml !== undefined) data.contentHtml = contentHtml;
    if (canvasData !== undefined) data.canvasData = canvasData;

    try {
      const page = await prisma.page.update({ where: { id: String(id) }, data });
      return res.json(page);
    } catch {
      return res.status(404).json({ error: 'Not found' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.page.delete({ where: { id: String(id) } });
      return res.status(204).end();
    } catch {
      return res.status(404).json({ error: 'Not found' });
    }
  }

  res.status(405).end();
}
