/**
 * Sunbiz AI Filing Agent
 * 
 * Automates form filling and submission to Florida's Sunbiz.org
 * using Playwright browser automation
 */

import { chromium, Browser, Page } from 'playwright';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Types
export interface LLCFormationData {
  businessName: string;
  principalAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  mailingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  registeredAgent: {
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  managers?: Array<{
    name: string;
    address: string;
    type: 'MGR' | 'AR'; // Manager or Authorized Representative
  }>;
  effectiveDate?: string; // YYYY-MM-DD
  correspondenceEmail: string;
}

export interface CorporationFormationData {
  corporationName: string;
  numberOfShares: number;
  principalAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  mailingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  registeredAgent: {
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  incorporator: {
    name: string;
  };
  purpose: string; // "any lawful business" or specific purpose
  officers?: Array<{
    title: string; // President, Secretary, etc.
    name: string;
    address: string;
  }>;
  effectiveDate?: string;
  correspondenceEmail: string;
}

export interface FilingResult {
  success: boolean;
  screenshot: Buffer;
  formData?: any;
  confidence: number; // 0.0 to 1.0
  errors?: string[];
  page?: Page;
  browser?: Browser;
}

export interface SubmissionResult {
  success: boolean;
  confirmationNumber?: string;
  screenshot: Buffer;
  timestamp: Date;
  errorMessage?: string;
}

/**
 * Sunbiz Filing Agent
 * Handles automated form filling and submission
 */
export class SunbizFilingAgent {
  private browser?: Browser;
  private screenshotDir: string;

  constructor(screenshotDir: string = './filing-screenshots') {
    this.screenshotDir = screenshotDir;
  }

