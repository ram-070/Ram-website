import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = new IncomingForm({ multiples: true, uploadDir, keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: String(err) });
    const fileArray = [];
    const entries = Array.isArray(files.file) ? files.file : files.file ? [files.file] : [];
    for (const f of entries) {
      if (!f) continue;
      const fp = (f as any).filepath || (f as any).path || 'file';
      const fname = path.basename(fp);
      fileArray.push({ url: `/uploads/${fname}`, filename: (f as any).originalFilename || fname, mime: (f as any).mimetype || (f as any).type || 'application/octet-stream' });
    }
    res.status(200).json({ files: fileArray });
  });
}
