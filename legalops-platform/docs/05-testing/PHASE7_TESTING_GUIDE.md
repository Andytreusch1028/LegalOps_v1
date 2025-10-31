# Phase 7: Testing Guide

## 🎯 Overview

This document outlines testing requirements for Phase 7 (Smart + Safe Experience Overhaul).

---

## 🧪 Test Coverage Requirements

### 1. Smart Form Autofill Tests (Cypress)

**Target:** ≥ 100% autofill accuracy

#### Test Scenarios

```typescript
// cypress/e2e/smart-forms.cy.ts

describe('Smart Form Autofill', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password');
  });
  
  it('should auto-fill from saved user profile', () => {
    // Navigate to LLC formation
    cy.visit('/services/llc-formation');
    cy.contains('Start Formation').click();
    
    // Verify fields are auto-filled
    cy.get('input[name="firstName"]').should('have.value', 'John');
    cy.get('input[name="lastName"]').should('have.value', 'Doe');
    cy.get('input[name="email"]').should('have.value', 'test@example.com');
    
    // Verify verified field styling
    cy.get('input[name="firstName"]').should('have.class', 'verified-field');
  });
  
  it('should auto-fill from previous order', () => {
    // Create a previous order
    cy.createOrder({
      businessName: 'Test LLC',
      principalAddress: {
        street: '123 Main St',
        city: 'Miami',
        state: 'FL',
        zip: '33101',
      },
    });
    
    // Start new order
    cy.visit('/services/annual-report');
    cy.contains('File Annual Report').click();
    
    // Verify business info is auto-filled
    cy.get('input[name="businessName"]').should('have.value', 'Test LLC');
    cy.get('input[name="street"]').should('have.value', '123 Main St');
    
    // Verify verification indicator
    cy.contains('From previous order').should('be.visible');
  });
  
  it('should allow manual override of auto-filled fields', () => {
    cy.visit('/services/llc-formation');
    cy.contains('Start Formation').click();
    
    // Override auto-filled field
    cy.get('input[name="firstName"]').clear().type('Jane');
    
    // Verify verified styling is removed
    cy.get('input[name="firstName"]').should('not.have.class', 'verified-field');
  });
  
  it('should save draft and restore on return', () => {
    cy.visit('/services/llc-formation');
    cy.contains('Start Formation').click();
    
    // Fill some fields
    cy.get('input[name="businessName"]').type('My New LLC');
    cy.get('input[name="businessPurpose"]').type('Consulting services');
    
    // Wait for auto-save
    cy.wait(6000);
    
    // Navigate away
    cy.visit('/dashboard');
    
    // Return to form
    cy.visit('/services/llc-formation');
    cy.contains('Start Formation').click();
    
    // Verify draft is restored
    cy.get('input[name="businessName"]').should('have.value', 'My New LLC');
    cy.get('input[name="businessPurpose"]').should('have.value', 'Consulting services');
  });
});
```

---

### 2. Risk Assessment Tests (Playwright)

**Target:** Admin review workflow functions correctly

#### Test Scenarios

