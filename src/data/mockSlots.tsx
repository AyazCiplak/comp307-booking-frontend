import type { BookingSlot } from "../types/booking";

/* MOCK data to populate cards for sample users / owners.
 * Will eventually be replaced entirely by data fetched from the backend. 
 */

// The logged-in mock user's email (must match what AuthContext has)
const ME = "ayaz.ciplak@mail.mcgill.ca";

/**
 * Slots the currently logged-in user has already booked
 * Shown in "My Appointments" on the dashboard
 */
export const myAppointments: BookingSlot[] = [
  {
    id: "1",
    date: new Date("2026-04-28"),
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    ownerId: "owner-1",
    ownerName: "Prof. Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    status: "booked",
    type: "office-hour",
    title: "Office Hours — COMP 307",
    bookedByUserId: ME,
    bookedByUserName: "Ayaz Ciplak",
    bookedByUserEmail: ME,
  },
  {
    id: "2",
    date: new Date("2026-05-02"),
    startTime: "2:00 PM",
    endTime: "2:30 PM",
    ownerId: "owner-2",
    ownerName: "TA Sarah",
    ownerEmail: "sarah.ta@mcgill.ca",
    status: "pending",
    type: "meeting",
    title: "Assignment Review",
    bookedByUserId: ME,
    bookedByUserName: "Ayaz Ciplak",
    bookedByUserEmail: ME,
  },
];

/**
 * Slots created by a mock owner (when AuthContext email is @mcgill.ca)
 * Shown in "My Booking Slots" on the dashboard (owner view only)
 */
export const ownerSlots: BookingSlot[] = [
  {
    id: "5",
    date: new Date("2026-04-29"),
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    ownerId: "owner-me",
    ownerName: "Ayaz (Owner)",
    ownerEmail: "ayaz.ciplak@mcgill.ca",
    status: "booked",
    type: "office-hour",
    title: "My Office Hours",
    bookedByUserId: "student-1",
    bookedByUserName: "Jane Smith",
    bookedByUserEmail: "jane.smith@mail.mcgill.ca",
  },
  {
    id: "6",
    date: new Date("2026-05-06"),
    startTime: "9:00 AM",
    endTime: "9:30 AM",
    ownerId: "owner-me",
    ownerName: "Ayaz (Owner)",
    ownerEmail: "ayaz.ciplak@mcgill.ca",
    status: "available",
    type: "meeting",
    title: "Project Check-In",
  },
];

/**
 * Active slots from a specific owner.
 * NOT shown on the dashboard — used on the future /browse/:ownerId page
 * when a user searches into a specific professor's available slots.
 * (not yet actually used)
 */
export const professorVybihalSlots: BookingSlot[] = [
  {
    id: "3",
    date: new Date("2026-04-30"),
    startTime: "1:00 PM",
    endTime: "2:00 PM",
    ownerId: "owner-1",
    ownerName: "Prof. Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    status: "available",
    type: "office-hour",
    title: "Office Hours — Drop-In",
  },
  {
    id: "7",
    date: new Date("2026-05-05"),
    startTime: "10:00 AM",
    endTime: "10:30 AM",
    ownerId: "owner-1",
    ownerName: "Prof. Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    status: "available",
    type: "office-hour",
    title: "Office Hours — COMP 307",
  },
];
