import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import dayjs from 'dayjs';
import { HabitCheckbox } from './HabitCheckbox';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { OrbitProgress } from 'react-loading-indicators';
import { sortHabits } from '../utils/habit-utils';

export function HabitsList({ date, onCompletedChanged, onDayCompleted, onLoaded, onSummaryRefresh }) {
  const [habitsInfo, setHabitsInfo] = useState()
  const [currentPage, setCurrentPage] = useState(1);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    setHabitsInfo(null); // Clear habits info to show loading state
    // Send date as YYYY-MM-DD to avoid timezone issues
    const dateString = dayjs(date).format('YYYY-MM-DD');
    apiFetch(`/day?date=${dateString}`).then(response => {
      if (response) {
        // Filter possible habits to ensure they were created on or before the selected date
        // This prevents habits created TODAY from appearing in YESTERDAY's list (and lowering the percentage)
        const selectedDateEnd = dayjs(date).endOf('day');
        response.possibleHabits = response.possibleHabits.filter(habit => {
            const isCreatedBefore = dayjs(habit.created_at).isBefore(selectedDateEnd);
            
            // Filter out hidden habits (if the backend returns this relation)
            // This handles the "Delete from day" logic where a habit is hidden for a specific date
            const isHidden = habit.habitHides?.some(hide => 
                dayjs(hide.date).isSame(date, 'day')
            );

            return isCreatedBefore && !isHidden;
        });

        // Sort by creation date descending (recent first)
        sortHabits(response.possibleHabits);
        
        // Filter completed habits to ensure they exist in possible habits
        // This prevents "ghost" progress from habits that were completed but are no longer available for this day
        const validCompletedHabits = response.completedHabits.filter(id => 
          response.possibleHabits.some(h => h.id === id)
        );

        const cleanResponse = {
          ...response,
          completedHabits: validCompletedHabits
        };
        
        setHabitsInfo(cleanResponse)
        onCompletedChanged(validCompletedHabits.length, response.possibleHabits.length)
        setCurrentPage(1); // Reset page on date change
      }
      if (onLoaded) onLoaded();
    }).catch((error) => {
      console.error("Failed to fetch habits:", error);
      toast.error("Erro ao carregar hábitos.");
      if (onLoaded) onLoaded();
    });
  }, [date])

  async function handleToggleHabit(habitId) {
    const isHabitAlreadyCompleted = habitsInfo.completedHabits.includes(habitId)
    
    // Optimistic update
    let completedHabits = []
    if (isHabitAlreadyCompleted) {
      completedHabits = habitsInfo.completedHabits.filter(id => id !== habitId)
    } else {
      completedHabits = [...habitsInfo.completedHabits, habitId]
    }

    setHabitsInfo({
      possibleHabits: habitsInfo.possibleHabits,
      completedHabits,
    })
    
    onCompletedChanged(completedHabits.length, habitsInfo.possibleHabits.length)

    if (!isHabitAlreadyCompleted && completedHabits.length === habitsInfo.possibleHabits.length) {
      if (onDayCompleted) onDayCompleted();
    }

    try {
      await apiFetch(`/habits/${habitId}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({
          date: dayjs(date).format('YYYY-MM-DD') + 'T00:00:00' // Force local midnight
        })
      })
      
      // Refresh summary table only after successful API call to avoid race conditions
      if (onSummaryRefresh) onSummaryRefresh();
      
    } catch (error) {
      console.error("Failed to toggle habit:", error)
      // Revert on error
      setHabitsInfo({
        possibleHabits: habitsInfo.possibleHabits,
        completedHabits: habitsInfo.completedHabits, // Revert to original
      })
      onCompletedChanged(habitsInfo.completedHabits.length, habitsInfo.possibleHabits.length)
      toast.error(`Erro ao atualizar hábito: ${error.message}`)
    }
  }

  async function handleDelete() {
    if (!habitToDelete) return;

    try {
      await apiFetch(`/habits/${habitToDelete.id}`, {
        method: 'DELETE',
      });
      
      const newPossibleHabits = habitsInfo.possibleHabits.filter(h => h.id !== habitToDelete.id);
      const newCompletedHabits = habitsInfo.completedHabits.filter(id => id !== habitToDelete.id);

      setHabitsInfo({
        possibleHabits: newPossibleHabits,
        completedHabits: newCompletedHabits,
      });
      
      onCompletedChanged(newCompletedHabits.length, newPossibleHabits.length);
      toast.success('Hábito excluído!');
      setHabitToDelete(null);
    } catch (error) {
      console.error("Failed to delete habit:", error);
      toast.error('Erro ao excluir hábito.');
    }
  }

  if (!habitsInfo) {
    return (
      <div className="flex justify-center items-center h-32 w-full">
        <OrbitProgress color="#d35eff" size="small" text="" textColor="#20017e" />
      </div>
    )
  }

  const totalPages = Math.ceil(habitsInfo.possibleHabits.length / itemsPerPage);
  
  // Ensure current page is valid after deletions
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentHabits = habitsInfo.possibleHabits.slice(startIndex, startIndex + itemsPerPage);

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="flex flex-col gap-3">
      <Dialog.Root open={!!habitToDelete} onOpenChange={(open) => !open && setHabitToDelete(null)}>
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

      {currentHabits.map(habit => {
        const isOneTime = !!habit.specific_date;
        return (
          <HabitCheckbox
            key={habit.id}
            title={habit.title}
            time={habit.time_start ? (habit.time_end ? `${habit.time_start} - ${habit.time_end}` : `${habit.time_start}`) : null}
            checked={habitsInfo.completedHabits.includes(habit.id)}
            onCheckedChange={() => handleToggleHabit(habit.id)}
            disabled={false}
            type={isOneTime ? 'one-time' : 'recurring'}
            onDelete={() => setHabitToDelete(habit)}
          />
        )
      })}
      {habitsInfo.possibleHabits.length === 0 && (
        <span className="text-zinc-500 text-sm">Nenhum hábito para este dia.</span>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
          <button onClick={goToPrevPage} disabled={currentPage === 1} className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={20} /></button>
          <span className="text-xs font-medium text-zinc-500">{currentPage} de {totalPages}</span>
          <button onClick={goToNextPage} disabled={currentPage === totalPages} className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight size={20} /></button>
        </div>
      )}
    </div>
  )
}