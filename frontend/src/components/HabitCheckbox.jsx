import React from 'react';
import { Check, Calendar, Clock, Trash2 } from 'lucide-react';

export function HabitCheckbox({ title, time, checked, onCheckedChange, disabled, type = "recurring", onDelete }) {
  const isOneTime = type === 'one-time';
  
  const activeColorClass = isOneTime ? 'bg-sky-500 border-sky-500' : 'bg-green-500 border-green-500';
  const hoverBorderClass = isOneTime ? 'group-hover:border-sky-500' : 'group-hover:border-violet-500';
  const textHoverClass = isOneTime ? 'group-hover:text-sky-300' : 'group-hover:text-violet-300';

  return (
    <div 
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={`flex items-center gap-3 group focus:outline-none cursor-pointer bg-zinc-900/50 p-4 rounded-xl border border-transparent transition-all relative overflow-hidden w-full ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-zinc-800'}`}
    >
      {isOneTime && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500/50" />
      )}

      <div 
        className={`
          h-8 w-8 rounded-lg flex items-center justify-center border-2 transition-all flex-shrink-0
          ${checked 
            ? activeColorClass 
            : `bg-zinc-900 border-zinc-800 ${hoverBorderClass}`}
        `}
      >
        {checked && <Check size={20} className="text-white" />}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span 
            className={`font-semibold text-lg md:text-xl leading-tight transition-colors select-none truncate
              ${checked ? 'text-zinc-500 line-through' : `text-white ${textHoverClass}`}
            `}
          >
            {title}
          </span>
          
          {isOneTime && (
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-sky-900/40 text-sky-400 border border-sky-900/50 hidden sm:inline-block">
              Única
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          {isOneTime ? (
            <Calendar size={12} className={checked ? 'text-zinc-600' : 'text-sky-400'} />
          ) : (
            <Clock size={12} className={checked ? 'text-zinc-600' : 'text-zinc-400'} />
          )}
          <span className={`text-xs ${checked ? 'text-zinc-600' : 'text-zinc-400'}`}>
            {isOneTime ? (time ? `Agendado para: ${time}` : 'Agendado') : (time ? `Horário: ${time}` : 'Dia todo')}
          </span>
        </div>
      </div>

      {onDelete && (
        <button 
          onClick={(e) => {
            e.stopPropagation(); 
            onDelete();
          }}
          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
          title="Excluir de hoje"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  )
}