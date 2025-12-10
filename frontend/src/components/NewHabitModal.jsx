import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, ChevronDown, Calendar, Loader2, X } from "lucide-react";
import { apiFetch } from "../lib/api";
import { toast } from "sonner";

const weekDaysLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function NewHabitModal({ isOpen, onClose, habitToEdit, onSuccess }) {
  const [title, setTitle] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [frequency, setFrequency] = useState('daily'); 
  const [weekDays, setWeekDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [monthlyDay, setMonthlyDay] = useState('');
  const [specificDate, setSpecificDate] = useState(''); 
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setTimeStart(habitToEdit.time_start || '');
      setTimeEnd(habitToEdit.time_end || '');

      if (habitToEdit.specific_date) {
        setIsRecurring(false);
        setSpecificDate(new Date(habitToEdit.specific_date).toISOString().split('T')[0]);
      } else {
        setIsRecurring(true);
        // Infer frequency from weekDays
        // This is a simplification. Ideally backend sends the frequency type.
        // Assuming if all days are selected -> daily
        // If specific days -> weekly
        // If monthly_day is set -> monthly
        
        if (habitToEdit.monthly_day) {
            setFrequency('monthly');
            setMonthlyDay(habitToEdit.monthly_day);
        } else if (habitToEdit.week_days && habitToEdit.week_days.length === 7) {
            setFrequency('daily');
            setWeekDays([0, 1, 2, 3, 4, 5, 6]);
        } else {
            setFrequency('weekly');
            // habitToEdit.week_days comes as array of objects { week_day: 0 } or just numbers depending on backend
            // Assuming backend returns array of objects from relation
            const days = habitToEdit.week_days?.map(d => d.week_day ?? d) || [];
            setWeekDays(days);
        }
      }
    } else {
      // Reset
      setTitle('');
      setIsRecurring(true);
      setFrequency('daily');
      setWeekDays([0, 1, 2, 3, 4, 5, 6]);
      setMonthlyDay('');
      setSpecificDate('');
      setTimeStart('');
      setTimeEnd('');
    }
  }, [habitToEdit, isOpen]);

  const toggleWeekDay = (dayIndex) => {
    if (weekDays.includes(dayIndex)) {
      setWeekDays(weekDays.filter(day => day !== dayIndex));
    } else {
      setWeekDays([...weekDays, dayIndex]);
    }
  };

  async function handleSave(event) {
    event.preventDefault();
    if (isLoading) return;

    if (!title) {
      toast.error("Informe o nome do hábito.");
      return;
    }

    setIsLoading(true);

    let finalWeekDays = [];
    let finalMonthlyDay = null;
    let finalSpecificDate = null;

    if (!isRecurring) {
        if (!specificDate) {
             toast.error("Informe a data para o hábito único.");
             setIsLoading(false);
             return;
        }
        finalSpecificDate = specificDate;
    } else {
        if (frequency === 'daily') {
            finalWeekDays = [0, 1, 2, 3, 4, 5, 6];
        } else if (frequency === 'weekly') {
            finalWeekDays = weekDays;
        } else if (frequency === 'monthly') {
            if (!monthlyDay || monthlyDay < 1 || monthlyDay > 31) {
              toast.error("Informe um dia do mês válido (1-31).");
              setIsLoading(false);
              return;
            }
            finalMonthlyDay = parseInt(monthlyDay);
        }
    }

    if (isRecurring && frequency !== 'monthly' && finalWeekDays.length === 0) {
        toast.error("Selecione pelo menos um dia.");
        setIsLoading(false);
        return;
    }

    try {
      const body = {
        title,
        weekDays: finalWeekDays,
        monthlyDay: finalMonthlyDay,
        specificDate: finalSpecificDate ? `${finalSpecificDate}T12:00:00` : null,
        timeStart,
        timeEnd,
      };

      if (habitToEdit) {
        await apiFetch(`/habits/${habitToEdit.id}`, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
        toast.success('Hábito atualizado!');
      } else {
        await apiFetch('/habits', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        toast.success('Hábito criado!');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="w-screen h-screen bg-black/80 fixed inset-0 z-50" />
        <Dialog.Content className="fixed p-6 bg-zinc-900 rounded-2xl w-full max-w-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 border border-zinc-800 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-bold text-white">
              {habitToEdit ? 'Editar Hábito' : 'Novo Hábito'}
            </Dialog.Title>
            <Dialog.Close className="text-zinc-400 hover:text-zinc-200">
                <X size={24} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <label htmlFor="title" className="font-semibold leading-tight text-white">
                Qual o comprometimento?
                </label>
                <input 
                type="text" 
                id="title"
                placeholder="Ex: Exercícios, dormir bem, etc..."
                className="p-4 rounded-lg bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
                value={title}
                onChange={event => setTitle(event.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="font-semibold leading-tight text-sm text-zinc-300">
                Horário (Opcional)
                </label>
                <div className="flex gap-4">
                <div className="flex-1">
                    <input 
                    type="time" 
                    value={timeStart}
                    onChange={e => setTimeStart(e.target.value)}
                    className="w-full p-3 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-violet-600 [color-scheme:dark]"
                    />
                </div>
                <div className="flex-1">
                    <input 
                    type="time" 
                    value={timeEnd}
                    onChange={e => setTimeEnd(e.target.value)}
                    className="w-full p-3 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-violet-600 [color-scheme:dark]"
                    />
                </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div 
                onClick={() => setIsRecurring(!isRecurring)}
                className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors ${isRecurring ? 'bg-green-500' : 'bg-zinc-800 border border-zinc-700'}`}
                >
                {isRecurring && <Check size={16} className="text-white" />}
                </div>
                <span className="text-white select-none cursor-pointer" onClick={() => setIsRecurring(!isRecurring)}>
                Repetir este hábito?
                </span>
            </div>

            {isRecurring ? (
                <div className="flex flex-col gap-4 pl-4 border-l-2 border-zinc-800">
                <div className="flex flex-col gap-2">
                    <label className="font-semibold leading-tight text-sm text-zinc-300">
                    Frequência
                    </label>
                    <div className="relative">
                    <select 
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="w-full p-3 rounded-lg bg-zinc-800 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-600"
                    >
                        <option value="daily">Todo dia</option>
                        <option value="weekly">Semanalmente</option>
                        <option value="monthly">Mensalmente</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 text-zinc-400 pointer-events-none" size={16} />
                    </div>
                </div>

                {frequency === 'weekly' && (
                    <div className="flex flex-col gap-2 mt-2">
                    <div className="flex flex-wrap gap-2">
                        {weekDaysLabels.map((day, index) => (
                        <button 
                            key={index}
                            type="button"
                            onClick={() => toggleWeekDay(index)}
                            className={`
                            w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all
                            ${weekDays.includes(index) 
                                ? 'bg-violet-600 border-violet-500 text-white' 
                                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'}
                            `}
                        >
                            {day}
                        </button>
                        ))}
                    </div>
                    </div>
                )}

                {frequency === 'monthly' && (
                    <div className="flex flex-col gap-2 mt-2">
                    <label className="font-semibold leading-tight text-sm text-zinc-300">
                        Dia do mês:
                    </label>
                    <input 
                        type="number" 
                        min="1" max="31"
                        value={monthlyDay}
                        onChange={e => setMonthlyDay(e.target.value)}
                        className="w-24 p-3 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
                    />
                    </div>
                )}
                </div>
            ) : (
                <div className="flex flex-col gap-4 pl-4 border-l-2 border-violet-500/50">
                <div className="flex flex-col gap-2">
                    <label className="font-semibold leading-tight text-sm text-zinc-300 flex items-center gap-2">
                    <Calendar size={16} className="text-violet-500"/> Data
                    </label>
                    <input 
                    type="date"
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                    className="w-full p-3 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-violet-600 [color-scheme:dark]"
                    />
                </div>
                </div>
            )}

            <button 
                type="submit" 
                disabled={isLoading}
                className="mt-6 w-full p-4 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-3 group"
            >
                {isLoading ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    Salvando...
                </>
                ) : (
                <>
                    <Check size={20} className="font-bold" />
                    Confirmar
                </>
                )}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
