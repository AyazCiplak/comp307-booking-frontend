// Programmed by Ayaz Ciplak
import { apiFetch } from "./client";
import type { BookingSlot } from "../types/booking";

// ## Backend entity shapes ##

/**
 * The exact JSON shape Jackson emits for a BookingSlot entity.
 * Field names are derived from getter names (getSlotType -> slotType, etc.).
 */
export interface BackendBookingSlot {
  bookingSlotID: number;
  owner: {
    email: string;
    firstName: string;
    lastName: string;
    department: string;
    title: string;
  };
  /** Jackson uses getter name "slotType" (not the field name "type"). */
  slotType: "OFFICE_HOURS" | "GROUP_PROPOSAL" | "GROUP_SELECTED";
  slotStatus: "AVAILABLE" | "BOOKED" | "CANCELLED";
  title: string | null;
  startDateTime: string; // ISO local datetime e.g. "2026-04-28T10:00:00"
  endDateTime: string;
  maxUsers: number;
  createdAt: string;
  updatedAt: string;
}

// ## Mapping helper ## 

/** Converts a raw backend BookingSlot entity -> the frontend BookingSlot type. */
export function mapBackendSlot(b: BackendBookingSlot): BookingSlot {
  const start = new Date(b.startDateTime);
  const end = new Date(b.endDateTime);

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  const statusMap: Record<BackendBookingSlot["slotStatus"], BookingSlot["status"]> = {
    AVAILABLE: "available",
    BOOKED: "booked",
    CANCELLED: "cancelled",
  };
  const typeMap: Record<BackendBookingSlot["slotType"], BookingSlot["type"]> = {
    OFFICE_HOURS: "office-hour",
    GROUP_PROPOSAL: "group",
    GROUP_SELECTED: "group",
  };

  return {
    id: String(b.bookingSlotID),
    date: start,
    startTime: fmtTime(start),
    endTime: fmtTime(end),
    ownerName: `${b.owner.firstName} ${b.owner.lastName}`,
    ownerEmail: b.owner.email,
    status: statusMap[b.slotStatus],
    type: typeMap[b.slotType],
    title: b.title ?? undefined,
  };
}

// ## API calls ## 

/**
 * POST /api/booking/owner/getAllAvailableOwnedSlots
 * Returns all AVAILABLE slots for the given owner email.
 * Body uses EmailTokenRequest DTO (proper JSON object, not a raw string).
 */
export const apiGetOwnerSlots = (
  ownerEmail: string,
  token: string,
): Promise<BookingSlot[]> =>
  apiFetch("/api/booking/owner/getAllAvailableOwnedSlots", {
    method: "POST",
    body: JSON.stringify({ email: ownerEmail, token }),
  }).then((raw) => (raw as BackendBookingSlot[]).map(mapBackendSlot));

/**
 * POST /api/booking/book
 * Books a slot for the logged-in user (reservee).
 * Body uses CreateBookingRequest DTO: { bookingSlotID, reserveeToken }.
 */
export const apiBookSlot = (
  bookingSlotID: number,
  reserveeToken: string,
) =>
  apiFetch("/api/booking/book", {
    method: "POST",
    body: JSON.stringify({ bookingSlotID, reserveeToken }),
  });

/**
 * POST /api/booking/createRecurringBookingSlot
 * Creates office-hour slots for the logged-in owner.
 *
 * The backend takes one week's worth of time slots and repeats them 'weeksToRepeat' times, 
 * offsetting each by 1 week.  Therefore frontend passes only the first occ of each selected weekday.
 *
 * startDateTimes / endDateTimes format: "YYYY-MM-DDTHH:MM:SS" (ISO local, no timezone suffix)
 * -> Backend deserializes this automatically without any additional config
 */
export const apiCreateRecurringSlots = (payload: {
  ownerToken: string;
  title: string;
  startDateTimes: string[];
  endDateTimes: string[];
  weeksToRepeat: number;
}) =>
  apiFetch("/api/booking/createRecurringBookingSlot", {
    method: "POST",
    body: JSON.stringify(payload),
  });
