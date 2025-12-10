/**
 * Vitest Setup File
 * 
 * This file runs before all tests and sets up the testing environment.
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
