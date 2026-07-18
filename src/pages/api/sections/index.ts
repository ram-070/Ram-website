import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, notebookId } = req.body ?? {};
    if (!name || !notebookId) return res.status(400).json({ error: 'name and notebookId are required' });
    const section = await prisma.section.create({
      data: { name, notebookId },
      include: { pages: { select: { id: true, title: true, updatedAt: true } } },
    });
    return res.status(201).json(section);
  }

  res.status(405).end();
}
