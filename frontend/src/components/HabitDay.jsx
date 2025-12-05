import clsx from 'clsx';
import React from 'react';
import dayjs from 'dayjs';

export function HabitDay({ amount = 0, defaultCompleted = 0, date, onClick, isSelected, isToday }) {
  const completedPercentage = amount > 0 ? Math.min(100, Math.round((defaultCompleted / amount) * 100)) : 0
  const dayNumber = date ? dayjs(date).date() : '';

  return (
    <button 
      onClick={() => onClick(date)}
      className={clsx('w-6 h-6 md:w-9 md:h-9 border-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-background flex items-center justify-center font-bold text-[10px] md:text-xs', {
        // Selected state (Highest priority)
        'bg-white border-white text-black': isSelected,
        
        // Empty state
        'bg-zinc-900 border-zinc-800 text-zinc-500': completedPercentage === 0 && !isSelected,
        
        // In Progress (Violet)
        'bg-violet-600 border-violet-500 text-white': completedPercentage > 0 && completedPercentage < 100 && !isSelected,

        // Completed (Green)
        'bg-green-500 border-green-400 text-white': completedPercentage === 100 && !isSelected,
        
        // Today ring
        'ring-2 ring-blue-500 ring-offset-2 ring-offset-background': isToday && !isSelected,
      })}
      title={date ? `${date.toLocaleDateString()} - ${completedPercentage}%` : ''}
    >
      {dayNumber}
    </button>
  )
}