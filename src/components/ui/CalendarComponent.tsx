import { useState } from "react";
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
}

function CalendarComponent({
  onDateChange,
  minDate,
  availableDays = new Set(),
  defaultDate,
}: CalendarComponentProps) {
  const today = new Date();
  const initial = defaultDate ?? today;

  const [selectedDate, setSelectedDate] = useState<Date>(initial);

  const tileClassName: CalendarProps["tileClassName"] = ({ date, view }) => {
    if (view === "month") {
      const isAvailable =
        date.getFullYear() === selectedDate.getFullYear() &&
        date.getMonth() === selectedDate.getMonth() &&
        availableDays.has(date.getDate());

      let classes = "day-tile";
      if (isSameDay(date, selectedDate)) {
        classes += " is-selected";
      } else if (isAvailable) {
        classes += " is-available";
      }
      return classes;
    }

    if (view === "year") {
      const isCurrentMonth =
        date.getFullYear() === selectedDate.getFullYear() &&
        date.getMonth() === selectedDate.getMonth();
      let classes = "month-tile";
      if (isCurrentMonth) classes += " is-selected";
      return classes;
    }

    if (view === "decade") {
      const isCurrentYear = date.getFullYear() === selectedDate.getFullYear();
      let classes = "year-tile";
      if (isCurrentYear) classes += " is-selected";
      return classes;
    }

    return "";
  };

  return (
    <div className="calendar-wrapper">
      <Calendar
        value={selectedDate}
        defaultActiveStartDate={new Date(initial.getFullYear(), initial.getMonth(), 1)}
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
