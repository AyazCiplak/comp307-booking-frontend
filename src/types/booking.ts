export interface BookingSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  status: 'available' | 'booked' | 'cancelled' | 'pending';
  type: 'office-hour' | 'meeting' | 'group';
  title?: string;
  bookedByUserId?: string;
  bookedByUserName?: string;
  bookedByUserEmail?: string;
}

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  slots: BookingSlot[];
}