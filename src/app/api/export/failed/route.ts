import { NextResponse } from 'next/server';
import { queueManager } from '@/core/QueueManager';

export async function GET() {
  try {
    const queueState = queueManager.getQueueState();
    
    // Filter for failed queue items
    const failedUrls = queueState.items
      .filter(item => item.status === 'failed')
      .map(item => item.url);

    const txtContent = failedUrls.join('\n');

    return new Response(txtContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="failed_urls.txt"',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error: any) {
    console.error('API export/failed Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
