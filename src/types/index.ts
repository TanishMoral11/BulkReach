export type QueueStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'STOPPED' | 'COMPLETED';

export type JobStatus = 'pending' | 'processing' | 'success' | 'failed';

export interface Lead {
  name: string | null;
  company: string | null;
  email: string | null;
  linkedinUrl: string;
  status: JobStatus;
  error?: string;
  processedAt?: string; // ISO timestamp
}

export interface QueueItem {
  id: string;
  url: string;
  status: JobStatus;
  retries: number;
  lastAttempt?: string; // ISO timestamp
  error?: string;
}

export interface QueueState {
  status: QueueStatus;
  items: QueueItem[];
  currentIndex: number;
  startTime?: string; // ISO timestamp
  endTime?: string; // ISO timestamp
}

export interface ProgressStats {
  total: number;
  completed: number;
  failed: number;
  remaining: number;
  successRate: number; // percentage (0 - 100)
  etaSeconds: number | null; // null if cannot calculate or idle
}
