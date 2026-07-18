import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const notebooks = await prisma.notebook.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        sections: {
          orderBy: { createdAt: 'asc' },
          include: {
            pages: {
              orderBy: { createdAt: 'asc' },
              select: { id: true, title: true, updatedAt: true },
            },
          },
        },
      },
    });
    return res.json(notebooks);
  }

  if (req.method === 'POST') {
    const { name } = req.body ?? {};
    if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name is required' });
    const notebook = await prisma.notebook.create({ data: { name } });
    return res.status(201).json(notebook);
  }

  res.status(405).end();
}
