import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'q is required' });

    const pages = await prisma.page.findMany({
      where: {
        OR: [{ title: { contains: String(q) } }, { contentHtml: { contains: String(q) } }],
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        sectionId: true,
        section: { select: { name: true, notebookId: true, notebook: { select: { name: true } } } },
      },
    });
    return res.json(pages);
  }

  if (req.method === 'POST') {
    const { title = 'Untitled page', sectionId } = req.body ?? {};
    if (!sectionId) return res.status(400).json({ error: 'sectionId is required' });
    const page = await prisma.page.create({ data: { title, sectionId } });
    return res.status(201).json(page);
  }

  res.status(405).end();
}
