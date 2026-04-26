// ##########
// Core domain types for the BookSoCS frontend
// All data is currently MOCKED - will be replaced by API responses from the spring boot backend. 
// ##########

// ##### SHARED TYPES #####

/** Role derived from email domain (@mail.mcgill.ca vs. @mcgill.ca) at login time */
export type UserRole = "user" | "owner";

/**
 * 3 meeting types described in the assignment pdf:
 * - "office-hour" -> Type 3: recurring office-hour slots (no user limit, show count)
 * - "meeting" -> Type 1: 1:1 requested meeting (user-initiated, owner approves)
 * - "group" -> Type 2: group meeting sequence accessed via invite URL
 */
export type SlotType = "office-hour" | "meeting" | "group";

export type SlotStatus = "available" | "booked" | "cancelled" | "pending";

/**
 * A single bookable time slot, holding all associated necessary info.
 * Used across the dashboard, browse pages, and group booking page.
 *
 * Identity note: ownerEmail (@mcgill.ca) is the single owner identifier.
 * The URL-safe form is ownerEmail.split('@')[0] (e.g. "joseph.vybihal"),
 * used as the :ownerUsername route param on /browse/:ownerUsername.
 */
export interface BookingSlot {
  id: string;
  date: Date;
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "11:00 AM"
  ownerName: string;
  ownerEmail: string; // @mcgill.ca — serves as the owner's unique identifier
  status: SlotStatus;
  type: SlotType;
  title?: string;

  // Booking info — present when status === "booked"
  bookedByUserName?: string;
  bookedByUserEmail?: string;  // @mail.mcgill.ca — serves as the booker's UNIQUE ID 
  // Type 3 (office-hour) specific
  registeredCount?: number; // number of users who have booked this slot

  // Type 2 (group) specific
  sequenceId?: string; // links back to a MeetingSequence by id
  maxUsers?: number; // max users who can mark availability for this slot (inherits from sequence)
  registeredUserIds?: string[]; // emails of users who marked themselves available for this slot
}

/** A single day cell on a calendar view. */
export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  slots: BookingSlot[];
}

/**
 * A named group-meeting sequence created by an owner (Type 2).
 * The owner specifies a set of available time slots, a user ceiling per slot (uniform),
 * and the app generates an invite URL that any logged-in user can visit to sign up.
 */
export interface MeetingSequence {
  id: string;
  name: string; // e.g. "Midterm Review Sessions"
  ownerName: string;
  ownerEmail: string; // @mcgill.ca — owner identifier
  slots: BookingSlot[];
  userCeiling: number; // max users allowed per slot
  inviteUrl: string; // generated URL, e.g. /invite/seq-1
  createdAt: Date;
  /** Set to true once the owner has picked a final time via ConfirmGroupTime.
   *  Finalized sequences are hidden from "My Pending Group Meetings" and a
   *  confirmed BookingSlot is created instead.
   *  TODO: persist this flag on the backend (currently in-memory only). */
  finalized?: boolean;
  /** ID of the BookingSlot (within `slots`) chosen as the confirmed meeting time. */
  finalizedSlotId?: string;
}

/**
 * A meeting request sent by a user to an owner (type 1).
 * Appears in the owner's "Pending Requests" dashboard section until accepted or declined.
 * Accepting creates a new BookingSlot and notifies the user.
 */
export interface PendingRequest {
  id: string;
  requesterName: string;
  requesterEmail: string; // @mail.mcgill.ca or @mcgill.ca — requester identifier
  ownerName: string;
  ownerEmail: string; // @mcgill.ca — owner identifier
  requestedDate: Date;
  requestedStartTime: string; // e.g. "2:00 PM"
  requestedEndTime: string; // e.g. "2:30 PM"
  message?: string; // optional note from the requester
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}

/**
 * A summary card for an owner, displayed on the Browse Owners page.
 * Full slot details are loaded separately on the Owner Appointments page.
 */
export interface Owner {
  name: string;
  email: string; // always @mcgill.ca — the unique identifier (ALSO ACTS AS ID)
  department?: string; // e.g. "School of Computer Science"
  title?: string; // e.g. "Professor", "Teaching Assistant"
  activeSlotCount: number; // number of currently available slots
}
