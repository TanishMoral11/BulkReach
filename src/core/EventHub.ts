type SSECallback = (data: string) => void;

export class EventHub {
  private static clients: Set<SSECallback> = new Set();

  /**
   * Registers a new SSE client callback.
   * Returns an unsubscribe function.
   */
  public static subscribe(callback: SSECallback): () => void {
    this.clients.add(callback);
    console.log(`EventHub: Client connected. Total active clients: ${this.clients.size}`);
    
    return () => {
      this.clients.delete(callback);
      console.log(`EventHub: Client disconnected. Total active clients: ${this.clients.size}`);
    };
  }

  /**
   * Broadcasts a JSON-formatted event to all registered clients.
   */
  public static broadcast(type: string, payload: any): void {
    if (this.clients.size === 0) return;

    const data = JSON.stringify({ type, payload });
    const message = `data: ${data}\n\n`;

    this.clients.forEach((client) => {
      try {
        client(message);
      } catch (err) {
        console.error('EventHub: Error sending message to client:', err);
      }
    });
  }
}
