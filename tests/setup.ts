// Jest setup file for ESM compatibility
import { jest } from '@jest/globals';

// Make jest available globally for ESM compatibility
(globalThis as any).jest = jest;