import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {ImageResponse} from 'next/og';
import {createElement} from 'react';
import {publicMember} from '@/lib/public-member';
import {leaderboard} from '@/lib/leaderboard';
import {ShareCard} from '@/lib/share-card';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, {params}: {params: Promise<{handle: string}>}){
 const handle = (await params).handle.toLowerCase();
 const headers = {'Cache-Control': 'private, no-store'};
 try{
  const member = await publicMember(handle);
  if(!member) return new Response('Public profile not found', {status: 404, headers});
  const board = await leaderboard('zero_cost', 'all');
  const champion = board.state === 'ready' && board.entries[0]?.handle === handle;
  
  const urlObj = new URL(request.url);
  const square = urlObj.searchParams.get('download') === '1';
  const themeParam = urlObj.searchParams.get('theme');
  const theme: 'light' | 'dark' = themeParam === 'light' ? 'light' : 'dark';

  const sans = await readFile(join(process.cwd(), 'src/assets/club-sans.woff'));
  const serif = await readFile(join(process.cwd(), 'src/assets/club-serif.woff'));
  const date = new Date().toISOString().slice(0, 10) + ' UTC';

  return new ImageResponse(
    createElement(ShareCard, {member, champion, square, date, theme}),
    {
      fonts: [
        {name: 'Club Sans', data: sans.buffer.slice(sans.byteOffset, sans.byteOffset + sans.byteLength) as ArrayBuffer, weight: 400, style: 'normal'},
        {name: 'Club Serif', data: serif.buffer.slice(serif.byteOffset, serif.byteOffset + serif.byteLength) as ArrayBuffer, weight: 400, style: 'normal'}
      ],
      width: square ? 1080 : 1200,
      height: square ? 1080 : 630,
      headers: {
        ...headers,
        ...(square ? {'Content-Disposition': `attachment; filename="cheapskate-${handle}-${theme}.png"`} : {})
      }
    }
  );
 } catch {
  return new Response('Card unavailable. Please try again.', {status: 503, headers});
 }
}
