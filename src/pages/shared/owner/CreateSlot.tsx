import CalendarComponent from "../../../components/ui/CalendarComponent.tsx";

// const INPUT_CLS =
//   "py-[15px] px-4 border-[3px] border-dark-grey rounded-xl text-[1.05rem] " +
//   "outline-none bg-transparent placeholder:text-dark-grey " +
//   "focus:border-steel-blue transition-colors duration-200 box-border";

function CreateSlot() {
  return (
    <div>
      {/* title */}
      <h1 className="text-2xl font-bold mb-4">Create a New Booking Slot</h1>

      {/* calendar component */}
      <div className="max-w-md mx-auto flex flex-col items-center gap-6 justify-start">
        <CalendarComponent />
      </div>
    </div>
  );
}

export default CreateSlot;
