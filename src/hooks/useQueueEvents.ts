import { useEffect, useState } from 'react';
import { QueueStatus, ProgressStats, Lead } from '../types';

export function useQueueEvents() {
  const [status, setStatus] = useState<QueueStatus>('IDLE');
  const [stats, setStats] = useState<ProgressStats>({
    total: 0,
    completed: 0,
    failed: 0,
    remaining: 0,
    successRate: 100,
    etaSeconds: null
  });
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [results, setResults] = useState<Lead[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);

  /**
   * Performs an HTTP fetch to grab the latest full state from the server.
   */
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/queue/status');
      if (!res.ok) throw new Error('Status request failed');
      const data = await res.json();
      
      if (data.success) {
        setStatus(data.queueStatus);
        setStats(data.stats);
        setCurrentUrl(data.currentUrl);
        setResults(data.results);
      }
    } catch (err) {
      console.error('useQueueEvents: Failed to fetch queue status:', err);
    }
  };

  useEffect(() => {
    // Fetch initial status on load
    fetchStatus();

    let eventSource: EventSource;

    const connectSSE = () => {
      eventSource = new EventSource('/api/queue/events');

      eventSource.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        setShowErrorDialog(false);
        console.log('useQueueEvents: SSE stream connected.');
      };

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          
          if (parsed.type === 'PROGRESS_UPDATE') {
            setStatus(parsed.payload.queueStatus);
            setStats(parsed.payload.stats);
            
            const items = parsed.payload.items || [];
            const currentIndex = parsed.payload.currentIndex;
            const currentItem = items[currentIndex];
            setCurrentUrl(currentItem && currentItem.status === 'processing' ? currentItem.url : null);
            
            // Trigger results re-fetch to load new entries into results table
            fetchStatus();
          }
        } catch (err) {
          console.error('useQueueEvents: Error parsing SSE message payload:', err);
        }
      };

      eventSource.onerror = (err) => {
        const errorMsg = 'useQueueEvents: SSE stream connection lost. Reconnecting...';
        console.error(errorMsg, err);
        setIsConnected(false);
        setConnectionError(errorMsg);
        setShowErrorDialog(true);
        eventSource.close();
        // Reconnect after 3 seconds
        setTimeout(connectSSE, 3000);
      };
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const dismissErrorDialog = () => {
    setShowErrorDialog(false);
  };

  return {
    status,
    stats,
    currentUrl,
    results,
    isConnected,
    connectionError,
    showErrorDialog,
    dismissErrorDialog,
    refetch: fetchStatus
  };
}
