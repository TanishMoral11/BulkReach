import { chromium, BrowserContext } from 'playwright';
import path from 'path';
import { Lead } from '../types';

export class PlaywrightWorker {
  private context: BrowserContext | null = null;
  private userDataDir: string;

  constructor() {
    this.userDataDir = path.join(process.cwd(), 'data', 'chrome_profile');
  }

  /**
   * Initializes the persistent Chrome browser instance.
   */
  public async init(): Promise<void> {
    if (this.context) return;

    try {
      this.context = await chromium.launchPersistentContext(this.userDataDir, {
        headless: false, // Run headful to allow Cloudflare Turnstile to solve naturally or permit manual clicks
        channel: 'chrome', // Use local system Google Chrome for authentic fingerprints
        viewport: { width: 1280, height: 800 },
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox'
        ]
      });

      // Override navigator.webdriver flag in all tabs
      await this.context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
      });

      console.log('PlaywrightWorker: System Chrome browser initiated successfully.');
    } catch (error) {
      console.error('PlaywrightWorker: Failed to initialize browser context:', error);
      throw error;
    }
  }

  /**
   * Automated lookup for a single LinkedIn URL.
   */
  public async extractLead(url: string): Promise<Lead> {
    if (!this.context) {
      await this.init();
    }

    const page = this.context!.pages().length > 0 ? this.context!.pages()[0] : await this.context!.newPage();
    
    try {
      const targetUrl = encodeURIComponent(url);
      const queryUrl = `https://mailmeteor.com/tools/linkedin-email-finder?linkedin-url=${targetUrl}`;
      
      console.log(`PlaywrightWorker: Navigating to ${queryUrl}`);
      
      await page.goto(queryUrl, { 
        waitUntil: 'load', 
        timeout: 30000 
      });

      // Wait for either the result card to be ready (non-loading state) or an error/Turnstile message to appear
      console.log('PlaywrightWorker: Waiting for result to load or error to display...');
      
      const resultSelector = '.email-result-card';
      const errorSelector = '.linkedin-email-finder__text';
      
      await page.waitForFunction(() => {
        // 1. Success check: result card exists and name does NOT contain "searching" or empty
        const card = document.querySelector('.email-result-card');
        if (card) {
          const nameEl = card.querySelector('h5.linkedin-email-finder__text');
          const nameText = nameEl ? nameEl.textContent?.trim() || '' : '';
          if (nameText !== '' && !nameText.toLowerCase().includes('searching')) {
            return true;
          }
        }

        // 2. Error check: document text indicates Turnstile or unexpected failure
        const bodyText = document.body.innerText || '';
        if (bodyText.includes("Oops, it didn't work") || 
            bodyText.includes("unexpected error") || 
            bodyText.includes("No email found")) {
          return true;
        }

        return false;
      }, undefined, { timeout: 30000 });

      // Evaluate result on the page
      const extractedData = await page.evaluate((selectors) => {
        const card = document.querySelector(selectors.resultSelector);
        
        if (card) {
          const nameEl = card.querySelector('h5.linkedin-email-finder__text');
          const nameText = nameEl ? nameEl.textContent?.trim() || null : null;
          
          // Extra guard: make sure we didn't somehow grab a placeholder name
          if (nameText && !nameText.toLowerCase().includes('searching')) {
            const emailEl = card.querySelector('span.linkedin-email-finder__text.text-secondary');
            const companyImg = card.querySelector('span.position-text img.linkedin-email-finder-icon');
            
            return {
              success: true,
              name: nameText,
              email: emailEl ? emailEl.textContent?.trim() || null : null,
              company: companyImg ? companyImg.getAttribute('alt')?.trim() || null : null,
              errorMsg: null
            };
          }
        }

        // Error case: extract error message from error element or general text
        const errorEl = document.querySelector(selectors.errorSelector);
        const errorText = errorEl ? errorEl.textContent?.trim() || '' : '';
        
        return {
          success: false,
          name: null,
          email: null,
          company: null,
          errorMsg: errorText || 'Unknown error occurred'
        };
      }, { resultSelector, errorSelector });

      if (extractedData.success) {
        return {
          name: extractedData.name,
          company: extractedData.company,
          email: extractedData.email,
          linkedinUrl: url,
          status: 'success',
          processedAt: new Date().toISOString()
        };
      }

      // Check if error is indeed "No email found" or a Turnstile block
      const errMsg = extractedData.errorMsg || 'Unknown error occurred';
      if (errMsg.toLowerCase().includes("oops") || errMsg.toLowerCase().includes("error") || errMsg.toLowerCase().includes("unexpected")) {
        throw new Error(`Cloudflare or unexpected error from Mailmeteor: ${errMsg}`);
      }

      // Safe fallback - email not found
      return {
        name: null,
        company: null,
        email: null,
        linkedinUrl: url,
        status: 'success', // Processed successfully but empty result
        error: errMsg || 'Email not found',
        processedAt: new Date().toISOString()
      };

    } catch (error: any) {
      console.error(`PlaywrightWorker: Extraction failed for ${url}:`, error.message);
      
      return {
        name: null,
        company: null,
        email: null,
        linkedinUrl: url,
        status: 'failed',
        error: error.message || 'Timeout/Browser error',
        processedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Safely closes the browser context.
   */
  public async close(): Promise<void> {
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
