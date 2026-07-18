import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    const { name } = req.body ?? {};
    try {
      const section = await prisma.section.update({ where: { id: String(id) }, data: { name } });
      return res.json(section);
    } catch {
      return res.status(404).json({ error: 'Not found' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.section.delete({ where: { id: String(id) } });
      return res.status(204).end();
    } catch {
      return res.status(404).json({ error: 'Not found' });
    }
  }

  res.status(405).end();
}
