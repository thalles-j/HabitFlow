import clsx from 'clsx';
import React from 'react';

export function HabitDay({ amount = 0, defaultCompleted = 0, date, onClick, isSelected, isToday }) {
  const completedPercentage = amount > 0 ? Math.round((defaultCompleted / amount) * 100) : 0

  return (
    <button 
      onClick={() => onClick(date)}
      className={clsx('w-8 h-8 md:w-10 md:h-10 border-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-background', {
        'bg-zinc-900 border-zinc-800': completedPercentage === 0,
        'bg-violet-900 border-violet-700': completedPercentage > 0 && completedPercentage < 20,
        'bg-violet-800 border-violet-600': completedPercentage >= 20 && completedPercentage < 40,
        'bg-violet-700 border-violet-500': completedPercentage >= 40 && completedPercentage < 60,
        'bg-violet-600 border-violet-500': completedPercentage >= 60 && completedPercentage < 80,
        'bg-violet-500 border-violet-400': completedPercentage >= 80,
        'ring-2 ring-blue-500 ring-offset-2 ring-offset-background': isToday && !isSelected,
        'ring-2 ring-white ring-offset-2 ring-offset-background': isSelected
      })}
      title={date ? `${date.toLocaleDateString()} - ${completedPercentage}%` : ''}
    />
  )
}