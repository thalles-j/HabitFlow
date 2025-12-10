import { describe, it, expect } from 'vitest';
import { generateSummaryDates } from '../utils/generate-summary-dates';
import dayjs from 'dayjs';

describe('generateSummaryDates', () => {
  it('should generate exactly 105 dates (15 weeks)', () => {
    const dates = generateSummaryDates();
    expect(dates).toHaveLength(15 * 7);
  });

  it('should start from the beginning of the week, one month ago', () => {
    const dates = generateSummaryDates();
    const firstDate = dayjs(dates[0]);
    
    // Logic from implementation: dayjs().subtract(1, 'month').startOf('week')
    const expectedStart = dayjs().subtract(1, 'month').startOf('week');
    
    // Compare dates ignoring time
    expect(firstDate.format('YYYY-MM-DD')).toBe(expectedStart.format('YYYY-MM-DD'));
  });

  it('should be consecutive days', () => {
    const dates = generateSummaryDates();
    
    for (let i = 0; i < dates.length - 1; i++) {
      const current = dayjs(dates[i]);
      const next = dayjs(dates[i + 1]);
      expect(next.diff(current, 'day')).toBe(1);
    }
  });
});
