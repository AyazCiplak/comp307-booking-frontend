// Programmed by Ayaz Ciplak
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CalendarComponent from "../../../components/ui/CalendarComponent.tsx";
import Button from "../../../components/ui/Button.tsx";
import Card from "../../../components/ui/Card.tsx";
import { useAuth } from "../../../context/AuthContext.tsx";
import {
  apiCreateRecurringSlots,
  apiCreateGroupMeetingInstance,
  apiCreateGroupProposalSlot,
} from "../../../api/booking.ts";

// Shared input style - matches Login / Register form inputs
const INPUT_CLS =
  "py-[15px] px-4 border-[3px] border-dark-grey rounded-xl text-[1.05rem] " +
  "outline-none bg-transparent placeholder:text-dark-grey " +
  "focus:border-steel-blue transition-colors duration-200 box-border";

type SlotKind = "office-hour" | "group";

// Mon–Sun in display order; value = JS Date.getDay() (Sun=0)
const WEEKDAYS = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
] as const;

type SlotEntry = { id: string; date: Date; startTime: string; endTime: string };
type DaySchedule = { start: string; end: string };

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Returns the first occurrence of targetDay (0=Sun...6=Sat) at or after "from". */
function getNextWeekday(from: Date, targetDay: number): Date {
  const fromDay = from.getDay();
  let diff = targetDay - fromDay;
  if (diff < 0) diff += 7;
  return addDays(from, diff);
}

function fmtDate(date: Date): string {
  return date.toLocaleDateString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}


//calendar supports mobile scaling
function getCalendarScale(width: number): number {
  if (width <= 640) return 0.6;
  return 1;
}

