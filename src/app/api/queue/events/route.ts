import { NextRequest } from 'next/server';
import { EventHub } from '@/core/EventHub';

export async function GET(request: NextRequest) {
  const responseStream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Write SSE formatted messages directly to stream
      const onEvent = (message: string) => {
        try {
          controller.enqueue(encoder.encode(message));
        } catch (err) {
          console.error('SSE Events: Error pushing message to controller, closing subscription:', err);
          unsubscribe();
          try { controller.close(); } catch {}
        }
      };

      // Subscribe to central broadcaster
      const unsubscribe = EventHub.subscribe(onEvent);

      // Heartbeat message to prevent proxy/router timeouts
      controller.enqueue(encoder.encode(': heartbeat\n\n'));

      // If client closes connection or aborts, clean up subscription
      request.signal.addEventListener('abort', () => {
        unsubscribe();
        try { controller.close(); } catch {}
        console.log('SSE Events: Connection aborted by client.');
      });
    },
  });

  return new Response(responseStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
export const dynamic = 'force-dynamic';
