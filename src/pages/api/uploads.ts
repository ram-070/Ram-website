import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File as FormidableFile } from 'formidable';
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
  if (req.method === 'POST') {
    const form = new IncomingForm({ multiples: true, uploadDir, keepExtensions: true });

    form.parse(req, (err, fields, files) => {
      if (err) return res.status(500).json({ error: String(err) });
      const fileArray: { url: string; filename: string; mime: string }[] = [];
      const entries: FormidableFile[] = Array.isArray(files.file) ? files.file : files.file ? [files.file] : [];
      
      for (const f of entries) {
        if (!f) continue;
        const fname = path.basename(f.filepath || 'file');
        fileArray.push({ url: `/uploads/${fname}`, filename: f.originalFilename || fname, mime: f.mimetype || 'application/octet-stream' });
      }
      res.status(200).json({ files: fileArray });
    });
    return;
  }

  // Support deletion of uploaded files via DELETE /api/uploads?filename=name.pdf
  if (req.method === 'DELETE') {
    try {
      const { filename } = req.query;
      if (!filename || typeof filename !== 'string') return res.status(400).json({ error: 'filename required' });
      const target = path.join(uploadDir, path.basename(filename));
      if (!fs.existsSync(target)) return res.status(404).json({ error: 'file not found' });
      await fs.promises.unlink(target);
      return res.status(204).end();
    } catch (err) {
      return res.status(500).json({ error: String(err) });
    }
  }

  return res.status(405).end();
}
