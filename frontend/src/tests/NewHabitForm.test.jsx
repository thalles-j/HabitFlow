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

  it('should create a one-time habit', async () => {
    const { container } = render(<NewHabitForm />);
    
    fireEvent.change(screen.getByPlaceholderText('Ex: Exercícios, dormir bem, etc...'), { target: { value: 'Médico' } });
    
    // Toggle off recurring
    const toggle = screen.getByText('Repetir este hábito?');
    fireEvent.click(toggle);

    // Fill date
    const dateInput = container.querySelector('input[type="date"]');
    
    // Set a future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateString = futureDate.toISOString().split('T')[0];
    
    fireEvent.change(dateInput, { target: { value: dateString } });

    fireEvent.click(screen.getByText('Confirmar criação'));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/habits', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining(`"specificDate":"${dateString}T12:00:00"`),
      }));
    });
  });

  it('should create a weekly habit', async () => {
    render(<NewHabitForm />);
    
    fireEvent.change(screen.getByPlaceholderText('Ex: Exercícios, dormir bem, etc...'), { target: { value: 'Gym' } });
    
    // Select weekly
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'weekly' } });

    // Toggle days. Default is all selected.
    // Deselect Sunday (first 'D')
    const sundayBtn = screen.getAllByText('D')[0];
    fireEvent.click(sundayBtn); 

    fireEvent.click(screen.getByText('Confirmar criação'));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/habits', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"weekDays":[1,2,3,4,5,6]'),
      }));
    });
  });

  it('should create a monthly habit', async () => {
    render(<NewHabitForm />);
    
    fireEvent.change(screen.getByPlaceholderText('Ex: Exercícios, dormir bem, etc...'), { target: { value: 'Pay Bills' } });
    
    // Select monthly
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'monthly' } });

    // Fill day
    const dayInput = screen.getByPlaceholderText('1 - 31');
    fireEvent.change(dayInput, { target: { value: '15' } });

    fireEvent.click(screen.getByText('Confirmar criação'));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/habits', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"monthlyDay":15'),
      }));
    });
  });
});
