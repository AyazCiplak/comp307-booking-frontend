import type { BookingSlot, MeetingSequence, Owner, PendingRequest } from "../types/booking";

// ########
//  MOCK DATA - will be replaced entirely by API calls once the Spring Boot
//  backend is connected.  
// ########

// TWO MOCK IDENTITY TPYES (can be swapped manually in AuthContext to test user vs. owner views):
// STUDENT -> ayaz.ciplak@mail.mcgill.ca (role: "user")
// OWNER -> joseph.vybihal@mcgill.ca (role: "owner")


// ### Owner directory (searchable content on Browse Owners page) ### 

/**
 * Full list of registered owners shown on the Browse Owners (/browse) page.
 */
export const mockOwners: Owner[] = [
  {
    name: "Prof. Joseph Vybihal",
    email: "joseph.vybihal@mcgill.ca",
    department: "School of Computer Science",
    title: "Professor",
    activeSlotCount: 4,
  },
  {
    name: "Sarah Thompson",
    email: "sarah.thompson@mcgill.ca",
    department: "School of Computer Science",
    title: "Teaching Assistant",
    activeSlotCount: 3,
  },
  {
    name: "Prof. Derek Ruths",
    email: "derek.ruths@mcgill.ca",
    department: "School of Computer Science",
    title: "Professor",
    activeSlotCount: 2,
  },
  {
    name: "Prof. Brigitte Pientka",
    email: "brigitte.pientka@mcgill.ca",
    department: "School of Computer Science",
    title: "Professor",
    activeSlotCount: 5,
  },
  {
    name: "Lucas Pereira",
    email: "lucas.pereira@mcgill.ca",
    department: "School of Computer Science",
    title: "Teaching Assistant",
    activeSlotCount: 2,
  },
];

// ### Slots visible on the Owner Appointments page for Prof. Vybihal ### 

/** Active Type 3 (office-hour) slots for Prof. Vybihal. Shown on /browse/joseph.vybihal */
export const professorVybihalSlots: BookingSlot[] = [
  {
    id: "v-1",
    date: new Date("2026-04-28"),
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    ownerName: "Prof. Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    status: "available",
    type: "office-hour",
    title: "COMP 307 Office Hours",
    registeredCount: 2,
  },
  {
    id: "v-2",
    date: new Date("2026-04-30"),
    startTime: "1:00 PM",
    endTime: "2:00 PM",
    ownerName: "Prof. Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    status: "available",
    type: "office-hour",
    title: "COMP 307 Office Hours",
    registeredCount: 0,
  },
  {
    id: "v-3",
    date: new Date("2026-05-05"),
    startTime: "10:00 AM",
    endTime: "10:30 AM",
    ownerName: "Prof. Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    status: "available",
    type: "office-hour",
    title: "Drop-In Help Session",
    registeredCount: 1,
  },
  {
    id: "v-4",
    date: new Date("2026-05-07"),
    startTime: "3:00 PM",
    endTime: "4:00 PM",
    ownerName: "Prof. Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    status: "booked",
    type: "office-hour",
    title: "COMP 307 Office Hours",
    registeredCount: 3,
    bookedByUserName: "Ayaz Ciplak",
    bookedByUserEmail: "ayaz.ciplak@mail.mcgill.ca",
  },
];

/** Active Type 3 slots for TA Sarah Thompson. Shown on /browse/sarah.thompson */
export const taSarahSlots: BookingSlot[] = [
  {
    id: "s-1",
    date: new Date("2026-04-29"),
    startTime: "2:00 PM",
    endTime: "2:30 PM",
    ownerName: "Sarah Thompson",
    ownerEmail: "sarah.thompson@mcgill.ca",
    status: "available",
    type: "office-hour",
    title: "Assignment 3 Help",
    registeredCount: 0,
  },
  {
    id: "s-2",
    date: new Date("2026-05-01"),
    startTime: "11:00 AM",
    endTime: "11:30 AM",
    ownerName: "Sarah Thompson",
    ownerEmail: "sarah.thompson@mcgill.ca",
    status: "available",
    type: "office-hour",
    title: "General TA Hours",
    registeredCount: 1,
  },
  {
    id: "s-3",
    date: new Date("2026-05-06"),
    startTime: "4:00 PM",
    endTime: "4:30 PM",
    ownerName: "Sarah Thompson",
    ownerEmail: "sarah.thompson@mcgill.ca",
    status: "available",
    type: "office-hour",
    title: "Final Exam Prep",
    registeredCount: 4,
  },
];

