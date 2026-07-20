import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

import { profile } from '@/content/site';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const message = typeof body?.message === 'string' ? body.message.trim() : '';

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Please fill in all fields.' }, { status: 400 });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT ?? 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM ?? smtpUser;
    const recipient = process.env.CONTACT_TO_EMAIL ?? profile.email;

    if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
      // Development fallback: save message to local outbox so devs can test without SMTP
      if (process.env.NODE_ENV !== 'production') {
        try {
          const outDir = path.join(process.cwd(), 'outbox');
          await fs.mkdir(outDir, { recursive: true });
          const filename = `message-${Date.now()}.json`;
          const filepath = path.join(outDir, filename);
          const payload = {
            to: recipient,
            from: smtpFrom || null,
            name,
            email,
            message,
            savedAt: new Date().toISOString(),
          };
          await fs.writeFile(filepath, JSON.stringify(payload, null, 2), 'utf8');
          // Return success so the UI shows the message as sent during development
          return NextResponse.json({ ok: true, savedTo: filepath });
        } catch {
          return NextResponse.json({ error: 'Failed to save message to outbox.' }, { status: 500 });
        }
      }

      return NextResponse.json(
        {
          error:
            'Email service is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.',
        },
        { status: 500 },
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: recipient,
      replyTo: email,
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message.replaceAll(
        '\n',
        '<br />',
      )}</p>`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send message.' },
      { status: 500 },
    );
  }
}