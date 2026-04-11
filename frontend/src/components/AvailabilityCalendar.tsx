"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getRoomAvailability, type BookedRange } from "@/services/api";

type AvailabilityCalendarProps = {
  roomId: string;
  /** Optional callback when user selects a date range */
  onRangeSelect?: (from: string | null, to: string | null) => void;
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toMonthString(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function isDateInRange(dateStr: string, from: string, to: string): boolean {
  return dateStr >= from && dateStr < to;
}

export default function AvailabilityCalendar({
  roomId,
  onRangeSelect,
}: AvailabilityCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Selection state for date range picking
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);
  const [selectedTo, setSelectedTo] = useState<string | null>(null);

  const todayStr = toDateString(today);

  // Fetch availability when month/year changes
  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const monthStr = toMonthString(viewYear, viewMonth);
      const data = await getRoomAvailability(roomId, monthStr);
      setBookedRanges(data.booked);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load availability");
    } finally {
      setLoading(false);
    }
  }, [roomId, viewYear, viewMonth]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Build a set of booked date strings for quick lookup
  const bookedDates = useMemo(() => {
    const set = new Set<string>();
    for (const range of bookedRanges) {
      const start = new Date(range.from);
      const end = new Date(range.to);
      const cursor = new Date(start);
      while (cursor < end) {
        set.add(toDateString(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return set;
  }, [bookedRanges]);

  // Calendar grid generation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startPad = firstDay.getDay(); // 0=Sun

    const days: Array<{ dateStr: string; dayNum: number; inMonth: boolean }> = [];

    // Padding for days before the 1st
    for (let i = 0; i < startPad; i++) {
      days.push({ dateStr: "", dayNum: 0, inMonth: false });
    }

    // Actual days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = toDateString(new Date(viewYear, viewMonth, d));
      days.push({ dateStr, dayNum: d, inMonth: true });
    }

    return days;
  }, [viewYear, viewMonth]);

  function handlePrevMonth() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function handleDayClick(dateStr: string) {
    if (!dateStr) return;
    if (dateStr < todayStr) return; // Can't select past dates

    if (!selectedFrom || (selectedFrom && selectedTo)) {
      // Start new selection
      setSelectedFrom(dateStr);
      setSelectedTo(null);
      onRangeSelect?.(dateStr, null);
    } else {
      // Complete the range
      if (dateStr <= selectedFrom) {
        setSelectedFrom(dateStr);
        setSelectedTo(null);
        onRangeSelect?.(dateStr, null);
      } else {
        setSelectedTo(dateStr);
        onRangeSelect?.(selectedFrom, dateStr);
      }
    }
  }

  // Check if selected range has any conflicts
  const selectionHasConflict = useMemo(() => {
    if (!selectedFrom || !selectedTo) return false;
    for (const range of bookedRanges) {
      if (selectedFrom < range.to && selectedTo > range.from) {
        return true;
      }
    }
    return false;
  }, [selectedFrom, selectedTo, bookedRanges]);

  function getDayClasses(dateStr: string) {
    if (!dateStr) return "";

    const isPast = dateStr < todayStr;
    const isBooked = bookedDates.has(dateStr);
    const isSelectedStart = dateStr === selectedFrom;
    const isSelectedEnd = dateStr === selectedTo;
    const isInSelection =
      selectedFrom && selectedTo && dateStr > selectedFrom && dateStr < selectedTo;

    let classes = "relative h-10 w-full rounded-lg text-sm font-medium transition ";

    if (isPast) {
      classes += "text-gray-300 cursor-default ";
    } else if (isBooked) {
      classes += "bg-red-100 text-red-600 cursor-default ";
    } else if (isSelectedStart || isSelectedEnd) {
      classes += "bg-blue-600 text-white cursor-pointer ";
    } else if (isInSelection) {
      classes += "bg-blue-100 text-blue-700 cursor-pointer ";
    } else {
      classes += "bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer ";
    }

    return classes;
  }

  const isPrevDisabled =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevMonth}
          disabled={isPrevDisabled}
          className="rounded-lg border border-blue-100 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Prev
        </button>
        <h3 className="text-lg font-semibold text-gray-900">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <button
          type="button"
          onClick={handleNextMonth}
          className="rounded-lg border border-blue-100 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Next →
        </button>
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-500">
          Loading availability...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1">
            {DAY_LABELS.map((label) => (
              <div
                key={label}
                className="py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                {label}
              </div>
            ))}

            {calendarDays.map((day, index) => (
              <div key={index} className="p-0.5">
                {day.inMonth ? (
                  <button
                    type="button"
                    onClick={() => handleDayClick(day.dateStr)}
                    disabled={day.dateStr < todayStr}
                    className={getDayClasses(day.dateStr)}
                  >
                    {day.dayNum}
                  </button>
                ) : (
                  <div className="h-10" />
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-2 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded bg-green-50 border border-green-200" />
              Available
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded bg-red-100 border border-red-200" />
              Booked
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded bg-blue-600" />
              Selected
            </div>
          </div>

          {/* Selection result */}
          {selectedFrom && selectedTo && (
            <div
              className={`rounded-lg border p-4 text-sm ${
                selectionHasConflict
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-green-200 bg-green-50 text-green-700"
              }`}
            >
              {selectionHasConflict ? (
                <p className="font-medium">
                  Not available — the room is already booked for some of the selected dates ({selectedFrom} to {selectedTo}).
                </p>
              ) : (
                <p className="font-medium">
                  Available! The room is free from {selectedFrom} to {selectedTo}.
                </p>
              )}
            </div>
          )}

          {selectedFrom && !selectedTo && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
              Select a check-out date to check availability.
            </div>
          )}
        </>
      )}
    </div>
  );
}
