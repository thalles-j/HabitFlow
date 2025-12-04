import React, { useState } from 'react';
import { Header } from '../components/Header';
import { SummaryTable } from '../components/SummaryTable';
import { HabitsList } from '../components/HabitsList';
import { ScheduledHabitsList } from '../components/ScheduledHabitsList';
import { CompletionModal } from '../components/CompletionModal';
import { Footer } from '../components/Footer';
import '../lib/dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { OrbitProgress } from 'react-loading-indicators';

dayjs.locale('pt-br');

export function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [habitsListKey, setHabitsListKey] = useState(0); // Key to refresh the sidebar list
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  
  const [loadingStates, setLoadingStates] = useState({
    summary: true,
    habitsList: true,
    scheduledHabits: true
  });

  const handleLoaded = (component) => {
    setLoadingStates(prev => ({ ...prev, [component]: false }));
  };

  const isLoading = Object.values(loadingStates).some(state => state);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleCompletedChanged = (completed, total) => {
    setCompletedCount(completed);
    setTotalCount(total);
    setRefreshKey(prev => prev + 1); // Refresh summary table to show updated colors
  };

  const handleHabitCreated = () => {
    setHabitsListKey(prev => prev + 1); // Refresh sidebar list
    setRefreshKey(prev => prev + 1); // Refresh summary table (if needed)
  };

  const dateTitle = dayjs(selectedDate).format('DD/MM');
  const weekDay = dayjs(selectedDate).format('dddd');
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#09090A] flex flex-col items-center text-white font-sans selection:bg-violet-500 selection:text-white relative">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090A]">
          <OrbitProgress color="#d35eff" size="medium" text="" textColor="#20017e" />
        </div>
      )}
      
      <div className={`w-full max-w-5xl px-4 py-8 md:px-6 md:py-12 flex-1 ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}`}>
        <Header onHabitCreated={handleHabitCreated} />

        <SummaryTable 
          key={refreshKey} 
          onDateClick={handleDateClick} 
          selectedDate={selectedDate} 
          onLoaded={() => handleLoaded('summary')}
        />

        {/* Layout Grid: Lista do Dia (Principal) + Sidebar (Programados) */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 md:gap-12">
          
          {/* Coluna Principal: Check-in de Hoje */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight capitalize">
                {weekDay} <span className="text-zinc-400 font-normal text-lg md:text-xl ml-2">{dateTitle}</span>
              </h2>
              <span className="text-xs md:text-sm text-zinc-500 font-medium">{percentage}% completado</span>
            </div>

            {/* Barra de Progresso */}
            <div className="h-3 rounded-xl bg-zinc-700 w-full mb-4 overflow-hidden">
              <div 
                className="h-full rounded-xl bg-violet-600 transition-all duration-500 shadow-[0_0_10px_#7c3aed]"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="w-full mt-4">
              {/* --- LISTA DE HÁBITOS DO DIA --- */}
              <HabitsList 
                date={selectedDate} 
                onCompletedChanged={handleCompletedChanged} 
                onDayCompleted={() => setIsCompletionModalOpen(true)}
                onLoaded={() => handleLoaded('habitsList')}
              />
            </div>
          </div>

          {/* Coluna Lateral: Hábitos Programados */}
          <div className="mt-8 md:mt-2">
            <ScheduledHabitsList 
              key={habitsListKey} 
              onLoaded={() => handleLoaded('scheduledHabits')}
            />
          </div>

        </div>
      </div>
      
      <Footer />
      <CompletionModal isOpen={isCompletionModalOpen} onClose={setIsCompletionModalOpen} />
    </div>
  );
}