/** Convenience map — keyed by owner email, used on the Owner Appointments page. */
export const slotsByOwner: Record<string, BookingSlot[]> = {
  "joseph.vybihal@mcgill.ca": professorVybihalSlots,
  "sarah.thompson@mcgill.ca": taSarahSlots,
  // add more owners here as needed
};

// ### My Appointments (logged-in user's booked slots) ### 

/**
 * Slots the currently logged-in student has already booked.
 * Shown in the "My Appointments" section on the Dashboard.
 */
export const myAppointments: BookingSlot[] = [
  {
    id: "my-1",
    date: new Date("2026-04-28"),
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    ownerName: "Prof. Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    status: "booked",
    type: "office-hour",
    title: "COMP 307 Office Hours",
    bookedByUserName: "Ayaz Ciplak",
    bookedByUserEmail: "ayaz.ciplak@mail.mcgill.ca",
  },
  {
    id: "my-2",
    date: new Date("2026-05-02"),
    startTime: "2:00 PM",
    endTime: "2:30 PM",
    ownerName: "Sarah Thompson",
    ownerEmail: "sarah.thompson@mcgill.ca",
    status: "pending",
    type: "meeting",
    title: "Assignment Review Request",
    bookedByUserName: "Ayaz Ciplak",
    bookedByUserEmail: "ayaz.ciplak@mail.mcgill.ca",
  },
  {
    id: "my-3",
    date: new Date("2026-05-10"),
    startTime: "3:00 PM",
    endTime: "3:30 PM",
    ownerName: "Prof. Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    status: "booked",
    type: "group",
    title: "Midterm Review Session",
    sequenceId: "seq-1",
    bookedByUserName: "Ayaz Ciplak",
    bookedByUserEmail: "ayaz.ciplak@mail.mcgill.ca",
  },

  // ## Joseph Vybihal's own appointments (booked with OTHER owners) ##
  {
    id: "my-j1",
    date: new Date("2026-04-29"),
    startTime: "2:00 PM",
    endTime: "2:30 PM",
    ownerName: "Sarah Thompson",
    ownerEmail: "sarah.thompson@mcgill.ca",
    status: "booked",
    type: "office-hour",
    title: "Assignment 3 Help",
    bookedByUserName: "Prof. Joseph Vybihal",
    bookedByUserEmail: "joseph.vybihal@mcgill.ca",
  },
  {
    id: "my-j2",
    date: new Date("2026-05-08"),
    startTime: "10:00 AM",
    endTime: "10:30 AM",
    ownerName: "Prof. Derek Ruths",
    ownerEmail: "derek.ruths@mcgill.ca",
    status: "pending",
    type: "meeting",
    title: "Research Collaboration Discussion",
    bookedByUserName: "Prof. Joseph Vybihal",
    bookedByUserEmail: "joseph.vybihal@mcgill.ca",
  },
];

// ### Owner's own booking slots (owner dashboard) ###

/**
 * Type 3 (office-hour) slots created by the logged-in owner.
 * Shown in "My Booking Slots" on the Dashboard when role === "owner".
 */
export const ownerSlots: BookingSlot[] = [
  {
    id: "os-1",
    date: new Date("2026-04-29"),
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    ownerName: "Prof. Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    status: "booked",
    type: "office-hour",
    title: "COMP 307 Office Hours",
    registeredCount: 3,
    bookedByUserName: "Jane Smith",
    bookedByUserEmail: "jane.smith@mail.mcgill.ca",
  },
  {
    id: "os-2",
    date: new Date("2026-05-06"),
    startTime: "9:00 AM",
    endTime: "9:30 AM",
    ownerName: "Prof. Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    status: "available",
    type: "office-hour",
    title: "COMP 307 Office Hours",
    registeredCount: 0,
  },
  {
    id: "os-3",
    date: new Date("2026-05-08"),
    startTime: "2:00 PM",
    endTime: "3:00 PM",
    ownerName: "Prof. Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    status: "available",
    type: "office-hour",
    title: "Drop-In Help",
    registeredCount: 1,
  },
];

// ### Meeting Sequences (Type 2, owner dashboard) ### 

/**
 * Named group-meeting sequences created by the logged-in owner.
 * Each sequence has an invite URL that any logged-in user can use to sign up.
 * Shown in "My Meeting Sequences" on the owner Dashboard.
 */
