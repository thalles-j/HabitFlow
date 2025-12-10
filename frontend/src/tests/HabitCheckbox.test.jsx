import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HabitCheckbox } from '../components/HabitCheckbox';

describe('HabitCheckbox', () => {
  const mockOnCheckedChange = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    render(
      <HabitCheckbox
        title="Drink Water"
        checked={false}
        onCheckedChange={mockOnCheckedChange}
      />
    );
    expect(screen.getByText('Drink Water')).toBeInTheDocument();
  });

  it('should handle click to toggle', () => {
    render(
      <HabitCheckbox
        title="Drink Water"
        checked={false}
        onCheckedChange={mockOnCheckedChange}
      />
    );
    
    // Click the container div (traversing up from text)
    // span -> div(gap-2) -> div(flex-col) -> div(root)
    const checkbox = screen.getByText('Drink Water').closest('div').parentElement.parentElement;
    fireEvent.click(checkbox);
    expect(mockOnCheckedChange).toHaveBeenCalledWith(true);
  });

  it('should not toggle if disabled', () => {
    render(
      <HabitCheckbox
        title="Drink Water"
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        disabled={true}
      />
    );
    
    const checkbox = screen.getByText('Drink Water').closest('div').parentElement.parentElement;
    fireEvent.click(checkbox);
    expect(mockOnCheckedChange).not.toHaveBeenCalled();
  });

  it('should render one-time habit style', () => {
    render(
      <HabitCheckbox
        title="Meeting"
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        type="one-time"
      />
    );
    expect(screen.getByText('Única')).toBeInTheDocument();
  });

  it('should show time if provided', () => {
    render(
      <HabitCheckbox
        title="Meeting"
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        time="10:00"
      />
    );
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
  });

  it('should call onEdit and onDelete', () => {
    render(
      <HabitCheckbox
        title="Drink Water"
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByTitle('Editar hábito');
    const deleteButton = screen.getByTitle('Excluir de hoje');

    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalled();
    expect(mockOnCheckedChange).not.toHaveBeenCalled();

    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalled();
  });
});
