export class RateLimiter {
  private requestTimestamps: number[] = [];
  private readonly WINDOW_MS = 60000; // 60 seconds rolling window
  private readonly MAX_REQUESTS = 5; // Max 5 requests per 60 seconds
  private readonly BASE_MIN_JITTER_MS = 10000; // 10 seconds minimum delay
  private readonly BASE_MAX_JITTER_MS = 12000; // 12 seconds maximum delay
  private minJitterMs: number;
  private maxJitterMs: number;
  private lastRequestTime = 0;
  private penaltyCount = 0;

  constructor() {
    this.minJitterMs = this.BASE_MIN_JITTER_MS;
    this.maxJitterMs = this.BASE_MAX_JITTER_MS;
  }

  /**
   * Called when a rate limit is detected.
   */
  public penalize(): void {
    this.penaltyCount++;
    console.log(`RateLimiter: ⚠ Rate limit #${this.penaltyCount} noted. Pacing remains at ${this.minJitterMs}ms – ${this.maxJitterMs}ms`);
  }

  /**
   * Paces operations by waiting at least 10-12s between consecutive requests.
   */
  public async throttle(): Promise<void> {
    const now = Date.now();

    // 1. Enforce 10-12 seconds delay between queries
    const currentJitter = Math.floor(
      Math.random() * (this.maxJitterMs - this.minJitterMs + 1) + this.minJitterMs
    );
    
    let targetTime = now;
    if (this.lastRequestTime > 0) {
      targetTime = Math.max(now, this.lastRequestTime + currentJitter);
    }
    
    this.lastRequestTime = targetTime;

    const waitTime = targetTime - now;
    if (waitTime > 0) {
      console.log(`RateLimiter: Waiting ${(waitTime / 1000).toFixed(1)}s before query (10s pacing)...`);
      await this.sleep(waitTime);
    }

    // 2. Enforce rolling window limit (Max 5 per 60s)
    await this.enforceSlidingWindow();

    // Record the actual request execution time
    const actualNow = Date.now();
    this.requestTimestamps.push(actualNow);
  }

  /**
   * Blocks execution until sliding window availability opens up.
   */
  private async enforceSlidingWindow(): Promise<void> {
    let now = Date.now();
    this.cleanOldTimestamps(now);

    while (this.requestTimestamps.length >= this.MAX_REQUESTS) {
      const oldestTimestamp = this.requestTimestamps[0];
      const waitTime = oldestTimestamp + this.WINDOW_MS - now;

      if (waitTime > 0) {
        console.log(`RateLimiter: Rolling window limit reached. Delaying for ${(waitTime / 1000).toFixed(1)}s`);
        await this.sleep(waitTime);
      }
      now = Date.now();
      this.cleanOldTimestamps(now);
    }
  }

  /**
   * Prunes request timestamps that fall outside the sliding window.
   */
  private cleanOldTimestamps(now: number): void {
    const threshold = now - this.WINDOW_MS;
    this.requestTimestamps = this.requestTimestamps.filter((t) => t > threshold);
  }

  /**
   * Helper utility to block execution thread for ms milliseconds.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
