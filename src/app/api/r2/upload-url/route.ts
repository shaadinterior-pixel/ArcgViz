import { NextResponse } from 'next/server';
import { createR2UploadTicket, getR2MaxUploadBytes } from '@/lib/storage/r2';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const fileName = String(body.fileName || '');
    const contentType = String(body.contentType || 'application/zip');
    const size = Number(body.size || 0);

    const ticket = await createR2UploadTicket({ fileName, contentType, size });
    return NextResponse.json(ticket);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create R2 upload URL.';
    const isConfigError = message.includes('not configured') || message.includes('Missing:');
    return NextResponse.json(
      {
        error: message,
        maxUploadBytes: isConfigError ? undefined : safeMaxUploadBytes(),
      },
      { status: isConfigError ? 500 : 400 },
    );
  }
}

function safeMaxUploadBytes(): number | undefined {
  try {
    return getR2MaxUploadBytes();
  } catch {
    return undefined;
  }
}
