import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileDialog } from '../components/ProfileDialog';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';
import { BrowserRouter } from 'react-router-dom';

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

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ProfileDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    // Setup default user
    localStorageMock.setItem('user', JSON.stringify({ name: 'Test User', email: 'test@example.com' }));
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <ProfileDialog>
          <button>Open</button>
        </ProfileDialog>
      </BrowserRouter>
    );
  };

  it('should render trigger button', () => {
    renderComponent();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('should load user data from localStorage', async () => {
    renderComponent();
    fireEvent.click(screen.getByText('Open'));
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });
  });

  it('should update profile successfully', async () => {
    apiFetch.mockResolvedValue({});
    renderComponent();
    fireEvent.click(screen.getByText('Open'));

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'New Name' } });
    fireEvent.change(screen.getByLabelText('Senha Atual (para confirmar)'), { target: { value: 'password123' } });
    
    const saveButton = screen.getByText('Salvar Alterações');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/auth/profile', expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('"name":"New Name"'),
      }));
      expect(toast.success).toHaveBeenCalledWith('Perfil atualizado com sucesso!');
    });
  });

  it('should validate password match', async () => {
    renderComponent();
    fireEvent.click(screen.getByText('Open'));

    // Fill new password to show confirm field
    const newPassInput = screen.getByPlaceholderText('Mínimo 8 caracteres');
    fireEvent.change(newPassInput, { target: { value: 'newpass123' } });

    // Now confirm field should be visible
    const confirmPassInput = screen.getByPlaceholderText('Confirme a nova senha');
    fireEvent.change(confirmPassInput, { target: { value: 'mismatch' } });

    // Fill current password (required)
    fireEvent.change(screen.getByLabelText('Senha Atual (para confirmar)'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByText('Salvar Alterações'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('As novas senhas não coincidem.');
      expect(apiFetch).not.toHaveBeenCalled();
    });
  });

  it('should handle logout', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Open'));
    
    fireEvent.click(screen.getByText('Sair da conta'));
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    expect(toast.success).toHaveBeenCalledWith('Você saiu da conta.');
  });
});
