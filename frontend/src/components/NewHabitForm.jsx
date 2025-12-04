import { Check, ChevronDown, Calendar } from "lucide-react";
import React, { useState } from "react";
import { apiFetch } from "../lib/api";
import { toast } from "sonner";

const weekDaysLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function NewHabitForm({ onSuccess }) {
  const [title, setTitle] = useState('')
  const [isRecurring, setIsRecurring] = useState(true);
  const [frequency, setFrequency] = useState('daily'); // daily, weekly, monthly
  const [weekDays, setWeekDays] = useState([0, 1, 2, 3, 4, 5, 6]); // Default to all days for daily
  const [monthlyDay, setMonthlyDay] = useState('');
  const [specificDate, setSpecificDate] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');

  async function createNewHabit(event) {
    event.preventDefault()

    if (!title) {
      toast.error("Informe o nome do hábito.");
      return;
    }

    // Logic to determine weekDays based on frequency
    let finalWeekDays = [];
    let finalMonthlyDay = null;
    let finalSpecificDate = null;

    if (!isRecurring) {
        if (!specificDate) {
          toast.error("Informe a data da tarefa.");
          return;
        }
        
        // Prevent past dates
        const selectedDate = new Date(specificDate + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          toast.error("Não é possível criar hábitos no passado.");
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
              return;
            }
            finalMonthlyDay = parseInt(monthlyDay);
        }
    }

    if (isRecurring && frequency !== 'monthly' && finalWeekDays.length === 0) {
        toast.error("Selecione pelo menos um dia.");
        return;
    }

    try {
      await apiFetch('/habits', {
        method: 'POST',
        body: JSON.stringify({
          title,
          weekDays: finalWeekDays,
          monthlyDay: finalMonthlyDay,
          specificDate: finalSpecificDate,
          timeStart,
          timeEnd,
        }),
      })

      setTitle('')
      setWeekDays([])
      setMonthlyDay('')
      setSpecificDate('')
      setTimeStart('')
      setTimeEnd('')
      setIsRecurring(true)
      setFrequency('daily')

      toast.success('Hábito criado com sucesso!')
      if (onSuccess) onSuccess();
      window.location.reload();
    } catch (error) {
      toast.error("Erro ao criar hábito: " + error.message);
    }
  }

  const toggleWeekDay = (dayIndex) => {
    if (weekDays.includes(dayIndex)) {
      setWeekDays(weekDays.filter(day => day !== dayIndex));
    } else {
      setWeekDays([...weekDays, dayIndex]);
    }
  };

  return (
    <form onSubmit={createNewHabit} className="flex flex-col gap-6 mt-6">
      
      {/* Input Título */}
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="font-semibold leading-tight">
          Qual o comprometimento?
        </label>
        <input 
          type="text" 
          id="title"
          placeholder="Ex: Exercícios, dormir bem, etc..."
          className="p-4 rounded-lg bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
          autoFocus
          value={title}
          onChange={event => setTitle(event.target.value)}
        />
      </div>

      {/* Configuração de Horário (Opcional) */}
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
              placeholder="Início"
            />
            <span className="text-xs text-zinc-500 ml-1">Início</span>
          </div>
          <div className="flex-1">
            <input 
              type="time" 
              value={timeEnd}
              onChange={e => setTimeEnd(e.target.value)}
              className="w-full p-3 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-violet-600 [color-scheme:dark]"
              placeholder="Fim"
            />
            <span className="text-xs text-zinc-500 ml-1">Fim</span>
          </div>
        </div>
      </div>

      {/* Toggle Recorrência Sim/Não */}
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

      {/* LÓGICA DE EXIBIÇÃO: Recorrente vs Data Única */}
      {isRecurring ? (
        <div className="flex flex-col gap-4 pl-4 border-l-2 border-zinc-800 animate-in slide-in-from-top-2">
          
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
                <option value="weekly">Semanalmente (Dias específicos)</option>
                <option value="monthly">Mensalmente</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-zinc-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Seletor de Dias da Semana (Só mostra se for SEMANAL) */}
          {frequency === 'weekly' && (
            <div className="flex flex-col gap-2 mt-2">
              <label className="font-semibold leading-tight text-sm text-zinc-300">
                Disponível em quais dias?
              </label>
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

          {/* Input de Dia do Mês (Só mostra se for MENSAL) */}
          {frequency === 'monthly' && (
            <div className="flex flex-col gap-2 mt-2">
              <label className="font-semibold leading-tight text-sm text-zinc-300">
                Todo dia:
              </label>
              <input 
                type="number" 
                min="1" max="31"
                placeholder="1 - 31"
                value={monthlyDay}
                onChange={e => setMonthlyDay(e.target.value)}
                className="w-24 p-3 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
          )}
        </div>
      ) : (
        // --- BLOCO DE TAREFA ÚNICA (NOVO) ---
        <div className="flex flex-col gap-4 pl-4 border-l-2 border-violet-500/50 animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-2">
            <label className="font-semibold leading-tight text-sm text-zinc-300 flex items-center gap-2">
              <Calendar size={16} className="text-violet-500"/> Data da tarefa
            </label>
            <input 
              type="date"
              value={specificDate}
              onChange={(e) => setSpecificDate(e.target.value)}
              className="w-full p-3 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-violet-600 [color-scheme:dark]"
            />
            <span className="text-xs text-zinc-500">
              Esta tarefa aparecerá apenas no dia selecionado.
            </span>
          </div>
        </div>
      )}

      <button 
        type="submit" 
        className="mt-6 w-full p-4 rounded-lg bg-green-600 hover:bg-green-500 transition-colors font-semibold flex items-center justify-center gap-3 group"
      >
        <Check size={20} className="font-bold" />
        Confirmar criação
      </button>

    </form>
  )
}