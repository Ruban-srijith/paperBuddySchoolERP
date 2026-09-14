/**
 * Test setup file for Vitest + jsdom environment.
 * Runs before every test file.
 */
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Silence console.error during tests (noisy from React warnings)
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});
