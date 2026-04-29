// Programmed by Ayaz Ciplak
// ##########
// Core domain types for the BookSoCS frontend.
// All live data is fetched from the Spring Boot backend via src/api/.
// Backend entity shapes are defined in src/api/booking.ts (BackendBookingSlot, etc.)
// ##########

// ##### SHARED TYPES #####

/** Role derived from email domain (@mail.mcgill.ca vs. @mcgill.ca) at login time */
export type UserRole = "user" | "owner";

/**
 * 3 meeting types described in the assignment pdf:
 * - "office-hour" -> Type 3: recurring office-hour slots (no user limit, show count)
 * - "meeting" -> Type 1: 1:1 requested meeting (user-initiated, owner approves)
 * - "group" -> Type 2: group meeting accessed via invite URL (GROUP_PROPOSAL / GROUP_SELECTED)
 */
export type SlotType = "office-hour" | "meeting" | "group";

/** Maps to the backend BookingSlotStatus enum values. */
export type SlotStatus = "available" | "booked" | "cancelled" | "pending";
/**
 * A single bookable time slot, used across the dashboard, browse pages, and group booking page.
 * Produced by mapBackendSlot() in src/api/booking.ts from the raw backend entity.
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
  ownerEmail: string; // @mcgill.ca - serves as the owner's unique identifier
  status: SlotStatus;
  type: SlotType;
  title?: string;

  // Populated by the dashboard when the owner fetches their slots
  bookedByUserName?: string;
  bookedByUserEmail?: string; // @mail.mcgill.ca or @mcgill.ca
  registeredCount?: number; // Type 3: number of users who have booked this slot
}

/** A single day cell on a calendar view. */
export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  slots: BookingSlot[];
}