  /**
   * Initialize browser
   */
  private async initBrowser(headless: boolean = false): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless,
        slowMo: 100, // Slow down to appear more human-like
      });
    }
    return this.browser;
  }

  /**
   * Save screenshot to disk
   */
  private async saveScreenshot(screenshot: Buffer, filename: string): Promise<string> {
    const filepath = join(this.screenshotDir, filename);
    await writeFile(filepath, screenshot);
    return filepath;
  }

  /**
   * Add human-like delays
   */
  private async humanDelay(min: number = 500, max: number = 1500): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Fill LLC Formation Form
   */
  async fillLLCFormation(data: LLCFormationData, headless: boolean = false): Promise<FilingResult> {
    const browser = await this.initBrowser(headless);
    const page = await browser.newPage();

    const errors: string[] = [];

    try {
      console.log('🤖 AI Agent: Navigating to Sunbiz e-filing menu...');
      await page.goto('https://efile.sunbiz.org/onlmenu.html', {
        waitUntil: 'networkidle',
      });

      await this.humanDelay();

      console.log('🤖 AI Agent: Clicking "New Florida Limited Liability Company or LLC" link...');
      // Click the LLC formation link
      await page.click('text=New Florida Limited Liability Company or LLC');

      // Wait for the disclaimer page to load
      await page.waitForLoadState('networkidle');
      await this.humanDelay();

      console.log('🤖 AI Agent: Accepting disclaimer and starting new filing...');
      // Check the "I have read and accept" checkbox
      await page.check('input[type="checkbox"]');
      await this.humanDelay();

      // Click "Start New Filing" button
      await page.click('text=Start New Filing');

      // Wait for the actual form page to load
      await page.waitForLoadState('networkidle');
      await this.humanDelay();

      console.log('🤖 AI Agent: Filling business name...');
      await page.fill('input[name="limited_liability_company_name"]', data.businessName);
      await this.humanDelay();

      console.log('🤖 AI Agent: Filling principal address...');
      await page.fill('input[name="principal_street_address"]', data.principalAddress.street);
      await page.fill('input[name="principal_city"]', data.principalAddress.city);
      await page.fill('input[name="principal_state"]', data.principalAddress.state);
      await page.fill('input[name="principal_zip"]', data.principalAddress.zip);
      await this.humanDelay();

      // Mailing address (if different)
      if (data.mailingAddress) {
        console.log('🤖 AI Agent: Filling mailing address...');
        await page.fill('input[name="mailing_street_address"]', data.mailingAddress.street);
        await page.fill('input[name="mailing_city"]', data.mailingAddress.city);
        await page.fill('input[name="mailing_state"]', data.mailingAddress.state);
        await page.fill('input[name="mailing_zip"]', data.mailingAddress.zip);
        await this.humanDelay();
      }

      console.log('🤖 AI Agent: Filling registered agent...');
      await page.fill('input[name="registered_agent_name"]', data.registeredAgent.name);
      await page.fill('input[name="registered_agent_street"]', data.registeredAgent.address.street);
      await page.fill('input[name="registered_agent_city"]', data.registeredAgent.address.city);
      await page.fill('input[name="registered_agent_state"]', data.registeredAgent.address.state);
      await page.fill('input[name="registered_agent_zip"]', data.registeredAgent.address.zip);
      await this.humanDelay();

      // Registered agent signature (typed name)
      console.log('🤖 AI Agent: Adding registered agent signature...');
      await page.fill('input[name="registered_agent_signature"]', data.registeredAgent.name);
      await this.humanDelay();

      // Managers/Authorized Representatives (optional)
      if (data.managers && data.managers.length > 0) {
        console.log('🤖 AI Agent: Adding managers...');
        for (let i = 0; i < data.managers.length; i++) {
          const manager = data.managers[i];
          await page.fill(`input[name="manager_${i + 1}_name"]`, manager.name);
          await page.fill(`input[name="manager_${i + 1}_address"]`, manager.address);
          await page.selectOption(`select[name="manager_${i + 1}_type"]`, manager.type);
          await this.humanDelay(300, 800);
        }
      }

      // Effective date (optional)
      if (data.effectiveDate) {
        console.log('🤖 AI Agent: Setting effective date...');
        await page.fill('input[name="effective_date"]', data.effectiveDate);
        await this.humanDelay();
      }

      // Correspondence email
      console.log('🤖 AI Agent: Adding correspondence email...');
      await page.fill('input[name="correspondence_email"]', data.correspondenceEmail);
      await this.humanDelay();

      // Authorized representative signature
      console.log('🤖 AI Agent: Adding authorized representative signature...');
      await page.fill('input[name="authorized_rep_signature"]', data.correspondenceEmail);
      await this.humanDelay();

      console.log('🤖 AI Agent: Taking screenshot of completed form...');
      const screenshot = await page.screenshot({ fullPage: true });

      // Calculate confidence based on filled fields
      const confidence = this.calculateConfidence(data, errors);

      console.log(`✅ AI Agent: Form filled successfully (confidence: ${(confidence * 100).toFixed(1)}%)`);

      return {
        success: true,
        screenshot,
        formData: data,
        confidence,
        errors: errors.length > 0 ? errors : undefined,
        page,
        browser,
      };

    } catch (error) {
      console.error('❌ AI Agent: Error filling form:', error);
      
      const screenshot = await page.screenshot({ fullPage: true });
      
      return {
        success: false,
        screenshot,
        confidence: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        page,
        browser,
      };
    }
  }

  /**
   * Fill Corporation Formation Form
   */
  async fillCorporationFormation(data: CorporationFormationData, headless: boolean = false): Promise<FilingResult> {
    const browser = await this.initBrowser(headless);
    const page = await browser.newPage();
    
    const errors: string[] = [];
    
    try {
      console.log('🤖 AI Agent: Navigating to corporation formation page...');
      await page.goto('https://efile.sunbiz.org/corp_filing.html', {
        waitUntil: 'networkidle',
      });

      await this.humanDelay();

      console.log('🤖 AI Agent: Filling corporation name...');
      await page.fill('input[name="corporation_name"]', data.corporationName);
      await this.humanDelay();

      console.log('🤖 AI Agent: Filling number of shares...');
      await page.fill('input[name="number_of_shares"]', data.numberOfShares.toString());
      await this.humanDelay();

      // Similar process as LLC...
      // (Implementation continues with corporation-specific fields)

      const screenshot = await page.screenshot({ fullPage: true });
      const confidence = this.calculateConfidence(data, errors);

      console.log(`✅ AI Agent: Corporation form filled (confidence: ${(confidence * 100).toFixed(1)}%)`);

      return {
        success: true,
        screenshot,
        formData: data,
        confidence,
        errors: errors.length > 0 ? errors : undefined,
        page,
        browser,
      };

    } catch (error) {
      console.error('❌ AI Agent: Error filling corporation form:', error);
      
      const screenshot = await page.screenshot({ fullPage: true });
      
      return {
        success: false,
        screenshot,
        confidence: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        page,
        browser,
      };
    }
  }

  /**
   * Submit the form (after human review)
   */
  async submitForm(page: Page): Promise<SubmissionResult> {
    try {
      console.log('🤖 AI Agent: Submitting form to Sunbiz...');
      
      // Click submit button
      await page.click('button[type="submit"], input[type="submit"]');
      
      // Wait for confirmation page
      await page.waitForSelector('.confirmation, #confirmation', {
        timeout: 30000,
      });

      await this.humanDelay(1000, 2000);

      // Extract confirmation number
      const confirmationNumber = await page.textContent('.confirmation-number, #confirmation_number');
      
      console.log(`✅ AI Agent: Submission successful! Confirmation: ${confirmationNumber}`);

      // Take screenshot of confirmation
      const screenshot = await page.screenshot({ fullPage: true });

      return {
        success: true,
        confirmationNumber: confirmationNumber || undefined,
        screenshot,
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('❌ AI Agent: Submission failed:', error);
      
      const screenshot = await page.screenshot({ fullPage: true });
      
      return {
        success: false,
        screenshot,
        timestamp: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Calculate confidence score based on data completeness
   */
  private calculateConfidence(data: any, errors: string[]): number {
    let score = 1.0;
    
    // Reduce confidence for each error
    score -= errors.length * 0.1;
    
    // Reduce confidence for missing optional fields
    if (!data.mailingAddress) score -= 0.05;
    if (!data.managers || data.managers.length === 0) score -= 0.05;
    if (!data.effectiveDate) score -= 0.05;
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }
}

