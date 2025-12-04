import React, { useState, useEffect } from 'react';
import { X, Check, ChevronDown, Calendar } from 'lucide-react';
import dayjs from 'dayjs';

export function NewHabitModal({ isOpen, onClose, habitToEdit, onSave }) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [frequency, setFrequency] = useState('weekly'); 
  const [weekDays, setWeekDays] = useState([]);
  const [specificDate, setSpecificDate] = useState(''); 
  const [monthlyDay, setMonthlyDay] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setTimeStart(habitToEdit.time_start || '');
      setTimeEnd(habitToEdit.time_end || '');

      if (habitToEdit.specific_date) {
        setIsRecurring(false);
        setSpecificDate(dayjs(habitToEdit.specific_date).format('YYYY-MM-DD'));
      } else {
        setIsRecurring(true);
        if (habitToEdit.monthly_day) {
          setFrequency('monthly');
          setMonthlyDay(habitToEdit.monthly_day);
        } else if (habitToEdit.weekDays && habitToEdit.weekDays.length === 7) {
             setFrequency('daily');
             setWeekDays([0, 1, 2, 3, 4, 5, 6]);
        } else {
          setFrequency('weekly');
          setWeekDays(habitToEdit.weekDays ? habitToEdit.weekDays.map(d => d.week_day) : []);
        }
      }
    } else {
      // Reset form
      setTitle('');
      setIsRecurring(true);
      setFrequency('weekly');
      setWeekDays([]);
      setSpecificDate(new Date().toISOString().split('T')[0]);
      setMonthlyDay('');
      setTimeStart('');
      setTimeEnd('');
    }
  }, [habitToEdit]);

  const toggleWeekDay = (dayIndex) => {
    if (weekDays.includes(dayIndex)) {
      setWeekDays(weekDays.filter(day => day !== dayIndex));
    } else {
      setWeekDays([...weekDays, dayIndex]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let finalWeekDays = [];
    let finalMonthlyDay = null;
    let finalSpecificDate = null;

    if (isRecurring) {
        if (frequency === 'daily') {
            finalWeekDays = [0, 1, 2, 3, 4, 5, 6];
        } else if (frequency === 'weekly') {
            finalWeekDays = weekDays;
        } else if (frequency === 'monthly') {
            finalMonthlyDay = parseInt(monthlyDay);
        }
    } else {
        finalSpecificDate = specificDate;
    }

    const habitData = {
      id: habitToEdit ? habitToEdit.id : undefined,
      title,
      weekDays: finalWeekDays,
      monthlyDay: finalMonthlyDay,
      specificDate: finalSpecificDate,
      timeStart,
      timeEnd
    };
    onSave(habitData);
  };

  const weekDaysLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <div className="fixed inset-0 w-full h-full bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-800 shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-200">
          <X size={24} />
        </button>

        <h2 className="text-2xl md:text-3xl font-extrabold leading-tight mb-6">
          {habitToEdit ? 'Editar Hábito' : 'Criar Hábito'}
        </h2>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="font-semibold leading-tight">
              Qual o comprometimento?
            </label>
            <input 
              type="text" 
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Exercícios, dormir bem, reunião..."
              className="p-4 rounded-lg bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
              autoFocus
            />
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
            <div className="flex flex-col gap-4 pl-4 border-l-2 border-zinc-800 animate-in slide-in-from-top-2">
              <div className="flex flex-col gap-2">
                <label className="font-semibold leading-tight text-sm text-zinc-300">Frequência</label>
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
                  <label className="font-semibold leading-tight text-sm text-zinc-300">Disponível em quais dias?</label>
                  <div className="flex gap-2 flex-wrap">
                    {weekDaysLabels.map((day, index) => (
                      <button 
                        key={index}
                        type="button"
                        onClick={() => toggleWeekDay(index)}
                        className={`
                          w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all
                          ${weekDays.includes(index) ? 'bg-violet-600 border-violet-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'}
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
                  <label className="font-semibold leading-tight text-sm text-zinc-300">Dia do mês:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="31" 
                    value={monthlyDay}
                    onChange={(e) => setMonthlyDay(e.target.value)}
                    placeholder="1 - 31" 
                    className="w-24 p-3 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-violet-600" 
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 pl-4 border-l-2 border-violet-500/50 animate-in slide-in-from-top-2">
              <div className="flex flex-col gap-2">
                <label className="font-semibold leading-tight text-sm text-zinc-300 flex items-center gap-2"><Calendar size={16} className="text-violet-500"/> Data da tarefa</label>
                <input 
                  type="date"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  className="w-full p-3 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-violet-600 [color-scheme:dark]"
                />
                <span className="text-xs text-zinc-500">Esta tarefa aparecerá apenas no dia selecionado.</span>
              </div>
            </div>
          )}

          <div className="flex gap-4">
             <div className="flex flex-col gap-2 w-1/2">
                <label className="font-semibold leading-tight text-sm text-zinc-300">Início (opcional)</label>
                <input type="time" value={timeStart} onChange={e => setTimeStart(e.target.value)} className="p-3 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-violet-600 [color-scheme:dark]" />
             </div>
             <div className="flex flex-col gap-2 w-1/2">
                <label className="font-semibold leading-tight text-sm text-zinc-300">Fim (opcional)</label>
                <input type="time" value={timeEnd} onChange={e => setTimeEnd(e.target.value)} className="p-3 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-violet-600 [color-scheme:dark]" />
             </div>
          </div>

          <button type="submit" className="mt-6 w-full p-4 rounded-lg bg-green-600 hover:bg-green-500 transition-colors font-semibold flex items-center justify-center gap-3 group">
            <Check size={20} className="font-bold" />
            {habitToEdit ? 'Salvar Alterações' : 'Confirmar criação'}
          </button>
        </form>
      </div>
    </div>
  )
}
