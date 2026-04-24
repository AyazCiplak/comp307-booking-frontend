import { useState } from "react";
import Calendar, { type CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarComponent.css";

const REFERENCE_YEAR = 2026;
const REFERENCE_MONTH_INDEX = 3;
const REFERENCE_SELECTED_DAY = 21; //also will set these to TODAY when we have backend
const AVAILABLE_DAYS = new Set([12, 13, 16, 17, 29, 30]); //days that already have bookings, need to update this when we have backend integration

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
}

function CalendarComponent({ onDateChange }: CalendarComponentProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(REFERENCE_YEAR, REFERENCE_MONTH_INDEX, REFERENCE_SELECTED_DAY),
  );

  const tileClassName: CalendarProps["tileClassName"] = ({ date, view }) => {
    // switching between month/year/decade views
    if (view === "month") {
      const isReferenceMonth =
        date.getFullYear() === REFERENCE_YEAR &&
        date.getMonth() === REFERENCE_MONTH_INDEX;
      const isAvailable =
        isReferenceMonth && AVAILABLE_DAYS.has(date.getDate());

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
      if (isCurrentMonth) {
        classes += " is-selected";
      }
      return classes;
    }

    if (view === "decade") {
      const isCurrentYear = date.getFullYear() === selectedDate.getFullYear();

      let classes = "year-tile";
      if (isCurrentYear) {
        classes += " is-selected";
      }
      return classes;
    }

    return "";
  };

  return (
    <div className="calendar-wrapper">
      <Calendar
        value={selectedDate}
        defaultActiveStartDate={
          new Date(REFERENCE_YEAR, REFERENCE_MONTH_INDEX, 1)
        }
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
