// Programmed by Ayaz Ciplak
import { apiFetch, tokenFetch } from "./client";
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
  slotType: "OFFICE_HOURS" | "GROUP_PROPOSAL" | "GROUP_SELECTED" | "MEETING";
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
    MEETING: "meeting",
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

// ## Additional backend entity shapes ##

/** A single Booking row -> returned by POST /api/booking/getMyBookings. */
export interface BackendBooking {
  bookingID: number;
  bookingSlot: BackendBookingSlot;
  reservee: {
    email: string;
    firstName: string;
    lastName: string;
    department: string;
    title: string;
    owner: boolean;
  };
  registeredAt: string; // "YYYY-MM-DD"
}

/** A Request entity -> returned by POST /api/requests/getAllPendingRequests / getMyRequests. */
export interface BackendRequest {
  id: number;
  requester: {
    email: string;
    firstName: string;
    lastName: string;
    department: string;
    title: string;
  };
  owner: {
    email: string;
    firstName: string;
    lastName: string;
  };
  requestedStart: string; // ISO local datetime "YYYY-MM-DDTHH:MM:SS"
  requestedEnd: string;
  message: string | null;
  pending: boolean;
  /** Full status string serialised from the RequestStatus enum. */
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
  updatedAt: string;
}

// ## Dashboard API calls ##

/**
 * POST /api/booking/getMyBookings
 * Returns the authenticated user's Booking objects (each includes the full BookingSlot
 * + the bookingID needed for the unbook call).  Body = raw token.
 */
export const apiGetMyBookings = (token: string): Promise<BackendBooking[]> =>
  tokenFetch("/api/booking/getMyBookings", token) as Promise<BackendBooking[]>;

/**
 * DELETE /api/booking/{bookingId}
 * Cancels (unbooks) the given Booking for the authenticated user.  Body = raw token.
 */
export const apiUnbook = (bookingId: number, token: string) =>
  apiFetch(`/api/booking/${bookingId}`, {
    method: "DELETE",
    body: token,
    headers: { "Content-Type": "text/plain" },
  });

/**
 * POST /api/booking/owner/getSlotBookingCounts
 * Returns a Record<string, number> mapping bookingSlotID -> booking count for every
 * slot owned by the authenticated owner.  Body = raw token.
 * The backend emits Long keys, which Jackson serialises as JSON number keys (string keys when used as JS obj)
 */
export const apiGetSlotBookingCounts = (
  token: string,
): Promise<Record<string, number>> =>
  tokenFetch("/api/booking/owner/getSlotBookingCounts", token) as Promise<
    Record<string, number>
  >;

/**
 * POST /api/booking/owner/getAllOwnedSlots
 * Returns ALL BookingSlot records owned by the authenticated owner (all statuses).
 * Body = raw token.
 */
export const apiGetOwnerOwnedSlots = (token: string): Promise<BackendBookingSlot[]> =>
  tokenFetch("/api/booking/owner/getAllOwnedSlots", token) as Promise<
    BackendBookingSlot[]
  >;

/**
 * PATCH /api/booking/cancel/{bookingSlotId}
 * Marks a slot as CANCELLED and deletes all its bookings. Body = raw token.
 */
export const apiCancelSlot = (slotId: number, token: string) =>
  apiFetch(`/api/booking/cancel/${slotId}`, {
    method: "PATCH",
    body: token,
    headers: { "Content-Type": "text/plain" },
  });

/**
 * POST /api/requests/getAllPendingRequests
 * Returns all PENDING Request objects for the authenticated owner. Body = raw token.
 */
export const apiGetPendingRequests = (token: string): Promise<BackendRequest[]> =>
  tokenFetch("/api/requests/getAllPendingRequests", token) as Promise<
    BackendRequest[]
  >;

/**
 * POST /api/requests/{id}/accept
 * Owner accepts a pending Request. Body = raw token.
 */
export const apiAcceptRequest = (requestId: number, token: string) =>
  apiFetch(`/api/requests/${requestId}/accept`, {
    method: "POST",
    body: token,
    headers: { "Content-Type": "text/plain" },
  });

/**
 * POST /api/requests/{id}/decline
 * Owner declines a pending Request (deletes it). Body = raw token.
 */
export const apiDeclineRequest = (requestId: number, token: string) =>
  apiFetch(`/api/requests/${requestId}/decline`, {
    method: "POST",
    body: token,
    headers: { "Content-Type": "text/plain" },
  });

/**
 * POST /api/requests/requestBooking
 * Sends a Type 1 meeting request from the logged-in user to the given owner.
 * Body uses RequestBookingRequest DTO: { requesterToken, ownerEmail, startTime, endTime, message }.
 * startTime / endTime must be ISO local datetime strings: "YYYY-MM-DDTHH:MM:SS"
 */
export const apiRequestBooking = (payload: {
  requesterToken: string;
  ownerEmail: string;
  startTime: string;
  endTime: string;
  message: string | null;
}) =>
  apiFetch("/api/requests/requestBooking", {
    method: "POST",
    body: JSON.stringify(payload),
  });

/**
 * POST /api/requests/getMyRequests
 * Returns all PENDING requests sent by the authenticated user (excludes accepted/declined).
 * Body = raw token.
 */
export const apiGetMyRequests = (token: string): Promise<BackendRequest[]> =>
  tokenFetch("/api/requests/getMyRequests", token) as Promise<BackendRequest[]>;

/**
 * DELETE /api/requests/{requestId}
 * Allows the original requester to cancel (delete) their own pending request.
 * Body = raw token.
 */
export const apiCancelRequest = (requestId: number, token: string) =>
  apiFetch(`/api/requests/${requestId}`, {
    method: "DELETE",
    body: token,
    headers: { "Content-Type": "text/plain" },
  });

/**
 * POST /api/booking/owner/getSlotBookers
 * Returns a map of bookingSlotID -> Booking for every MEETING-type slot owned by the
 * authenticated owner.  Used by the dashboard to display who booked each 1:1 meeting.
 * Jackson serialises Long map keys as JSON number keys (JS sees them as string keys in an object).
 * Body = raw token.
 */
export const apiGetSlotBookers = (
  token: string,
): Promise<Record<string, BackendBooking>> =>
  tokenFetch("/api/booking/owner/getSlotBookers", token) as Promise<
    Record<string, BackendBooking>
  >;

/**
 * POST /api/account/listBooked
 * Returns the current user's booked items (BookingSlot entities + Request entities).
 * Body is a raw token string -> uses tokenFetch.
 *
 * The backend returns List<BookingsInterface> which is a mix of BookingSlot and Request
 * objects serialized as JSON. Result typed 'loosely' so the caller can filter for
 * items with a `bookingSlotID` field to find already-booked slots.
 */
export const apiListUserBookings = (
  token: string,
): Promise<{ bookingSlotID?: number }[]> =>
  tokenFetch("/api/account/listBooked", token) as Promise<
    { bookingSlotID?: number }[]
  >;