export const ownerMeetingSequences: MeetingSequence[] = [
  {
    id: "seq-1",
    name: "Midterm Review Sessions",
    ownerName: "Prof. Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    userCeiling: 5,
    inviteUrl: `${window.location.origin}/invite/seq-1`,
    createdAt: new Date("2026-04-15"),
    slots: [
      {
        id: "gs-1",
        date: new Date("2026-05-10"),
        startTime: "3:00 PM",
        endTime: "3:30 PM",
        ownerName: "Prof. Vybihal",
        ownerEmail: "joseph.vybihal@mcgill.ca",
        status: "booked",
        type: "group",
        title: "Midterm Review Sessions",
        sequenceId: "seq-1",
        maxUsers: 5,
        registeredUserIds: [
          "ayaz.ciplak@mail.mcgill.ca",
          "jane.smith@mail.mcgill.ca",
          "bob.jones@mail.mcgill.ca",
        ],
      },
      {
        id: "gs-2",
        date: new Date("2026-05-12"),
        startTime: "3:00 PM",
        endTime: "3:30 PM",
        ownerName: "Prof. Vybihal",
        ownerEmail: "joseph.vybihal@mcgill.ca",
        status: "available",
        type: "group",
        title: "Midterm Review Sessions",
        sequenceId: "seq-1",
        maxUsers: 5,
        registeredUserIds: ["jane.smith@mail.mcgill.ca"],
      },
      {
        id: "gs-3",
        date: new Date("2026-05-14"),
        startTime: "3:00 PM",
        endTime: "3:30 PM",
        ownerName: "Prof. Vybihal",
        ownerEmail: "joseph.vybihal@mcgill.ca",
        status: "available",
        type: "group",
        title: "Midterm Review Sessions",
        sequenceId: "seq-1",
        maxUsers: 5,
        registeredUserIds: [],
      },
    ],
  },
  {
    id: "seq-2",
    name: "Project Consultation Q&A",
    ownerName: "Prof. Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    userCeiling: 3,
    inviteUrl: `${window.location.origin}/invite/seq-2`,
    createdAt: new Date("2026-04-20"),
    slots: [
      {
        id: "gs-4",
        date: new Date("2026-05-16"),
        startTime: "10:00 AM",
        endTime: "10:30 AM",
        ownerName: "Prof. Vybihal",
        ownerEmail: "joseph.vybihal@mcgill.ca",
        status: "available",
        type: "group",
        title: "Project Consultation Q&A",
        sequenceId: "seq-2",
        maxUsers: 3,
        registeredUserIds: [],
      },
      {
        id: "gs-5",
        date: new Date("2026-05-19"),
        startTime: "10:00 AM",
        endTime: "10:30 AM",
        ownerName: "Prof. Vybihal",
        ownerEmail: "joseph.vybihal@mcgill.ca",
        status: "available",
        type: "group",
        title: "Project Consultation Q&A",
        sequenceId: "seq-2",
        maxUsers: 3,
        registeredUserIds: [],
      },
    ],
  },
];

// ### Pending Requests (Type 1, on owner dashboard) ### 

/**
 * Type 1 meeting requests sent to the logged-in owner by students.
 * Shown in "Pending Requests" on the owner Dashboard.
 * Owner can accept (creates a new BookingSlot + notifies user) or decline.
 */
export const pendingRequests: PendingRequest[] = [
  {
    id: "req-1",
    requesterName: "Alice Wong",
    requesterEmail: "alice.wong@mail.mcgill.ca",
    ownerName: "Prof. Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    requestedDate: new Date("2026-05-03"),
    requestedStartTime: "11:00 AM",
    requestedEndTime: "11:30 AM",
    message: "Hi Prof. Vybihal! I'd love to discuss my COMP 307 project proposal with you.",
    status: "pending",
    createdAt: new Date("2026-04-22"),
  },
  {
    id: "req-2",
    requesterName: "Bob Jones",
    requesterEmail: "bob.jones@mail.mcgill.ca",
    ownerName: "Prof. Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    requestedDate: new Date("2026-05-04"),
    requestedStartTime: "2:00 PM",
    requestedEndTime: "2:30 PM",
    message: "I have a few questions about the assignment 3 specification.",
    status: "pending",
    createdAt: new Date("2026-04-23"),
  },
  {
    id: "req-3",
    requesterName: "Carla Diaz",
    requesterEmail: "carla.diaz@mail.mcgill.ca",
    ownerName: "Prof. Vybihal",
    ownerEmail: "joseph.vybihal@mcgill.ca",
    requestedDate: new Date("2026-05-06"),
    requestedStartTime: "4:00 PM",
    requestedEndTime: "4:30 PM",
    status: "pending",
    createdAt: new Date("2026-04-24"),
  },
];

// ### Group Booking Sequences (public — accessible via invite URL) ### 

/**
 * Meeting sequences that a user lands on via an invite URL (/invite/:sequenceId).
 * In production this would be fetched from the backend by sequence ID.
 */
export const meetingSequenceById: Record<string, MeetingSequence> = Object.fromEntries(
  ownerMeetingSequences.map((seq) => [seq.id, seq])
);
