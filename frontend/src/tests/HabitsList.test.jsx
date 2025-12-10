import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HabitsList } from '../components/HabitsList';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';
import dayjs from 'dayjs';

// Mock dependencies
vi.mock('../lib/api', () => ({
  apiFetch: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock OrbitProgress since it might cause issues in test env or just to simplify
vi.mock('react-loading-indicators', () => ({
  OrbitProgress: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe('HabitsList', () => {
  const mockDate = new Date('2023-01-01T12:00:00');
  const mockOnCompletedChanged = vi.fn();
  const mockOnLoaded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    // Return a promise that never resolves immediately to check loading state
    apiFetch.mockReturnValue(new Promise(() => {}));
    
    render(
      <HabitsList 
        date={mockDate} 
        onCompletedChanged={mockOnCompletedChanged}
        onLoaded={mockOnLoaded}
      />
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should fetch and render habits', async () => {
    const mockHabits = {
      possibleHabits: [
        { id: 1, title: 'Habit 1', created_at: '2022-12-31T10:00:00' },
        { id: 2, title: 'Habit 2', created_at: '2022-12-31T10:00:00' }
      ],
      completedHabits: [1]
    };

    apiFetch.mockResolvedValue(mockHabits);

    render(
      <HabitsList 
        date={mockDate} 
        onCompletedChanged={mockOnCompletedChanged}
        onLoaded={mockOnLoaded}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Habit 1')).toBeInTheDocument();
      expect(screen.getByText('Habit 2')).toBeInTheDocument();
    });

    expect(mockOnCompletedChanged).toHaveBeenCalledWith(1, 2);
    expect(mockOnLoaded).toHaveBeenCalled();
  });

  it('should handle API error', async () => {
    apiFetch.mockRejectedValue(new Error('API Error'));

    render(
      <HabitsList 
        date={mockDate} 
        onCompletedChanged={mockOnCompletedChanged}
        onLoaded={mockOnLoaded}
      />
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar hábitos.');
    });
    
    expect(mockOnLoaded).toHaveBeenCalled();
  });

  it('should render empty state message', async () => {
    apiFetch.mockResolvedValue({ possibleHabits: [], completedHabits: [] });

    render(
      <HabitsList 
        date={mockDate} 
        onCompletedChanged={mockOnCompletedChanged}
        onLoaded={mockOnLoaded}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Nenhum hábito para este dia.')).toBeInTheDocument();
    });
  });
});