function useCalendarScale() {
  const [scale, setScale] = useState(() =>
    typeof window === "undefined" ? 1 : getCalendarScale(window.innerWidth),
  );

  useEffect(() => {
    function handleResize() {
      setScale(getCalendarScale(window.innerWidth));
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return scale;
}

/**
 * Returns true if [s1,e1) and [s2,e2) overlap.
 * Times are "HH:MM" strings which compare lexicographically correctly.
 */
function timesOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  return s1 < e2 && s2 < e1;
}

/**
 * Create Slot page (/owner/create-slot).
 * Owner-only page for creating new booking slots.
 *
 * Type 3 -> Office Hours: select days of the week + time, specify number of
 *   recurring weeks. The page auto-generates all actual slot dates on submit.
 *
 * Type 2 ->  Group Meeting: add specific date+time pairs to a list, give the
 *   sequence a name + user ceiling, get a shareable invite URL on creation.
 */
function CreateSlot() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const calendarScale = useCalendarScale();

  // today at midnight — used as minDate for all date pickers
  const today = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  // Pre-select the tab if navigated from a specific CTA (e.g. Dashboard's "Create Group Meeting")
  const initialKind: SlotKind =
    (location.state as { kind?: SlotKind } | null)?.kind ?? "office-hour";

  // Shared
  const [slotKind, setSlotKind] = useState<SlotKind>(initialKind);
  const [error, setError] = useState("");

  // Type 2 (group meeting)
  const [pickDate, setPickDate] = useState<Date>(new Date(today));
  const [pickStart, setPickStart] = useState("09:00");
  const [pickEnd, setPickEnd] = useState("10:00");
  const [slotList, setSlotList] = useState<SlotEntry[]>([]);
  const [seqName, setSeqName] = useState("");
  const [userCeiling, setUserCeiling] = useState("5");

  // Type 3 (office hours)
  const [dayPattern, setDayPattern] = useState<Record<number, DaySchedule>>({});
  const [officeTitle, setOfficeTitle] = useState("");
  const [startDateStr, setStartDateStr] = useState(
    () => today.toISOString().split("T")[0], // YYYY-MM-DD default = today
  );
  const [numWeeks, setNumWeeks] = useState("4");

  // Success (type 2 only)
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  // Prevents double-submit on the "Create Sequence & Get Link" button.
  const [submitting, setSubmitting] = useState(false);

  // Helpers - type 2
  function addSlot() {
    if (!pickStart || !pickEnd) {
      setError("Set both start and end times before adding a slot.");
      return;
    }
    if (pickStart >= pickEnd) {
      setError("End time must be after start time.");
      return;
    }
    // Reject duplicates and overlapping slots on the same day.
    const conflict = slotList.find(
      (s) =>
        sameDay(s.date, pickDate) &&
        timesOverlap(s.startTime, s.endTime, pickStart, pickEnd),
    );
    if (conflict) {
      setError(
        `This slot overlaps with an existing one on that day (${conflict.startTime}–${conflict.endTime}). Please choose a non-overlapping time.`,
      );
      return;
    }
    setError("");
    setSlotList((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        date: new Date(pickDate),
        startTime: pickStart,
        endTime: pickEnd,
      },
    ]);
  }

  function removeSlot(id: string) {
    setSlotList((prev) => prev.filter((s) => s.id !== id));
  }

  // Helpers - type 3
  function toggleDay(val: number) {
    setDayPattern((prev) => {
      const next = { ...prev };
      if (val in next) {
        delete next[val];
      } else {
        next[val] = { start: "09:00", end: "10:00" };
      }
      return next;
    });
  }

  function setDayTime(val: number, field: "start" | "end", time: string) {
    setDayPattern((prev) => ({
      ...prev,
      [val]: {
        start: field === "start" ? time : prev[val].start,
        end: field === "end" ? time : prev[val].end,
      },
    }));
  }

  const selectedDayCount = Object.keys(dayPattern).length;
  const weeksNum = parseInt(numWeeks) || 0;
  const totalSlots3 = selectedDayCount * weeksNum;

  // Submission handling
  async function handleCreate() {
    setError("");

    if (slotKind === "group") {
      if (slotList.length === 0) {
        setError("Add at least one time slot to the list.");
        return;
      }
      if (!seqName.trim()) {
        setError("Please name your meeting sequence.");
        return;
      }
      if (Number(userCeiling) < 1 || isNaN(Number(userCeiling))) {
        setError("Max users must be a positive number.");
        return;
      }
      setSubmitting(true);
      try {
        // Generate a URL-safe invite token from the name + a timestamp suffix
        const inviteToken = `${seqName.trim().toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(36)}`;

        // 1. Create the GroupMeetingInstance on the backend
        const instance = await apiCreateGroupMeetingInstance({
          ownerToken: user!.token,
          name: seqName.trim(),
          maxUsers: Number(userCeiling),
          inviteToken,
        });

        // 2. Create one GROUP_PROPOSAL BookingSlot per time-slot entry (sequential
        // to avoid race conditions; only a handful of slots at most)
        for (const s of slotList) {
          const y = s.date.getFullYear();
          const mo = String(s.date.getMonth() + 1).padStart(2, "0");
          const d = String(s.date.getDate()).padStart(2, "0");
          await apiCreateGroupProposalSlot({
            groupMeetingInstanceID: instance.groupMeetingInstanceID,
            ownerToken: user!.token,
            title: seqName.trim(),
            startDateTime: `${y}-${mo}-${d}T${s.startTime}:00`,
            endDateTime: `${y}-${mo}-${d}T${s.endTime}:00`,
          });
        }

        // 3. Show success screen with the invite URL
        setCreatedUrl(
          `${window.location.origin}/invite/${instance.inviteToken}`,
        );
        setCreatedName(seqName.trim());
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create group meeting. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Type 3 validation
    if (selectedDayCount === 0) {
      setError("Select at least one day of the week.");
      return;
    }
    for (const key of Object.keys(dayPattern)) {
      const { start, end } = dayPattern[Number(key)];
      if (!start || !end) {
        setError("Set start and end times for all selected days.");
        return;
      }
      if (start >= end) {
        setError("End time must be after start time for every day.");
        return;
      }
    }
    if (!startDateStr) {
      setError("Select a starting date.");
      return;
    }
    if (weeksNum < 1) {
      setError("Number of weeks must be at least 1.");
      return;
    }

    // Build the FIRST occurrence of each selected weekday at/after the start date.
    // The backend takes this first-week list + weeksToRepeat and generates all
    // subsequent occurrences itself (plusWeeks(i) in BookingService).
    const origin = new Date(startDateStr + "T00:00:00");
    const startDateTimes: string[] = [];
    const endDateTimes: string[] = [];

    for (const key of Object.keys(dayPattern)) {
      const dayVal = Number(key);
      const slotDate = getNextWeekday(origin, dayVal);
      if (slotDate >= origin) {
        const y = slotDate.getFullYear();
        const mo = String(slotDate.getMonth() + 1).padStart(2, "0");
        const d = String(slotDate.getDate()).padStart(2, "0");
        startDateTimes.push(`${y}-${mo}-${d}T${dayPattern[dayVal].start}:00`);
        endDateTimes.push(`${y}-${mo}-${d}T${dayPattern[dayVal].end}:00`);
      }
    }

    if (startDateTimes.length === 0) {
      setError(
        "No valid slot dates could be generated. Check your start date and selected days.",
      );
      return;
    }

    setSubmitting(true);
    try {
      await apiCreateRecurringSlots({
        ownerToken: user!.token,
        title: officeTitle.trim() || "Office Hours",
        startDateTimes,
        endDateTimes,
        weeksToRepeat: weeksNum,
      });
      // Send the owner a confirmation email via mailto:
      const slotTitle = officeTitle.trim() || "Office Hours";
      const subject = encodeURIComponent(`[BookSoCS] Office Hours Created: ${slotTitle}`);
      const body = encodeURIComponent(
        `Hi ${user!.name},\n\n` +
        `Your office hours "${slotTitle}" have been successfully created on BookSoCS.\n\n` +
        `Schedule:\n` +
        `  • ${selectedDayCount} day${selectedDayCount !== 1 ? "s" : ""} per week × ${weeksNum} week${weeksNum !== 1 ? "s" : ""} ` +
        `= ${totalSlots3} slot${totalSlots3 !== 1 ? "s" : ""} total\n\n` +
        `Students can now book these slots from your profile on Browse Owners.\n\n` +
        `Best,\nBookSoCS`,
      );
      window.open(`mailto:${user!.email}?subject=${subject}&body=${body}`);
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create slots. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopyUrl() {
    if (!createdUrl) return;
    navigator.clipboard.writeText(createdUrl).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    });
  }

  // ### SUCCESS SCREEN (upon URL creation) - Type 2 only ###
  if (createdUrl && createdName) {
    return (
      <div
        style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 20px" }}
      >
        <Card>
          <Card.Content>
            <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
              <p style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</p>
              <h2 style={{ fontSize: "22px", margin: "0 0 8px" }}>
                Sequence Created!
              </h2>
              <p
                style={{
                  color: "#8e8e8e",
                  fontSize: "15px",
                  marginBottom: "28px",
                }}
              >
                <strong>{createdName}</strong> is ready. Share the invite link
                with participants.
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "#f7f7f7",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "28px",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontSize: "13px",
                    color: "#507da7",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {createdUrl}
                </span>
                <Button
                  variant={copiedUrl ? "ghost" : "secondary"}
                  size="sm"
                  onClick={handleCopyUrl}
                >
                  {copiedUrl ? "Copied!" : "Copy Link"}
                </Button>
              </div>
              <Button variant="primary" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  // ### MAIN FORM ###
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", margin: "0 0 4px" }}>
            Create a New Slot
          </h1>
          <p style={{ color: "#8e8e8e", fontSize: "15px", margin: 0 }}>
            Choose a type, schedule your times, then create.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </Button>
      </div>

      {/* Type picker */}
      <Card className="mb-6">
        <Card.Content>
          <p
            style={{ fontWeight: 600, fontSize: "15px", marginBottom: "14px" }}
          >
            Slot Type
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <label
              style={{
                flex: 1,
                minWidth: "220px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                border: `2px solid ${slotKind === "office-hour" ? "#507da7" : "#e0e0e0"}`,
                borderRadius: "12px",
                padding: "14px 16px",
                cursor: "pointer",
                background:
                  slotKind === "office-hour" ? "#f0f5fb" : "transparent",
                transition: "all 0.15s",
              }}
            >
              <input
                type="radio"
                name="slotKind"
                value="office-hour"
                checked={slotKind === "office-hour"}
                onChange={() => setSlotKind("office-hour")}
                className="accent-steel-blue mt-0.5"
              />
              <div>
                <p
                  style={{
                    fontWeight: 600,
                    margin: "0 0 2px",
                    fontSize: "15px",
                  }}
                >
                  Office Hours (Recurring)
                </p>
                <p style={{ color: "#8e8e8e", fontSize: "13px", margin: 0 }}>
                  Choose days of the week and a number of recurring weeks.
                  Bookable by any user.
                </p>
              </div>
            </label>

            <label
              style={{
                flex: 1,
                minWidth: "220px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                border: `2px solid ${slotKind === "group" ? "#629dfc" : "#e0e0e0"}`,
                borderRadius: "12px",
                padding: "14px 16px",
                cursor: "pointer",
                background: slotKind === "group" ? "#f0f5ff" : "transparent",
                transition: "all 0.15s",
              }}
            >
              <input
                type="radio"
                name="slotKind"
                value="group"
                checked={slotKind === "group"}
                onChange={() => setSlotKind("group")}
                className="accent-light-blue mt-0.5"
              />
              <div>
                <p
                  style={{
                    fontWeight: 600,
                    margin: "0 0 2px",
                    fontSize: "15px",
                  }}
                >
                  Group Meeting
                </p>
                <p style={{ color: "#8e8e8e", fontSize: "13px", margin: 0 }}>
                  Propose slot options, let invited users mark their
                  availability (when2meet style), then confirm the best time.
                </p>
              </div>
            </label>
          </div>
        </Card.Content>
      </Card>

      {/* Error banner */}
      {error && (
        <div
          style={{
            background: "#fbeaea",
            color: "#3a1f1f",
            borderRadius: "10px",
            padding: "14px 18px",
            fontSize: "0.95rem",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* ### TYPE 2 - GROUP MEETING ### */}
      {slotKind === "group" && (
        <>
          {/* Slot builder */}
          <Card className="mb-5">
            <Card.Header>
              <p style={{ fontWeight: 600, fontSize: "15px", margin: 0 }}>
                Add Time Slots
              </p>
            </Card.Header>
            <Card.Content>
              <div
                style={{
                  display: "flex",
                  gap: "32px",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                }}
              >
                {/* Calendar */}
                <div style={{ flexShrink: 0 }}>
                  <p className="text-dark-grey font-semibold text-[0.9rem] mb-2">
                    Pick a Date
                  </p>
                  <CalendarComponent
                    minDate={today}
                    onDateChange={(d) => setPickDate(d)}
                    scale={calendarScale}
                  />
                  <p
                    style={{
                      marginTop: "8px",
                      fontSize: "13px",
                      color: "#507da7",
                    }}
                  >
                    {fmtDate(pickDate)}
                  </p>
                </div>

                {/* Time range + Add button */}
                <div
                  style={{
                    flex: 1,
                    minWidth: "240px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    paddingTop: "4px",
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <label className="text-dark-grey font-semibold text-[0.9rem]">
                      Time Range
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        value={pickStart}
                        max={pickEnd || undefined}
                        className={INPUT_CLS + " flex-1"}
                        onChange={(e) => setPickStart(e.target.value)}
                      />
                      <span className="text-dark-grey font-bold">–</span>
                      <input
                        type="time"
                        value={pickEnd}
                        min={pickStart || undefined}
                        className={INPUT_CLS + " flex-1"}
                        onChange={(e) => setPickEnd(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button variant="secondary" onClick={addSlot}>
                    + Add to Slot List
                  </Button>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Slot list */}
          <Card className="mb-5">
            <Card.Header>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p style={{ fontWeight: 600, fontSize: "15px", margin: 0 }}>
                  Proposed Slot Options
                </p>
                <span style={{ fontSize: "13px", color: "#8e8e8e" }}>
                  {slotList.length} option{slotList.length !== 1 ? "s" : ""}{" "}
                  added
                </span>
              </div>
            </Card.Header>
            <Card.Content>
              {slotList.length === 0 ? (
                <p
                  style={{
                    color: "#8e8e8e",
                    textAlign: "center",
                    padding: "20px 0",
                    fontSize: "14px",
                  }}
                >
                  No slots added yet. Pick a date and time above, then click
                  "Add to Slot List".
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {slotList.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        background: "#f7f7f7",
                        borderRadius: "10px",
                      }}
                    >
                      <span style={{ fontSize: "14px" }}>
                        <strong>{fmtDate(s.date)}</strong>&nbsp;·&nbsp;
                        {s.startTime} – {s.endTime}
                      </span>
                      <button
                        onClick={() => removeSlot(s.id)}
                        title="Remove"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#bd271d",
                          fontSize: "20px",
                          lineHeight: 1,
                          padding: "0 4px",
                          fontFamily: "inherit",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Meeting details */}
          <Card className="mb-6">
            <Card.Header>
              <p style={{ fontWeight: 600, fontSize: "15px", margin: 0 }}>
                Meeting Details
              </p>
            </Card.Header>
            <Card.Content>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <div className="flex flex-col gap-2">
                  <label className="text-dark-grey font-semibold text-[0.95rem]">
                    Sequence Name
                  </label>
                  <input
                    type="text"
                    value={seqName}
                    placeholder="e.g. Midterm Review Sessions"
                    className={INPUT_CLS + " w-full"}
                    onChange={(e) => setSeqName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-dark-grey font-semibold text-[0.95rem]">
                    Max Users per Slot
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={userCeiling}
                    className={INPUT_CLS + " w-full"}
                    onChange={(e) => setUserCeiling(e.target.value)}
                  />
                  <p className="text-dark-grey text-sm">
                    Applies to every slot in this sequence.
                  </p>
                </div>
              </div>
            </Card.Content>
          </Card>
        </>
      )}

      {/* ### TYPE 3 - OFFICE HOURS (recurring) ### */}
      {slotKind === "office-hour" && (
        <>
          {/* Weekly pattern */}
          <Card className="mb-5">
            <Card.Header>
              <p style={{ fontWeight: 600, fontSize: "15px", margin: 0 }}>
                Weekly Schedule
              </p>
            </Card.Header>
            <Card.Content>
              {/* Day toggle buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "20px",
                }}
              >
                {WEEKDAYS.map(({ label, value }) => {
                  const active = value in dayPattern;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleDay(value)}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                        border: `2px solid ${active ? "#507da7" : "#e0e0e0"}`,
                        background: active ? "#507da7" : "transparent",
                        color: active ? "#fff" : "#555",
                        transition: "all 0.15s",
                        fontFamily: "inherit",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Per-day time inputs */}
              {selectedDayCount > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {WEEKDAYS.filter(({ value }) => value in dayPattern).map(
                    ({ label, value }) => (
                      <div
                        key={value}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            width: "36px",
                            fontWeight: 700,
                            fontSize: "14px",
                            color: "#507da7",
                            flexShrink: 0,
                          }}
                        >
                          {label}
                        </span>
                        <input
                          type="time"
                          value={dayPattern[value].start}
                          max={dayPattern[value].end || undefined}
                          className={INPUT_CLS}
                          style={{ flex: 1, minWidth: "120px" }}
                          onChange={(e) =>
                            setDayTime(value, "start", e.target.value)
                          }
                        />
                        <span className="text-dark-grey font-bold">–</span>
                        <input
                          type="time"
                          value={dayPattern[value].end}
                          min={dayPattern[value].start || undefined}
                          className={INPUT_CLS}
                          style={{ flex: 1, minWidth: "120px" }}
                          onChange={(e) =>
                            setDayTime(value, "end", e.target.value)
                          }
                        />
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p style={{ color: "#8e8e8e", fontSize: "14px" }}>
                  Toggle one or more days above, then set their time ranges.
                </p>
              )}
            </Card.Content>
          </Card>

          {/* Recurrence settings */}
          <Card className="mb-5">
            <Card.Header>
              <p style={{ fontWeight: 600, fontSize: "15px", margin: 0 }}>
                Recurrence
              </p>
            </Card.Header>
            <Card.Content>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div className="flex flex-col gap-2">
                  <label className="text-dark-grey font-semibold text-[0.95rem]">
                    Starting From
                  </label>
                  <input
                    type="date"
                    value={startDateStr}
                    min={today.toISOString().split("T")[0]}
                    className={INPUT_CLS + " w-full"}
                    onChange={(e) => setStartDateStr(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-dark-grey font-semibold text-[0.95rem]">
                    Number of Weeks
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={numWeeks}
                    className={INPUT_CLS + " w-full"}
                    onChange={(e) => setNumWeeks(e.target.value)}
                  />
                </div>

                {/* Slot preview */}
                {selectedDayCount > 0 && weeksNum > 0 && (
                  <div
                    style={{
                      background: "#f0f5fb",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      fontSize: "14px",
                      color: "#507da7",
                    }}
                  >
                    📅 Will create&nbsp;
                    <strong>
                      {totalSlots3} slot{totalSlots3 !== 1 ? "s" : ""}
                    </strong>
                    &nbsp;total &nbsp;({selectedDayCount} day
                    {selectedDayCount !== 1 ? "s" : ""} × {numWeeks} week
                    {weeksNum !== 1 ? "s" : ""})
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>

          {/* Optional slot title */}
          <Card className="mb-6">
            <Card.Content>
              <div className="flex flex-col gap-2">
                <label className="text-dark-grey font-semibold text-[0.95rem]">
                  Slot Title&nbsp;
                  <span className="font-normal text-dark-grey">(optional)</span>
                </label>
                <input
                  type="text"
                  value={officeTitle}
                  placeholder="e.g. COMP 307 Office Hours"
                  className={INPUT_CLS + " w-full"}
                  onChange={(e) => setOfficeTitle(e.target.value)}
                />
              </div>
            </Card.Content>
          </Card>
        </>
      )}

      {/* Create / Cancel buttons */}
      <div style={{ display: "flex", gap: "12px" }}>
        <Button variant="primary" onClick={handleCreate} disabled={submitting}>
          {slotKind === "group"
            ? "Create Sequence & Get Link"
            : "Create Office Hours"}
        </Button>
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default CreateSlot;
