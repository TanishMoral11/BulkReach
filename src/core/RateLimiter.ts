export class RateLimiter {
  private requestTimestamps: number[] = [];
  private readonly WINDOW_MS = 40000; // 40 seconds
  private readonly MAX_REQUESTS = 3;
  private readonly MIN_JITTER_MS = 12000; // 12 seconds
  private readonly MAX_JITTER_MS = 15000; // 15 seconds
  private lastRequestTime = 0;

  /**
   * Paces operations by waiting when limits are reached.
   */
  public async throttle(): Promise<void> {
    const now = Date.now();

    // 1. Enforce operation spacing (12 - 15 seconds)
    const timeSinceLast = now - this.lastRequestTime;
    const currentJitter = Math.floor(
      Math.random() * (this.MAX_JITTER_MS - this.MIN_JITTER_MS + 1) + this.MIN_JITTER_MS
    );
    
    if (this.lastRequestTime > 0 && timeSinceLast < currentJitter) {
      const waitTime = currentJitter - timeSinceLast;
      console.log(`RateLimiter: Spacing out requests. Waiting for ${waitTime}ms (Jitter: ${currentJitter}ms)`);
      await this.sleep(waitTime);
    }

    // 2. Enforce rolling window limit (Max 3 in 40 seconds)
    await this.enforceSlidingWindow();

    // Record the actual request time
    const actualNow = Date.now();
    this.requestTimestamps.push(actualNow);
    this.lastRequestTime = actualNow;
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
        console.log(`RateLimiter: Rolling window limit reached. Delaying for ${waitTime}ms`);
        await this.sleep(waitTime);
      }
      now = Date.now();
      this.cleanOldTimestamps(now);
    }
  }

  /**
   * Prunes request timestamps that fall outside the 40-second sliding window.
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
