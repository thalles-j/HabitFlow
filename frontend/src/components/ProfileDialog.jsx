import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, User, Mail, Lock, Save, LogOut } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function ProfileDialog({ children }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setName(user.name);
      setEmail(user.email);
    }
  }, []);

  async function handleUpdateProfile(e) {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmNewPassword) {
      toast.error('As novas senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          email,
          currentPassword,
          newPassword: newPassword || undefined,
        }),
      });

      // Update local storage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        localStorage.setItem('user', JSON.stringify({ ...user, name, email }));
      }

      toast.success('Perfil atualizado com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      toast.error('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    toast.success('Você saiu da conta.');
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="w-screen h-screen bg-black/80 fixed inset-0 z-50" />

        <Dialog.Content className="fixed p-10 bg-zinc-900 rounded-2xl w-full max-w-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 border border-zinc-800 max-h-[90vh] overflow-y-auto">
          <Dialog.Close className="absolute right-6 top-6 text-zinc-400 rounded-lg hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-zinc-900">
            <X size={24} aria-label="Fechar" />
          </Dialog.Close>
          
          <Dialog.Title className="text-3xl leading-tight font-extrabold mb-8">
            Meu Perfil
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Atualize suas informações de perfil, como nome, email e senha.
          </Dialog.Description>

          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="font-semibold leading-tight text-zinc-200">Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-4 pl-10 rounded-lg bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-semibold leading-tight text-zinc-200">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-4 pl-10 rounded-lg bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
                  required
                />
              </div>
            </div>

            <div className="h-px bg-zinc-800 my-2" />

            <div className="flex flex-col gap-2">
              <label htmlFor="currentPassword" className="font-semibold leading-tight text-zinc-200">Senha Atual (para confirmar)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="w-full p-4 pl-10 rounded-lg bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="newPassword" className="font-semibold leading-tight text-zinc-200">Nova Senha (opcional)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  className="w-full p-4 pl-10 rounded-lg bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
                />
              </div>
            </div>

            {newPassword && (
              <div className="flex flex-col gap-2">
                <label htmlFor="confirmNewPassword" className="font-semibold leading-tight text-zinc-200">Confirmar Nova Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input
                    type="password"
                    id="confirmNewPassword"
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirme a nova senha"
                    className="w-full p-4 pl-10 rounded-lg bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
                    required
                  />
                </div>
              </div>
            )}

            {/* Botão de Salvar */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-6 rounded-lg p-4 flex items-center justify-center gap-3 font-semibold bg-green-600 hover:bg-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Salvando...' : (
                <>
                  <Save size={20} />
                  Salvar Alterações
                </>
              )}
            </button>

            <button 
              type="button" 
              onClick={handleLogout}
              className="rounded-lg p-4 flex items-center justify-center gap-3 font-semibold bg-zinc-800 hover:bg-red-500/10 hover:text-red-500 text-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
            >
              <LogOut size={20} />
              Sair da conta
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}