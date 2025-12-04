import { Plus, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewHabitForm } from './NewHabitForm';
import { ProfileDialog } from './ProfileDialog';
import * as Dialog from '@radix-ui/react-dialog';

export function Header({ onHabitCreated }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [isNewHabitModalOpen, setIsNewHabitModalOpen] = useState(false);

  const loadUser = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserName(parsedUser.name);
      } catch (e) {}
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleSuccess = () => {
    setIsNewHabitModalOpen(false);
    if (onHabitCreated) onHabitCreated();
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex items-center justify-between mb-6 md:mb-12">
      {/* Logo */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
      >
        <div className="bg-violet-600 p-2 rounded-lg">
           <div className="w-5 h-5 bg-white rounded-sm opacity-80" />
        </div>
        <span className="text-xl md:text-2xl font-extrabold text-white">HabitFlow</span>
      </button>

      <div className="flex items-center gap-6">
        {/* Perfil do Usuário */}
        <ProfileDialog onProfileUpdated={loadUser}>
          <button className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-semibold text-zinc-200">{userName || 'Visitante'}</span>
              <span className="text-xs text-zinc-400">Nível 1</span>
            </div>
            <img 
              className="w-10 h-10 rounded-full border-2 border-zinc-800 p-0.5 bg-zinc-900" 
              src={`https://ui-avatars.com/api/?name=${userName || 'User'}&background=random`} 
              alt="Avatar do usuário" 
            />
          </button>
        </ProfileDialog>

        {/* Separador visual */}
        <div className="h-8 w-px bg-zinc-800 hidden sm:block"></div>

        <Dialog.Root open={isNewHabitModalOpen} onOpenChange={setIsNewHabitModalOpen}>
          <Dialog.Trigger 
            type="button"
            className="border border-violet-500 font-semibold rounded-lg px-3 py-2 md:px-4 md:py-2.5 flex items-center gap-2 hover:border-violet-300 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-background"
          >
            <Plus size={20} className="text-violet-500" />
            <span className="text-white text-sm hidden md:inline">Novo hábito</span>
            <span className="text-white text-sm md:hidden">Novo</span>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="w-screen h-screen bg-black/80 fixed inset-0 z-50" />

            <Dialog.Content className="fixed p-10 bg-zinc-900 rounded-2xl w-full max-w-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 border border-zinc-800 max-h-[90vh] overflow-y-auto">
              <Dialog.Close className="absolute right-6 top-6 text-zinc-400 rounded-lg hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-zinc-900">
                <X size={24} aria-label="Fechar" />
              </Dialog.Close>
              
              <Dialog.Title className="text-3xl leading-tight font-extrabold">
                Criar hábito
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                Preencha o formulário abaixo para criar um novo hábito.
              </Dialog.Description>

              <NewHabitForm onSuccess={handleSuccess} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  )
}