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


// ##### INTERFACES #####
// # BookingSlot Interface #

/**
 * A single bookable time slot, holding all associated necessary info.
 * Used across the dashboard, browse pages, and group booking page.
 */
export interface BookingSlot {
  id: string;
  date: Date;
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "11:00 AM"
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  status: SlotStatus; // "available", "booked", "cancelled", "pending"
  type: SlotType; // "office-hour", "meeting", "group"
  title?: string;

  // Booking info - present when status is "booked"
  bookedByUserId?: string;
  bookedByUserName?: string;
  bookedByUserEmail?: string;

  // Type 3 (office-hour) specific
  registeredCount?: number; // number of users who have booked this slot

  // Type 2 (group) specific
  sequenceId?: string; // links back to a MeetingSequence
  maxUsers?: number; // user ceiling for this slot (inherits from sequence)
  registeredUserIds?: string[]; // list of user ids who signed up
}

// # CalendarDay Interface #

/** A single day cell on a calendar view, containing a list of available slots */
export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  slots: BookingSlot[];
}

// # MeetingSequence Interface # 
// Used for type 2 ("group") meetings 

/**
 * A named group-meeting sequence created by an owner (Type 2).
 * The owner specifies a set of available time slots, a user ceiling per slot (uniform),
 * and the app generates an invite URL that any logged-in user can visit to sign up.
 */
export interface MeetingSequence {
  id: string;
  name: string; // e.g. "Midterm Review Sessions"
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  slots: BookingSlot[]; // all BookingSlots belonging to this sequence
  userCeiling: number; // max users allowed per slot (same for all slots in sequence)
  inviteUrl: string; // generated URL — e.g. /invite/abc123
  createdAt: Date;
}


// # PendingRequest Interface #
// Used for type 1 ("requested meeting") meetings

/**
 * A meeting request sent by a user to an owner (type 1).
 * Appears in the owner's "Pending Requests" dashboard section until accepted or declined.
 * Accepting creates a new BookingSlot and notifies the user.
 */
export interface PendingRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  ownerId: string; // Will likely be the same as ownerEmail 
  ownerName: string;
  ownerEmail: string;
  requestedDate: Date;
  requestedStartTime: string; // e.g. "2:00 PM"
  requestedEndTime: string; // e.g. "2:30 PM"
  message?: string; // optional note from the requesting user
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}

// # Owner interface #
// Used for Browse Owners page 

/**
 * A summary card for an owner, displayed on the Browse Owners page.
 * Full slot details are loaded separately on the Owner Appointments page.
 */
export interface Owner {
  id: string;
  name: string;
  email: string; // will always be "@mcgill.ca"
  department?: string; // e.g. "School of Computer Science"
  title?: string; // e.g. "Professor", "Teaching Assistant"
  activeSlotCount: number; // number of currently available slots
}
