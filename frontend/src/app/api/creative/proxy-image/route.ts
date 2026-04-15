import { NextResponse } from 'next/server';

// Restrict proxy to known Manus domains to prevent open-redirect / SSRF
const ALLOWED_HOSTNAMES = ['manus.im', 'manus.ai'];

function isAllowedHost(hostname: string): boolean {
  return ALLOWED_HOSTNAMES.some(
    (h) => hostname === h || hostname.endsWith(`.${h}`)
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  if (!isAllowedHost(parsed.hostname)) {
    return NextResponse.json({ error: 'URL host not allowed' }, { status: 403 });
  }

  const upstream = await fetch(imageUrl);
  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Upstream fetch failed: ${upstream.status}` },
      { status: 502 }
    );
  }

  const contentType = upstream.headers.get('content-type') ?? 'image/png';
  const buffer = await upstream.arrayBuffer();
  const filename = `creative-${Date.now()}.png`;

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
