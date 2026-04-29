// Programmed by Rhea Talwar

import { useState, type CSSProperties } from "react";
import Calendar, { type CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarComponent.css";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface CalendarComponentProps {
  // Optional callback fired whenever the user selects a new date.
  onDateChange?: (date: Date) => void;
  // Earliest selectable date — pass new Date() to block past dates.
  minDate?: Date;
  // Days of the current month to highlight as "available" (by day-of-month number).
  // Defaults to an empty set (no highlighting).
  availableDays?: Set<number>;
  // Initial selected date — defaults to today.
  defaultDate?: Date;
  // Uniform scale applied to the whole calendar (1 = original size).
  scale?: number;
}

function CalendarComponent({
  onDateChange,
  minDate,
  availableDays = new Set(),
  defaultDate,
  scale = 1,
}: CalendarComponentProps) {
  const today = new Date();
  const initial = defaultDate ?? today;
  const normalizedScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
  const wrapperStyle: CSSProperties = {
    ["--calendar-base-scale" as string]: String(normalizedScale),
  };

  const [selectedDate, setSelectedDate] = useState<Date>(initial);

  const tileClassName: CalendarProps["tileClassName"] = ({ date, view }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (view === "month") {
      const isSelected = isSameDay(date, selectedDate);
      const isPast = date < today; //check if date is in the past
      const isAvailable =
        date.getFullYear() === selectedDate.getFullYear() &&
        date.getMonth() === selectedDate.getMonth() &&
        availableDays.has(date.getDate());

      let classes = "day-tile";
      if (isSelected) classes += " is-selected";
      else if (isPast) classes += " is-past";
      else if (isAvailable) classes += " is-available";
      return classes;
    }

    if (view === "year") {
      const isSelected =
        date.getFullYear() === selectedDate.getFullYear() &&
        date.getMonth() === selectedDate.getMonth();

      //check if month is in past
      const isPast =
        date.getFullYear() < today.getFullYear() ||
        (date.getFullYear() === today.getFullYear() &&
          date.getMonth() < today.getMonth());

      let classes = "month-tile";
      if (isSelected) classes += " is-selected";
      else if (isPast) classes += " is-past";
      return classes;
    }

    if (view === "decade") {
      const isSelected = date.getFullYear() === selectedDate.getFullYear();
      const isPast = date.getFullYear() < today.getFullYear();

      let classes = "year-tile";
      if (isSelected) classes += " is-selected";
      else if (isPast) classes += " is-past";
      return classes;
    }

    return "";
  };

  return (
    <div className="calendar-wrapper" style={wrapperStyle}>
      <Calendar
        value={selectedDate}
        defaultActiveStartDate={
          new Date(initial.getFullYear(), initial.getMonth(), 1)
        }
        minDate={minDate}
        onChange={(value) => {
          if (value instanceof Date) {
            setSelectedDate(value);
            onDateChange?.(value);
          }
        }}
        showNeighboringMonth={false}
        prev2Label={null}
        next2Label={null}
        formatShortWeekday={(_, date) =>
          date.toLocaleDateString("en-US", { weekday: "narrow" })
        }
        formatMonthYear={(_, date) =>
          date.toLocaleDateString("en-US", { month: "long" }).toUpperCase()
        }
        tileClassName={tileClassName}
        className="custom-calendar"
      />
    </div>
  );
}

export default CalendarComponent;
