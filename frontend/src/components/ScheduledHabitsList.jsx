import React, { useEffect, useState } from 'react';
import { MoreHorizontal, ChevronLeft, ChevronRight, Trash2, Calendar, Repeat, Check } from 'lucide-react';
import { apiFetch } from '../lib/api';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { OrbitProgress } from 'react-loading-indicators';

const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function ScheduledHabitsList({ onLoaded }) {
  const [habits, setHabits] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'recurring', 'one-time'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    apiFetch('/habits').then(response => {
      if (response) setHabits(response);
      else setHabits([]);
      if (onLoaded) onLoaded();
    });
  }, []);

  const filteredHabits = habits ? habits.filter(h => {
    const isOneTime = !!h.specific_date;
    if (filter === 'all') return true;
    if (filter === 'recurring') return !isOneTime;
    if (filter === 'one-time') return isOneTime;
    return true;
  }) : [];

  const totalPages = Math.ceil(filteredHabits.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredHabits.length, totalPages, currentPage]);

  if (!habits) {
    return null;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentHabits = filteredHabits.slice(startIndex, startIndex + itemsPerPage);

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  async function handleDelete() {
    if (!habitToDelete) return;

    try {
      await apiFetch(`/habits/${habitToDelete.id}`, {
        method: 'DELETE',
      });
      
      setHabits(habits.filter(h => h.id !== habitToDelete.id));
      toast.success('Hábito excluído com sucesso!');
      setHabitToDelete(null);
    } catch (error) {
      console.error("Failed to delete habit:", error);
      toast.error('Erro ao excluir hábito.');
    }
  }

  function getFrequencyString(habit) {
    if (habit.specific_date) {
      return dayjs(habit.specific_date).format('DD/MM/YYYY');
    }

    if (habit.monthly_day) {
      return `Todo dia ${habit.monthly_day}`;
    }

    const weekDays = habit.weekDays?.map(wd => wd.week_day);
    if (!weekDays || weekDays.length === 0) return 'Sem recorrência';
    if (weekDays.length === 7) return 'Todos os dias';
    if (weekDays.length === 5 && !weekDays.includes(0) && !weekDays.includes(6)) return 'Dias úteis';
    if (weekDays.length === 2 && weekDays.includes(0) && weekDays.includes(6)) return 'Fim de semana';
    
    return weekDays
      .sort((a, b) => a - b)
      .map(day => weekDayNames[day])
      .join(', ');
  }

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 h-fit flex flex-col justify-between min-h-[300px]">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-zinc-200">Meus Hábitos</h3>
          
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-zinc-400 hover:text-white transition-colors p-2 rounded hover:bg-zinc-800"
            >
              <MoreHorizontal size={20} />
            </button>

            {isMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsMenuOpen(false)} 
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-20 overflow-hidden flex flex-col py-1">
                  <button 
                    onClick={() => { setFilter('all'); setIsMenuOpen(false); setCurrentPage(1); }}
                    className={`px-4 py-2 text-sm text-left hover:bg-zinc-800 flex items-center justify-between ${filter === 'all' ? 'text-violet-400' : 'text-zinc-300'}`}
                  >
                    Todos
                    {filter === 'all' && <Check size={14} />}
                  </button>
                  <button 
                    onClick={() => { setFilter('recurring'); setIsMenuOpen(false); setCurrentPage(1); }}
                    className={`px-4 py-2 text-sm text-left hover:bg-zinc-800 flex items-center justify-between ${filter === 'recurring' ? 'text-violet-400' : 'text-zinc-300'}`}
                  >
                    Recorrentes
                    {filter === 'recurring' && <Check size={14} />}
                  </button>
                  <button 
                    onClick={() => { setFilter('one-time'); setIsMenuOpen(false); setCurrentPage(1); }}
                    className={`px-4 py-2 text-sm text-left hover:bg-zinc-800 flex items-center justify-between ${filter === 'one-time' ? 'text-violet-400' : 'text-zinc-300'}`}
                  >
                    Únicos
                    {filter === 'one-time' && <Check size={14} />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {currentHabits.map((habit) => {
            const isOneTime = !!habit.specific_date;
            return (
              <div key={habit.id} className="flex items-center justify-between pb-4 border-b border-zinc-800 last:border-0 last:pb-0 group">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {isOneTime ? (
                      <Calendar size={16} className="text-sky-400" />
                    ) : (
                      <Repeat size={16} className="text-violet-400" />
                    )}
                    <span className="font-medium text-white">{habit.title}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-6">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${isOneTime ? 'bg-sky-900/30 text-sky-400 border-sky-900/50' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                      {getFrequencyString(habit)}
                    </span>
                    {(habit.time_start || habit.time_end) && (
                       <span className="text-xs text-zinc-500">
                         {habit.time_start} {habit.time_end ? `- ${habit.time_end}` : ''}
                       </span>
                    )}
                  </div>
                </div>
                
                <Dialog.Root open={!!habitToDelete} onOpenChange={(open) => !open && setHabitToDelete(null)}>
                  <Dialog.Trigger asChild>
                    <button 
                      onClick={() => setHabitToDelete(habit)}
                      className="p-2 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                      title="Excluir hábito"
                    >
                      <Trash2 size={18} />
                    </button>
                  </Dialog.Trigger>
                  
                  <Dialog.Portal>
                    <Dialog.Overlay className="w-screen h-screen bg-black/80 fixed inset-0 z-50" />
                    <Dialog.Content className="fixed p-8 bg-zinc-900 rounded-2xl w-full max-w-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 border border-zinc-800">
                      <Dialog.Title className="text-xl font-bold text-white mb-4">
                        Excluir Hábito?
                      </Dialog.Title>
                      <Dialog.Description className="text-zinc-400 mb-6">
                        Você tem certeza que deseja excluir o hábito <strong>{habitToDelete?.title}</strong>? Essa ação não pode ser desfeita.
                      </Dialog.Description>
                      
                      <div className="flex justify-end gap-4">
                        <Dialog.Close asChild>
                          <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition-colors">
                            Cancelar
                          </button>
                        </Dialog.Close>
                        <button 
                          onClick={handleDelete}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors"
                        >
                          Sim, excluir
                        </button>
                      </div>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              </div>
            );
          })}
          {habits.length === 0 && (
            <span className="text-zinc-500 text-sm">Nenhum hábito cadastrado.</span>
          )}
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
          <button onClick={goToPrevPage} disabled={currentPage === 1} className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={20} /></button>
          <span className="text-xs font-medium text-zinc-500">{currentPage} de {totalPages}</span>
          <button onClick={goToNextPage} disabled={currentPage === totalPages} className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight size={20} /></button>
        </div>
      )}
    </div>
  )
}