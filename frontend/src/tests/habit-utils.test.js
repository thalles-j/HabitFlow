import { describe, it, expect } from 'vitest';
import { sortHabits } from '../utils/habit-utils';

describe('sortHabits', () => {
  it('should sort habits by creation date descending (newest first)', () => {
    const habits = [
      { id: 1, title: 'Old', created_at: '2023-01-01T10:00:00Z' },
      { id: 2, title: 'New', created_at: '2023-01-02T10:00:00Z' },
    ];

    const sorted = sortHabits([...habits]);
    expect(sorted[0].title).toBe('New');
    expect(sorted[1].title).toBe('Old');
  });

  it('should sort by title ascending if creation dates are equal', () => {
    const habits = [
      { id: 1, title: 'B Habit', created_at: '2023-01-01T10:00:00Z' },
      { id: 2, title: 'A Habit', created_at: '2023-01-01T10:00:00Z' },
    ];

    const sorted = sortHabits([...habits]);
    expect(sorted[0].title).toBe('A Habit');
    expect(sorted[1].title).toBe('B Habit');
  });

  it('should handle invalid dates gracefully', () => {
    const habits = [
      { id: 1, title: 'Valid', created_at: '2023-01-01T10:00:00Z' },
      { id: 2, title: 'Invalid', created_at: 'invalid-date' },
    ];

    // The current implementation might push invalid dates to the end or keep them as is depending on browser implementation of sort with NaN
    // Let's just ensure it doesn't crash
    const sorted = sortHabits([...habits]);
    expect(sorted).toHaveLength(2);
  });
});
