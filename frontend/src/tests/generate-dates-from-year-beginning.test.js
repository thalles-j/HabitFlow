import { describe, it, expect, vi } from 'vitest';
import { generateDatesFromYearBeginning } from '../utils/generate-dates-from-year-beginning';
import dayjs from 'dayjs';

describe('generateDatesFromYearBeginning', () => {
  it('should generate an array of dates', () => {
    const dates = generateDatesFromYearBeginning();
    expect(Array.isArray(dates)).toBe(true);
    expect(dates.length).toBeGreaterThan(0);
    expect(dates[0]).toBeInstanceOf(Date);
  });

  it('should start from the beginning of the current year', () => {
    const dates = generateDatesFromYearBeginning();
    const firstDate = dayjs(dates[0]);
    const startOfYear = dayjs().startOf('year');
    
    expect(firstDate.isSame(startOfYear, 'day')).toBe(true);
  });

  it('should include dates up to today', () => {
    const dates = generateDatesFromYearBeginning();
    const lastDate = dayjs(dates[dates.length - 1]);
    const today = dayjs().startOf('day');
    
    // The implementation uses dayjs() which includes time, so today (00:00) is before today (now)
    // So the last date should be today
    expect(lastDate.isSame(today, 'day')).toBe(true);
  });
});
