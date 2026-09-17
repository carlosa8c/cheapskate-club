import { publicMember } from '@/lib/public-member';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const rawHandle = (await params).handle;
  const handle = rawHandle.replace(/^@/, '').toLowerCase();
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const member = await publicMember(handle);
    if (!member) {
      return Response.json({ error: 'Public profile not found' }, { status: 404, headers });
    }
    return Response.json(member, { status: 200, headers });
  } catch {
    return Response.json(
      { error: 'Profile unavailable. Please try again later.' },
      { status: 503, headers }
    );
  }
}
