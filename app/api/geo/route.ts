import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Vercel injects x-vercel-ip-country on all deployments (ISO 3166-1 alpha-2)
  // Cloudflare provides cf-ipcountry as fallback
  const country =
    request.headers.get('x-vercel-ip-country') ??
    request.headers.get('cf-ipcountry') ??
    null;

  return NextResponse.json({ country });
}
