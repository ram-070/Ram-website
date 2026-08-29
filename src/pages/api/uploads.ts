import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File as FormidableFile } from 'formidable';
import { put, del } from '@vercel/blob';
import fs from 'fs';
import os from 'os';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const form = new IncomingForm({ multiples: true, uploadDir: os.tmpdir(), keepExtensions: true });

    form.parse(req, async (err, _fields, files) => {
      if (err) return res.status(500).json({ error: String(err) });
      const entries: FormidableFile[] = Array.isArray(files.file) ? files.file : files.file ? [files.file] : [];

      try {
        const fileArray = await Promise.all(
      
          entries.filter(Boolean).map(async (f) => {
            const buffer = await fs.promises.readFile(f.filepath);
            const blob = await put(f.originalFilename || f.newFilename, buffer, {
              access: 'public',
              contentType: f.mimetype || 'application/octet-stream',
            });
            await fs.promises.unlink(f.filepath).catch(() => {});
            return { url: blob.url, filename: f.originalFilename || f.newFilename, mime: f.mimetype || 'application/octet-stream' };
          })
        );
        res.status(200).json({ files: fileArray });
      } catch (uploadErr) {
        res.status(500).json({ error: String(uploadErr) });
      }
    });
    return;
  }

  // Support deletion of uploaded files via DELETE /api/uploads?url=<blob-url>
  if (req.method === 'DELETE') {
    try {
      const { url } = req.query;
      if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url required' });
      await del(url);
      return res.status(204).end();
    } catch (err) {
      return res.status(500).json({ error: String(err) });
    }
  }

  return res.status(405).end();
}
