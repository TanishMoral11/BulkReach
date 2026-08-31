import { NextResponse } from 'next/server';
import { queueManager } from '@/core/QueueManager';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, urls } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: action' },
        { status: 400 }
      );
    }

    switch (action.toUpperCase()) {
      case 'START':
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Action START requires a non-empty array of urls' },
            { status: 400 }
          );
        }
        await queueManager.startQueue(urls);
        return NextResponse.json({
          success: true,
          message: 'Queue started successfully',
          status: 'RUNNING'
        });

      case 'PAUSE':
        await queueManager.pauseQueue();
        return NextResponse.json({
          success: true,
          message: 'Queue paused successfully',
          status: 'PAUSED'
        });

      case 'RESUME':
        await queueManager.resumeQueue();
        return NextResponse.json({
          success: true,
          message: 'Queue resumed successfully',
          status: 'RUNNING'
        });

      case 'STOP':
        await queueManager.stopQueue();
        return NextResponse.json({
          success: true,
          message: 'Queue stopped successfully',
          status: 'STOPPED'
        });

      default:
        return NextResponse.json(
          { success: false, error: `Invalid action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('API queue/control Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
