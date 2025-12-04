import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Trophy } from 'lucide-react';

export function CompletionModal({ isOpen, onClose }) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="w-screen h-screen bg-black/80 fixed inset-0 z-50 animate-in fade-in" />
        <Dialog.Content className="fixed p-10 bg-zinc-900 rounded-2xl w-full max-w-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 border border-zinc-800 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
          <Dialog.Close className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-200 focus:outline-none">
            <X size={24} aria-label="Fechar" />
          </Dialog.Close>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20">
              <Trophy size={40} className="text-yellow-500" />
            </div>
            
            <Dialog.Title className="text-3xl font-extrabold text-white mb-2">
              Parabéns!
            </Dialog.Title>
            
            <Dialog.Description className="text-zinc-400 text-lg mb-8">
              Você completou todos os hábitos de hoje. Continue assim!
            </Dialog.Description>

            <button 
              onClick={() => onClose(false)}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
            >
              Continuar focado
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
