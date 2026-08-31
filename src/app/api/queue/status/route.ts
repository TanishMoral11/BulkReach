import { NextResponse } from 'next/server';
import { queueManager } from '@/core/QueueManager';
import { FileService } from '@/core/FileService';

export async function GET() {
  try {
    const queueState = queueManager.getQueueState();
    const stats = queueManager.getStats();
    const results = await FileService.loadResults();

    const currentItem = queueState.items[queueState.currentIndex];
    const currentUrl = currentItem && currentItem.status === 'processing' ? currentItem.url : null;

    return NextResponse.json({
      success: true,
      queueStatus: queueState.status,
      stats,
      currentUrl,
      results
    });
  } catch (error: any) {
    console.error('API queue/status Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
