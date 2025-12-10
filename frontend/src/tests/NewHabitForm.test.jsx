import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewHabitForm } from '../components/NewHabitForm';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../lib/api', () => ({
  apiFetch: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('NewHabitForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form correctly', () => {
    render(<NewHabitForm />);
    expect(screen.getByPlaceholderText('Ex: Exercícios, dormir bem, etc...')).toBeInTheDocument();
  });

  it('should show error if title is missing', async () => {
    render(<NewHabitForm />);
    
    const submitButton = screen.getByText('Confirmar criação');
    fireEvent.click(submitButton);

    expect(toast.error).toHaveBeenCalledWith('Informe o nome do hábito.');
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('should create a daily habit successfully', async () => {
    render(<NewHabitForm />);
    
    // Fill title
    const input = screen.getByPlaceholderText('Ex: Exercícios, dormir bem, etc...');
    fireEvent.change(input, { target: { value: 'Beber água' } });

    // Submit
    const submitButton = screen.getByText('Confirmar criação');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/habits', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"title":"Beber água"'),
      }));
      expect(toast.success).toHaveBeenCalledWith('Hábito criado com sucesso!');
    });
  });
});
