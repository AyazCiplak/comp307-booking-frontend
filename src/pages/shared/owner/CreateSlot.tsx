import { useState } from "react";
import CalendarComponent from "../../../components/ui/CalendarComponent.tsx";

const INPUT_CLS =
  "py-[15px] px-4 border-[3px] border-dark-grey rounded-xl text-[1.05rem] " +
  "outline-none bg-transparent placeholder:text-dark-grey " +
  "focus:border-steel-blue transition-colors duration-200 box-border";

function CreateSlot() {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slotType, setSlotType] = useState("");

  return (
    <div>
      {/* title */}
      <h1 className="text-2xl font-bold mb-4">Create a New Booking Slot</h1>

      <div className="mb-6 flex gap-3">
        {/* calendar component */}
        <div className="max-w-md mx-auto flex flex-col items-center gap-6 justify-start">
          <CalendarComponent />
        </div>

        {/* slot details */}
        <div className="max-w-lg mx-auto flex flex-col items-center gap-3 justify-start">
          {/* time inputs  */}
          <a className="text-dark-grey text-xl font-bold">Slot Time</a>
          <div className="flex items-center gap-3 w-full">
            <input
              type="time"
              value={startTime}
              placeholder="Start Time"
              className={INPUT_CLS + " w-half"}
              onChange={(e) => setStartTime(e.target.value)}
            />

            <p className="text-dark-grey font-bold">-</p>
            <input
              type="time"
              value={endTime}
              placeholder="End Time"
              className={INPUT_CLS + " w-half"}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          {/* slot type  */}
          <a className="text-dark-grey text-xl - py-2 font-bold">Slot Type</a>
          <div className="flex items-center gap-3 w-full">
            <label className="flex flex-1 items-center gap-2 rounded-xl  px-2 cursor-pointer transition-colors duration-200">
              <input
                type="radio"
                name="slotType"
                value="Office Hours"
                checked={slotType === "Office Hours"}
                onChange={(e) => setSlotType(e.target.value)}
                className="h-4 w-4 accent-steel-blue"
              />
              <span className="text-dark-grey font-medium hover:text-steel-blue">
                Office Hours
              </span>
            </label>

            <label className="flex flex-1 items-center gap-2 rounded-xl px-2  cursor-pointer transition-colors duration-200">
              <input
                type="radio"
                name="slotType"
                value="Appointment"
                checked={slotType === "Appointment"}
                onChange={(e) => setSlotType(e.target.value)}
                className="h-4 w-4 background-color-white accent-steel-blue"
              />
              <span className="text-dark-grey font-medium hover:text-steel-blue">
                Appointment
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateSlot;
