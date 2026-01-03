
export type Category = 'Work' | 'Personal' | 'Family' | 'Social' | 'Important';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO format
  startTime?: string;
  endTime?: string;
  category: Category;
  createdBy: string;
  attendees: string[];
  amount?: number;
  transactionType?: 'income' | 'expense';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: Date;
  isRead: boolean;
  type: 'creation' | 'update' | 'reminder';
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email: string;
}
