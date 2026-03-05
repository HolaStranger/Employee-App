export type UserRole = "employee" | "manager";

export type User = {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  token?: string;
};

export type RequestStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'booked';
export type RequestType = 'leave' | 'room';
export type LeaveType = 'annual' | 'sick' | 'personal' | 'emergency';

export interface LeaveRequest {
  id: string;
  type: 'leave';
  userId: string;
  userName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: RequestStatus;
  createdAt: string;
  approvedBy?: string;
}

export interface RoomBooking {
  id: string;
  type: 'room';
  userId: string;
  userName: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  purpose: string;
  status: RequestStatus;
  createdAt: string;

  approvedBy?: string; // ✅ add this line
}

export type Request = LeaveRequest | RoomBooking;

export type MessageType = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: string;
  confirmationData?: ConfirmationData;
}

export interface ConfirmationData {
  requestType: RequestType;
  leaveType?: LeaveType;
  startDate?: string;
  endDate?: string;
  roomName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  reason?: string;
  purpose?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
}