```typescript
// tests/risk-assessment.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Risk Assessment Workflow', () => {
  test('should assess low-risk order and auto-approve', async ({ page }) => {
    // Create low-risk order
    await page.goto('/checkout/guest');
    
    await page.fill('input[name="email"]', 'trusted@gmail.com');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Smith');
    
    // Proceed to payment
    await page.click('button:has-text("Continue to Payment")');
    
    // Verify Security Confidence Badge shows LOW risk
    await expect(page.locator('.risk-badge')).toContainText('Low Risk');
    await expect(page.locator('.risk-badge')).toHaveClass(/bg-emerald/);
  });
  
  test('should flag high-risk order for review', async ({ page }) => {
    // Create high-risk order
    await page.goto('/checkout/guest');
    
    await page.fill('input[name="email"]', 'suspicious@tempmail.com');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    
    // Large order amount
    await page.selectOption('select[name="service"]', 'premium-package');
    
    // Rush order
    await page.check('input[name="rushOrder"]');
    
    // Proceed to payment
    await page.click('button:has-text("Continue to Payment")');
    
    // Verify Security Confidence Badge shows HIGH risk
    await expect(page.locator('.risk-badge')).toContainText('High Risk');
    await expect(page.locator('.risk-badge')).toHaveClass(/bg-amber/);
    
    // Verify review message
    await expect(page.locator('text=requires manual review')).toBeVisible();
  });
  
  test('admin should approve high-risk order', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@legalops.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button:has-text("Sign In")');
    
    // Navigate to risk management
    await page.goto('/admin/risk-management');
    
    // Verify high-risk order appears
    await expect(page.locator('.risk-badge:has-text("High Risk")')).toBeVisible();
    
    // Click first order
    await page.click('.risk-assessment-card:first-child');
    
    // Approve order
    await page.click('button:has-text("Approve")');
    
    // Confirm approval
    await page.click('button:has-text("Confirm")');
    
    // Verify order is removed from pending list
    await expect(page.locator('.risk-assessment-card')).toHaveCount(0);
  });
  
  test('admin should decline high-risk order', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@legalops.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button:has-text("Sign In")');
    
    // Navigate to risk management
    await page.goto('/admin/risk-management');
    
    // Click first order
    await page.click('.risk-assessment-card:first-child');
    
    // Decline order
    await page.click('button:has-text("Decline")');
    
    // Enter reason
    await page.fill('textarea[name="reason"]', 'Suspicious activity detected');
    
    // Confirm decline
    await page.click('button:has-text("Confirm Decline")');
    
    // Verify order is removed
    await expect(page.locator('.risk-assessment-card')).toHaveCount(0);
  });
});
```

---

### 3. Performance Tests (Lighthouse)

**Target:** Performance score ≥ 90

#### Lighthouse CI Configuration

```javascript
// lighthouserc.js

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3003/',
        'http://localhost:3003/services/llc-formation',
        'http://localhost:3003/checkout/guest',
        'http://localhost:3003/dashboard',
      ],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Custom assertions
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

#### Run Lighthouse Tests

```bash
# Install Lighthouse CI
npm install --save-dev @lhci/cli

# Run tests
npm run build
npm run start &
npx lhci autorun

# View results
npx lhci open
```

---

### 4. Accessibility Tests (axe)

**Target:** Zero critical accessibility violations

#### Axe Configuration

```typescript
// tests/accessibility.spec.ts

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('homepage should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('checkout page should have no accessibility violations', async ({ page }) => {
    await page.goto('/checkout/guest');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('dashboard should have no accessibility violations', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button:has-text("Sign In")');
    
    await page.goto('/dashboard');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

---

## 🚀 Running Tests

### Install Dependencies

```bash
# Cypress
npm install --save-dev cypress

# Playwright
npm install --save-dev @playwright/test

# Axe
npm install --save-dev @axe-core/playwright

# Lighthouse CI
npm install --save-dev @lhci/cli
```

### Run Tests

```bash
# Cypress (Smart Forms)
npx cypress open

# Playwright (Risk Assessment)
npx playwright test

# Lighthouse (Performance)
npm run build && npm run start &
npx lhci autorun

# Axe (Accessibility)
npx playwright test tests/accessibility.spec.ts
```

---

## ✅ Success Criteria

- [ ] Smart Form autofill accuracy: 100%
- [ ] Risk assessment workflow: All scenarios pass
- [ ] Lighthouse Performance score: ≥ 90
- [ ] Lighthouse Accessibility score: ≥ 95
- [ ] Zero critical accessibility violations
- [ ] Mobile AI response time: < 5s
- [ ] Feedback beacon functional on all key pages

---

## 📊 Test Reports

Generate test reports for review:

```bash
# Cypress report
npx cypress run --reporter mochawesome

# Playwright report
npx playwright test --reporter=html

# Lighthouse report
npx lhci autorun --upload.target=temporary-public-storage
```

