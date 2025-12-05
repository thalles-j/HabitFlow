import React, { useEffect, useState, useRef } from "react"
import { generateSummaryDates } from "../utils/generate-summary-dates"
import { HabitDay } from "./HabitDay"
import { apiFetch } from "../lib/api"
import dayjs from "dayjs"
import { OrbitProgress } from 'react-loading-indicators';

const weekDays = [
  'D',
  'S',
  'T',
  'Q',
  'Q',
  'S',
  'S',
]

const summaryDates = generateSummaryDates()

const minimumSummaryDatesSize = 18 * 7 // 18 weeks
const amountOfDaysToFill = minimumSummaryDatesSize - summaryDates.length

export function SummaryTable({ onDateClick, selectedDate, onLoaded, refreshTrigger }) {
  const [summary, setSummary] = useState(null)
  const scrollRef = useRef(null)
  const [isDown, setIsDown] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  useEffect(() => {
    apiFetch('/summary').then(response => {
      if (response) setSummary(response)
      else setSummary([])
      if (onLoaded) onLoaded();
    })
  }, [refreshTrigger])

  if (!summary) {
    return null;
  }

  const handleMouseDown = (e) => {
    setIsDown(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseLeave = () => {
    setIsDown(false)
  }

  const handleMouseUp = () => {
    setIsDown(false)
  }

  const handleMouseMove = (e) => {
    if (!isDown) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2 // scroll-fast
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  return (
    <div className="w-full flex flex-col items-center mt-3 mb-2 md:mt-0 md:mb-12">
      {/* Container Flex para alinhar Dias da Semana (Fixo) + Calendário (Scroll) */}
      <div className="w-full flex gap-2 md:gap-3 justify-start md:justify-center px-2 md:px-0">
        
        {/* Dias da Semana Fixos */}
        <div className="grid grid-rows-7 gap-1.5 md:gap-3 pr-2 select-none flex-shrink-0 pt-2">
          {weekDays.map((weekDay, i) => {
            return (
              <div 
                key={`${weekDay}-${i}`} 
                className="text-zinc-400 text-xs md:text-base font-bold h-6 w-6 md:h-9 md:w-9 flex items-center justify-center"
              >
                {weekDay}
              </div>
            )
          })}
        </div>

        {/* Área de Scroll do Calendário */}
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="overflow-x-auto p-2 pb-2 md:pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
        >
          <div className="grid grid-rows-7 grid-flow-col gap-1.5 md:gap-3">
            {summaryDates.map(date => {
              const dayInSummary = summary.find(day => {
                return dayjs(date).format('YYYY-MM-DD') === dayjs(day.date).utc().format('YYYY-MM-DD')
              })

              const isSelected = selectedDate && dayjs(date).isSame(selectedDate, 'day');
              const isToday = dayjs(date).isSame(dayjs(), 'day');

              return (
                <HabitDay 
                  key={date.toString()}
                  date={date}
                  amount={dayInSummary?.amount} 
                  defaultCompleted={dayInSummary?.completed} 
                  onClick={onDateClick}
                  isSelected={isSelected}
                  isToday={isToday}
                />
              )
            })}

            {amountOfDaysToFill > 0 && Array.from({ length: amountOfDaysToFill }).map((_, i) => {
              return (
                <div 
                  key={i} 
                  className="w-6 h-6 md:w-9 md:h-9 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed"
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-2 w-full px-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-zinc-900 border border-zinc-800" />
          <span className="text-zinc-400 text-xs md:text-sm font-medium">Vazio</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-violet-700 border border-violet-600" />
          <span className="text-zinc-400 text-xs md:text-sm font-medium">Em andamento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500 border border-green-400" />
          <span className="text-zinc-400 text-xs md:text-sm font-medium">Concluído</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border border-white text-black flex items-center justify-center text-[10px] font-bold"></div>
          <span className="text-zinc-400 text-xs md:text-sm font-medium">Selecionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-zinc-900 border border-zinc-800 ring-2 ring-blue-500 ring-offset-1 ring-offset-background" />
          <span className="text-zinc-400 text-xs md:text-sm font-medium">Dia atual</span>
        </div>
      </div>
    </div>
  )
} 