import { QueueState, QueueItem, ProgressStats, QueueStatus } from '../types';
import { FileService } from './FileService';
import { RateLimiter } from './RateLimiter';
import { PlaywrightWorker } from './PlaywrightWorker';
import { EventHub } from './EventHub';

export class QueueManager {
  private state: QueueState = {
    status: 'IDLE',
    items: [],
    currentIndex: 0
  };

  private rateLimiter: RateLimiter;
  private worker: PlaywrightWorker;
  private listeners: ((state: QueueState) => void)[] = [];
  private isProcessing = false;

  constructor() {
    this.rateLimiter = new RateLimiter();
    this.worker = new PlaywrightWorker();
    
    // Broadcast progress updates via EventHub
    this.onProgressUpdate((state) => {
      EventHub.broadcast('PROGRESS_UPDATE', {
        stats: this.getStats(),
        queueStatus: state.status,
        currentIndex: state.currentIndex,
        items: state.items
      });
    });

    // Automatically load saved state from disk on startup
    this.loadStateFromDisk().catch((err) => {
      console.error('QueueManager: Failed to auto-load queue state:', err);
    });
  }

  /**
   * Loads queue state from disk if it exists, resuming previous session.
   */
  public async loadStateFromDisk(): Promise<void> {
    const savedState = await FileService.loadQueueState();
    if (savedState) {
      this.state = savedState;
      // If the server crashed or restarted while running, mark it paused or idle so user can resume
      if (this.state.status === 'RUNNING') {
        this.state.status = 'PAUSED';
      }
      this.broadcast();
      console.log(`QueueManager: Loaded state from disk. Progress: ${this.state.currentIndex}/${this.state.items.length}`);
    }
  }

  /**
   * Registers a listener to be notified on state updates.
   */
  public onProgressUpdate(callback: (state: QueueState) => void): void {
    this.listeners.push(callback);
  }

  /**
   * Starts a new queue run.
   */
  public async startQueue(urls: string[]): Promise<void> {
    if (this.state.status === 'RUNNING') {
      throw new Error('Queue is already running');
    }

    // Sanitize and deduplicate URLs
    const sanitizedUrls = Array.from(new Set(urls.map((u) => u.trim()).filter((u) => u.length > 0)));

    const items: QueueItem[] = sanitizedUrls.map((url, idx) => ({
      id: `item_${Date.now()}_${idx}`,
      url,
      status: 'pending',
      retries: 0
    }));

    this.state = {
      status: 'RUNNING',
      items,
      currentIndex: 0,
      startTime: new Date().toISOString()
    };

    // Clear old result records for a fresh run
    await FileService.clearAll();
    await this.saveAndBroadcast();

    // Start background processor
    this.triggerProcessor();
  }

  /**
   * Pauses the active queue.
   */
  public async pauseQueue(): Promise<void> {
    if (this.state.status !== 'RUNNING') return;
    
    this.state.status = 'PAUSED';
    console.log('QueueManager: Queue PAUSED');
    await this.saveAndBroadcast();
  }

  /**
   * Resumes the paused queue.
   */
  public async resumeQueue(): Promise<void> {
    if (this.state.status !== 'PAUSED') return;

    this.state.status = 'RUNNING';
    console.log('QueueManager: Queue RESUMED');
    await this.saveAndBroadcast();

    // Trigger processor loop
    this.triggerProcessor();
  }

  /**
   * Stops the queue and kills the browser.
   */
  public async stopQueue(): Promise<void> {
    this.state.status = 'STOPPED';
    this.state.endTime = new Date().toISOString();
    console.log('QueueManager: Queue STOPPED');
    
    await this.worker.close();
    await this.saveAndBroadcast();
  }

  /**
   * Returns current statistics of the queue run.
   */
  public getStats(): ProgressStats {
    const total = this.state.items.length;
    let completed = 0;
    let failed = 0;

    this.state.items.forEach((item) => {
      if (item.status === 'success') completed++;
      else if (item.status === 'failed') failed++;
    });

    const remaining = total - completed - failed;
    const processed = completed + failed;
    const successRate = processed > 0 ? Math.round((completed / processed) * 1000) / 10 : 100;
    
    // Average duration estimate: Spacing jitter is ~13.5s + navigation/processing is ~10s = ~24s per URL.
    const averageTimePerUrlSeconds = 24;
    const etaSeconds = (this.state.status === 'RUNNING' || this.state.status === 'PAUSED') && remaining > 0 
      ? remaining * averageTimePerUrlSeconds 
      : null;

    return {
      total,
      completed,
      failed,
      remaining,
      successRate,
      etaSeconds
    };
  }

