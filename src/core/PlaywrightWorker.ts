import { chromium, BrowserContext, Page } from 'playwright';
import path from 'path';
import { Lead } from '../types';

// Patterns that indicate the extracted "name" is actually an error message, not a real person
const ERROR_NAME_PATTERNS = [
  'oops',
  "didn't work",
  'rate_limit',
  'rate limit',
  'unexpected error',
  'try again',
  'something went wrong',
  'error occurred',
  'blocked',
  'captcha',
  'turnstile',
];

// Patterns that mean "no email exists for this profile" — legitimate, don't retry
const NO_DATA_PATTERNS = [
  'no results found',
  'no email found',
];

export class PlaywrightWorker {
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private userDataDir: string;

  constructor() {
    this.userDataDir = path.join(process.cwd(), 'data', 'chrome_profile');
  }

  /**
   * Initializes the persistent Chrome browser instance and persistent page tab.
   */
  public async init(): Promise<void> {
    if (this.context) return;

    try {
      this.context = await chromium.launchPersistentContext(this.userDataDir, {
        headless: false,
        channel: 'chrome',
        viewport: { width: 1280, height: 800 },
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox'
        ]
      });

      await this.context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
      });

      this.page = await this.context.newPage();
      console.log('PlaywrightWorker: Browser and persistent tab initiated.');
    } catch (error) {
      console.error('PlaywrightWorker: Failed to initialize browser context:', error);
      throw error;
    }
  }

  /**
   * Checks if a scraped "name" string is actually an error message from Mailmeteor.
   */
  private isErrorName(name: string): boolean {
    const lower = name.toLowerCase();
    return ERROR_NAME_PATTERNS.some((pattern) => lower.includes(pattern));
  }

  /**
   * Checks if the error is specifically a rate limit.
   */
  private isRateLimitError(text: string): boolean {
    const lower = text.toLowerCase();
    return lower.includes('rate_limit') || lower.includes('rate limit');
  }

  /**
   * Checks if the text indicates a legitimate "no data" response (not an error).
   */
  private isNoDataResponse(text: string): boolean {
    const lower = text.toLowerCase();
    return NO_DATA_PATTERNS.some((pattern) => lower.includes(pattern));
  }

  /**
   * Automated lookup for a single LinkedIn URL using the persistent, cached tab.
   */
  public async extractLead(url: string): Promise<Lead> {
    if (!this.context || !this.page) {
      await this.init();
    }

    const activePage = this.page!;
    
    try {
      const targetUrl = encodeURIComponent(url);
      const queryUrl = `https://mailmeteor.com/tools/linkedin-email-finder?linkedin-url=${targetUrl}`;
      
      console.log(`PlaywrightWorker: Navigating for ${url}`);
      
      await activePage.goto(queryUrl, { 
        waitUntil: 'load', 
        timeout: 30000 
      });

      console.log('PlaywrightWorker: Waiting for result...');
      
      // Wait for either: a result card with text, an error message, or a timeout
      await activePage.waitForFunction(() => {
        // 1. Result card has populated text (could be real name OR error text like "Oops...")
        const card = document.querySelector('.email-result-card');
        if (card) {
          const nameEl = card.querySelector('h5.linkedin-email-finder__text');
          const nameText = nameEl ? nameEl.textContent?.trim() || '' : '';
          if (nameText !== '' && !nameText.toLowerCase().includes('searching')) {
            return true;
          }
        }

        // 2. Body-level error messages
        const bodyText = document.body.innerText || '';
        if (bodyText.includes("Oops, it didn't work") || 
            bodyText.includes("unexpected error") || 
            bodyText.includes("No email found")) {
          return true;
        }

        return false;
      }, undefined, { timeout: 30000 });

      // Extract data from the page
      const extractedData = await activePage.evaluate(() => {
        const card = document.querySelector('.email-result-card');
        
        if (card) {
          const nameEl = card.querySelector('h5.linkedin-email-finder__text');
          const nameText = nameEl ? nameEl.textContent?.trim() || null : null;
          
          if (nameText && !nameText.toLowerCase().includes('searching')) {
            const emailEl = card.querySelector('span.linkedin-email-finder__text.text-secondary');
            const companyImg = card.querySelector('span.position-text img.linkedin-email-finder-icon');
            const positionEl = card.querySelector('span.position-text');
            
            return {
              hasCard: true,
              name: nameText,
              email: emailEl ? emailEl.textContent?.trim() || null : null,
              company: companyImg ? companyImg.getAttribute('alt')?.trim() || null : null,
              jobTitle: positionEl ? positionEl.textContent?.trim() || null : null,
            };
          }
        }

        // No valid card — grab any visible error text
        const bodyText = document.body.innerText || '';
        return {
          hasCard: false,
          name: null,
          email: null,
          company: null,
          jobTitle: null,
          bodySnippet: bodyText.substring(0, 500),
        };
      });

      // ── CRITICAL: Check if the "name" is actually an error or no-data message ──
      if (extractedData.hasCard && extractedData.name) {
        // Check for "No results found" / "No email found" — legitimate empty result, don't retry
        if (this.isNoDataResponse(extractedData.name)) {
          console.log(`PlaywrightWorker: ℹ No data available for ${url} ("${extractedData.name}")`);
          return {
            name: null, company: null, jobTitle: null, email: null,
            linkedinUrl: url, status: 'success',
            error: 'No results found',
            processedAt: new Date().toISOString()
          };
        }

        // Check for rate limit or other real errors — these should be retried
        if (this.isErrorName(extractedData.name)) {
          const isRateLimit = this.isRateLimitError(extractedData.name);
          const errorType = isRateLimit ? 'RATE_LIMIT' : 'SITE_ERROR';
          console.error(`PlaywrightWorker: [${errorType}] Detected error in name field: "${extractedData.name}" for ${url}`);
          
          return {
            name: null, company: null, jobTitle: null, email: null,
            linkedinUrl: url, status: 'failed',
            error: isRateLimit ? 'rate_limit' : `site_error: ${extractedData.name}`,
            processedAt: new Date().toISOString()
          };
        }

        // Genuine successful extraction
        console.log(`PlaywrightWorker: ✓ Extracted "${extractedData.name}" for ${url}`);
        return {
          name: extractedData.name,
          company: extractedData.company,
          jobTitle: extractedData.jobTitle,
          email: extractedData.email,
          linkedinUrl: url,
          status: 'success',
          processedAt: new Date().toISOString()
        };
      }

      // No card found — check body for clues
      const bodySnippet = (extractedData as any).bodySnippet || '';
      if (this.isRateLimitError(bodySnippet)) {
        console.error(`PlaywrightWorker: [RATE_LIMIT] Body text indicates rate limit for ${url}`);
        return {
          name: null, company: null, jobTitle: null, email: null,
          linkedinUrl: url, status: 'failed',
          error: 'rate_limit',
          processedAt: new Date().toISOString()
        };
      }

      // Genuine "no results" scenario
      console.log(`PlaywrightWorker: No data found for ${url}`);
      return {
        name: null, company: null, jobTitle: null, email: null,
        linkedinUrl: url, status: 'success',
        error: 'No results found',
        processedAt: new Date().toISOString()
      };

    } catch (error: any) {
      console.error(`PlaywrightWorker: Extraction failed for ${url}:`, error.message);
      
      return {
        name: null, company: null, jobTitle: null, email: null,
        linkedinUrl: url, status: 'failed',
        error: error.message || 'Timeout/Browser error',
        processedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Safely closes the browser context and page.
   */
  public async close(): Promise<void> {
    if (this.page) {
      try { await this.page.close(); } catch (e) { /* ignore */ }
      this.page = null;
    }
    if (this.context) {
      try {
        await this.context.close();
        this.context = null;
        console.log('PlaywrightWorker: Browser context closed.');
      } catch (error) {
        console.error('PlaywrightWorker: Error closing browser context:', error);
      }
    }
  }
}
