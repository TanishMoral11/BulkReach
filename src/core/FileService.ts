import fs from 'fs/promises';
import path from 'path';
import { QueueState, Lead } from '../types';

export class FileService {
  private static DATA_DIR = path.join(process.cwd(), 'data');
  private static QUEUE_STATE_PATH = path.join(FileService.DATA_DIR, 'queue_state.json');
  private static RESULTS_PATH = path.join(FileService.DATA_DIR, 'results.json');

  /**
   * Ensures the data directory exists.
   */
  private static async ensureDataDir(): Promise<void> {
    try {
      await fs.mkdir(this.DATA_DIR, { recursive: true });
    } catch (error) {
      console.error('Error creating data directory:', error);
    }
  }

  /**
   * Saves the current queue state to disk.
   */
  public static async saveQueueState(state: QueueState): Promise<void> {
    await this.ensureDataDir();
    try {
      const data = JSON.stringify(state, null, 2);
      await fs.writeFile(this.QUEUE_STATE_PATH, data, 'utf-8');
    } catch (error) {
      console.error('Error saving queue state:', error);
      throw error;
    }
  }

  /**
   * Loads the queue state from disk. Returns null if file doesn't exist.
   */
  public static async loadQueueState(): Promise<QueueState | null> {
    await this.ensureDataDir();
    try {
      const data = await fs.readFile(this.QUEUE_STATE_PATH, 'utf-8');
      return JSON.parse(data) as QueueState;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return null;
      }
      console.error('Error loading queue state:', error);
      throw error;
    }
  }

  /**
   * Saves all leads/results to disk.
   */
  public static async saveResults(results: Lead[]): Promise<void> {
    await this.ensureDataDir();
    try {
      const data = JSON.stringify(results, null, 2);
      await fs.writeFile(this.RESULTS_PATH, data, 'utf-8');
    } catch (error) {
      console.error('Error saving results:', error);
      throw error;
    }
  }

  /**
   * Loads the lead results from disk. Returns empty array if file doesn't exist.
   */
  public static async loadResults(): Promise<Lead[]> {
    await this.ensureDataDir();
    try {
      const data = await fs.readFile(this.RESULTS_PATH, 'utf-8');
      return JSON.parse(data) as Lead[];
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return [];
      }
      console.error('Error loading results:', error);
      throw error;
    }
  }

  /**
   * Appends or updates a lead in the results list.
   */
  public static async appendResult(lead: Lead): Promise<void> {
    await this.ensureDataDir();
    try {
      const results = await this.loadResults();
      // Remove any existing result for this URL to avoid duplicates
      const filteredResults = results.filter(
        (r) => r.linkedinUrl.toLowerCase() !== lead.linkedinUrl.toLowerCase()
      );
      filteredResults.push(lead);
      await this.saveResults(filteredResults);
    } catch (error) {
      console.error('Error appending result:', error);
      throw error;
    }
  }

  /**
   * Clears the saved queue state and results files from disk.
   */
  public static async clearAll(): Promise<void> {
    await this.ensureDataDir();
    try {
      await fs.unlink(this.QUEUE_STATE_PATH).catch(() => {});
      await fs.unlink(this.RESULTS_PATH).catch(() => {});
    } catch (error) {
      console.error('Error clearing data files:', error);
      throw error;
    }
  }
}
