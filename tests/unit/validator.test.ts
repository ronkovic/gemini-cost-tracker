import { validateDateRange, parseDate, validateCurrency, validateFormat } from '../../src/utils/validator.js';
import { AppError } from '../../src/types/index.js';

describe('Validator', () => {
  describe('validateDateRange', () => {
    beforeEach(() => {
      // Mock current date to a fixed date for consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should validate today period correctly', () => {
      const result = validateDateRange({ period: 'today' });

      // Create expected dates in local time, matching the implementation
      const expectedStart = new Date('2025-01-15T12:00:00Z');
      expectedStart.setHours(0, 0, 0, 0);
      const expectedEnd = new Date('2025-01-15T12:00:00Z');
      expectedEnd.setHours(23, 59, 59, 999);

      expect(result.startDate.getTime()).toBe(expectedStart.getTime());
      expect(result.endDate.getTime()).toBe(expectedEnd.getTime());
    });

    it('should validate week period correctly', () => {
      const result = validateDateRange({ period: 'week' });

      // Create expected dates in local time, matching the implementation
      const expectedStart = new Date('2025-01-15T12:00:00Z');
      expectedStart.setDate(expectedStart.getDate() - 7);
      expectedStart.setHours(0, 0, 0, 0);
      const expectedEnd = new Date('2025-01-15T12:00:00Z');
      expectedEnd.setHours(23, 59, 59, 999);

      expect(result.startDate.getTime()).toBe(expectedStart.getTime());
      expect(result.endDate.getTime()).toBe(expectedEnd.getTime());
    });

    it('should validate month period correctly', () => {
      const result = validateDateRange({ period: 'month' });

      // Create expected dates in local time, matching the implementation
      const expectedStart = new Date('2025-01-15T12:00:00Z');
      expectedStart.setDate(expectedStart.getDate() - 30);
      expectedStart.setHours(0, 0, 0, 0);
      const expectedEnd = new Date('2025-01-15T12:00:00Z');
      expectedEnd.setHours(23, 59, 59, 999);

      expect(result.startDate.getTime()).toBe(expectedStart.getTime());
      expect(result.endDate.getTime()).toBe(expectedEnd.getTime());
    });

    it('should validate custom period correctly', () => {
      const options = {
        period: 'custom' as const,
        startDate: '2025-01-01',
        endDate: '2025-01-10',
      };

      const result = validateDateRange(options);

      expect(result.startDate).toEqual(new Date('2025-01-01'));
      expect(result.endDate).toEqual(new Date('2025-01-10'));
    });

    it('should throw error for custom period without dates', () => {
      expect(() => {
        validateDateRange({ period: 'custom' });
      }).toThrow(AppError);
    });

    it('should throw error for custom period with start date after end date', () => {
      expect(() => {
        validateDateRange({
          period: 'custom',
          startDate: '2025-01-10',
          endDate: '2025-01-05',
        });
      }).toThrow(AppError);
    });

    it('should throw error for custom period with future end date', () => {
      expect(() => {
        validateDateRange({
          period: 'custom',
          startDate: '2025-01-01',
          endDate: '2025-01-20', // Future date
        });
      }).toThrow(AppError);
    });

    it('should throw error for invalid period', () => {
      expect(() => {
        validateDateRange({ period: 'invalid' as any });
      }).toThrow(AppError);
    });
  });

  describe('parseDate', () => {
    it('should parse valid date string', () => {
      const result = parseDate('2025-01-15');
      expect(result).toEqual(new Date('2025-01-15'));
    });

    it('should throw error for invalid date string', () => {
      expect(() => {
        parseDate('invalid-date');
      }).toThrow(AppError);
    });

    it('should throw error for empty date string', () => {
      expect(() => {
        parseDate('');
      }).toThrow(AppError);
    });
  });

  describe('validateCurrency', () => {
    it('should validate USD currency', () => {
      const result = validateCurrency('USD');
      expect(result).toBe('USD');
    });

    it('should validate JPY currency', () => {
      const result = validateCurrency('JPY');
      expect(result).toBe('JPY');
    });

    it('should throw error for invalid currency', () => {
      expect(() => {
        validateCurrency('EUR');
      }).toThrow(AppError);
    });
  });

  describe('validateFormat', () => {
    it('should validate table format', () => {
      const result = validateFormat('table');
      expect(result).toBe('table');
    });

    it('should validate json format', () => {
      const result = validateFormat('json');
      expect(result).toBe('json');
    });

    it('should validate csv format', () => {
      const result = validateFormat('csv');
      expect(result).toBe('csv');
    });

    it('should throw error for invalid format', () => {
      expect(() => {
        validateFormat('xml');
      }).toThrow(AppError);
    });
  });
});