  /**
   * Returns current raw queue state.
   */
  public getQueueState(): QueueState {
    return this.state;
  }

  /**
   * Triggers the async background queue execution loop.
   */
  private triggerProcessor(): void {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    this.processLoop()
      .catch((err) => {
        console.error('QueueManager: Error in background loop:', err);
      })
      .finally(() => {
        this.isProcessing = false;
      });
  }

  /**
   * The core FIFO background processing loop.
   */
  private async processLoop(): Promise<void> {
    // Make sure worker browser is booted
    if (this.state.status === 'RUNNING' && this.state.currentIndex < this.state.items.length) {
      await this.worker.init();
    }

    while (this.state.status === 'RUNNING' && this.state.currentIndex < this.state.items.length) {
      const item = this.state.items[this.state.currentIndex];

      // If already success or failed, skip
      if (item.status === 'success' || item.status === 'failed') {
        this.state.currentIndex++;
        await this.saveAndBroadcast();
        continue;
      }

      item.status = 'processing';
      item.lastAttempt = new Date().toISOString();
      await this.saveAndBroadcast();

      // Enforce sliding-window rate limit
      try {
        await this.rateLimiter.throttle();
      } catch (err) {
        console.error('QueueManager: Rate Limiter error:', err);
      }

      // Check state again as pause/stop might have been triggered during throttle wait
      if (this.state.status !== 'RUNNING') {
        item.status = 'pending';
        await this.saveAndBroadcast();
        break;
      }

      try {
        // Execute lookup on Mailmeteor
        const lead = await this.worker.extractLead(item.url);

        if (lead.status === 'success') {
          item.status = 'success';
          item.error = undefined;
          await FileService.appendResult(lead);
          this.state.currentIndex++;
        } else {
          // Extraction returned status === 'failed'
          item.retries++;
          item.error = lead.error || 'Failed to extract';

          if (item.retries >= 3) {
            item.status = 'failed';
            await FileService.appendResult(lead);
            this.state.currentIndex++;
          } else {
            item.status = 'pending';
            // Exponential Backoff Wait: 5s * (2^attempt) + random jitter up to 2s
            const backoffMs = 5000 * Math.pow(2, item.retries) + Math.floor(Math.random() * 2000);
            console.log(`QueueManager: Backoff wait for ${backoffMs}ms before retrying ${item.url}`);
            await this.sleep(backoffMs);
          }
        }
      } catch (err: any) {
        console.error(`QueueManager: Failed processing job ${item.url}:`, err);
        item.retries++;
        item.error = err.message || 'Unknown extraction error';

        if (item.retries >= 3) {
          item.status = 'failed';
          await FileService.appendResult({
            name: null,
            company: null,
            email: null,
            linkedinUrl: item.url,
            status: 'failed',
            error: item.error,
            processedAt: new Date().toISOString()
          });
          this.state.currentIndex++;
        } else {
          item.status = 'pending';
          const backoffMs = 5000 * Math.pow(2, item.retries) + Math.floor(Math.random() * 2000);
          await this.sleep(backoffMs);
        }
      }

      await this.saveAndBroadcast();
    }

    // Check if queue completed successfully
    if (this.state.status === 'RUNNING' && this.state.currentIndex >= this.state.items.length) {
      this.state.status = 'COMPLETED';
      this.state.endTime = new Date().toISOString();
      await this.worker.close();
      await this.saveAndBroadcast();
    }
  }

  /**
   * Persists state to file system and broadcasts updates to listeners.
   */
  private async saveAndBroadcast(): Promise<void> {
    try {
      await FileService.saveQueueState(this.state);
    } catch (err) {
      console.error('QueueManager: Failed to save queue state:', err);
    }
    this.broadcast();
  }

  /**
   * Invokes all registered listeners.
   */
  private broadcast(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (err) {
        console.error('QueueManager: Error in broadcast listener:', err);
      }
    });
  }

  /**
   * Helper utility to block execution thread.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Next.js hot reload safety for local dev singleton
const globalForQueue = global as unknown as {
  queueManager: QueueManager | undefined;
};

export const queueManager = globalForQueue.queueManager ?? new QueueManager();

if (process.env.NODE_ENV !== 'production') {
  globalForQueue.queueManager = queueManager;
}
