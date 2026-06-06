import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return new Response('Missing URL', { status: 400 });
  }

  const response = await fetch(url);

  if (!response.ok) {
    return new Response('Failed to fetch image', {
      status: response.status,
    });
  }

  const buffer = await response.arrayBuffer();

  return new Response(buffer, {
    headers: {
      'Content-Type':
        response.headers.get('content-type') || 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}