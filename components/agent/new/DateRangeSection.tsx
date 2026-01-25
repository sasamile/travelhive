"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

interface DateRangeSectionProps {
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  durationNights?: number;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
}

export default function DateRangeSection({
  startDate,
  endDate,
  durationDays,
  durationNights,
  onDateRangeChange,
}: DateRangeSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Función para convertir fechas string a DateRange
  const parseDateRange = (startDateStr?: string, endDateStr?: string): DateRange | undefined => {
    if (!startDateStr || !endDateStr) return undefined;
    const from = new Date(startDateStr);
    const to = new Date(endDateStr);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return undefined;
    return { from, to };
  };

  const initialDateRange = useMemo(() => {
    return parseDateRange(startDate, endDate);
  }, [startDate, endDate]);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(initialDateRange);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sincronizar dateRange cuando cambian las props
  useEffect(() => {
    const storeDateRange = parseDateRange(startDate, endDate);
    if (storeDateRange) {
      if (storeDateRange.from && storeDateRange.to) {
        const currentFrom = dateRange?.from?.toISOString();
        const currentTo = dateRange?.to?.toISOString();
        const storeFrom = storeDateRange.from.toISOString();
        const storeTo = storeDateRange.to.toISOString();
        
        if (currentFrom !== storeFrom || currentTo !== storeTo) {
          setDateRange(storeDateRange);
        }
      }
    } else if (!startDate && !endDate && dateRange) {
      setDateRange(undefined);
    }
  }, [startDate, endDate]);

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    onDateRangeChange(range);
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <label className="text-xs sm:text-sm font-semibold text-slate-700 block">Fechas del Viaje</label>
      {mounted && (
        <>
          <div className="w-full overflow-x-auto">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from || new Date()}
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={isMobile ? 1 : 2}
              className="w-full rounded-lg border shadow-sm"
            />
          </div>
          {((durationDays !== undefined && durationDays > 0) || (durationNights !== undefined && durationNights >= 0)) && (
            <div className="text-xs sm:text-sm text-slate-600 mt-2 sm:mt-3 text-center font-medium">
              Duración: {durationDays || 0} {durationDays === 1 ? "día" : "días"}, {durationNights || 0} {durationNights === 1 ? "noche" : "noches"}
            </div>
          )}
        </>
      )}
    </div>
  );
}
