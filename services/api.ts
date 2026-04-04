import { API_BASE_URL } from '@/constants/api';
import { LeaveRequest, Request, RoomBooking, User, UserRole } from '@/types';

// ============================================
// API CONFIGURATION
// ============================================

// If you later add JWT auth, you can store token and send in headers
// const API_KEY = '';

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = (data && data.message) ? data.message : `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

async function apiPost<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = (data && data.message) ? data.message : `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

// ============================================
// AUTH
// ============================================

export async function login(role: UserRole, email?: string, password?: string): Promise<User> {
  if (!email || !password) throw new Error('Email and password are required');

  // Backend returns: { id or userId, name, email, role, department, token? }
  const data = await apiPost<any>('/login', {
    email: email.trim().toLowerCase(),
    password,
    role,
  });

  // ✅ Normalize to match your types/index.ts (userId)
  const user: User = {
    userId: data.userId ?? data.id, // support both
    name: data.name,
    email: data.email,
    role: data.role,
    department: data.department,
    token: data.token,
  };

  return user;
}

export async function signup(
  name: string,
  email: string,
  password: string,
  role: UserRole,
  department: string
): Promise<User> {
  const data = await apiPost<any>('/signup', {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role,
    department: department?.trim() || 'General',
  });

  const user: User = {
    userId: data.userId ?? data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    department: data.department,
    token: data.token,
  };

  return user;
}

export async function logout(): Promise<void> {
  // If later you add backend logout, call it here.
  return;
}

export async function getCurrentUser(): Promise<User | null> {
  // Your app currently stores user in AsyncStorage via AuthContext,
  // so this can remain null or be implemented later.
  return null;
}

// ============================================
// REQUESTS
// ============================================

export async function getRequests(userId?: string, role?: UserRole): Promise<Request[]> {
  // Your backend filters by userEmail (not userId), so this function is
  // better called from context with user.email.
  // But to keep compatibility, just return all if no email known.
  // You can update later once your context calls it correctly.
  const data = await apiGet<Request[]>('/requests');
  return data;
}

export async function createLeaveRequest(payload: {
  userId: string;
  userName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  userEmail?: string; // optional but recommended
}): Promise<LeaveRequest> {
  const data = await apiPost<any>('/requests', {
    type: 'leave',
    reason: payload.reason,
    fromDate: payload.startDate,
    toDate: payload.endDate,
    userEmail: (payload.userEmail || '').toLowerCase(),
    userName: payload.userName,
    status: 'pending',
    leaveType: payload.leaveType,
    userId: payload.userId,
  });

  // Backend returns whatever you stored; we map to your LeaveRequest type
  const leaveRequest: LeaveRequest = {
    id: data.id,
    type: 'leave',
    userId: data.userId ?? payload.userId,
    userName: data.userName ?? payload.userName,
    leaveType: (data.leaveType ?? payload.leaveType) as LeaveRequest['leaveType'],
    startDate: data.fromDate ?? payload.startDate,
    endDate: data.toDate ?? payload.endDate,
    reason: data.reason ?? payload.reason,
    status: (data.status ?? 'pending') as LeaveRequest['status'],
    createdAt: data.createdAt ?? new Date().toISOString(),
    approvedBy: data.approvedBy,
  };

  return leaveRequest;
}

export async function createRoomBooking(payload: {
  userId: string;
  userName: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  purpose: string;
  userEmail?: string;
}): Promise<RoomBooking> {
  const data = await apiPost<any>('/requests', {
    type: 'room',
    reason: payload.purpose,
    fromDate: payload.date,
    toDate: payload.date,
    userEmail: (payload.userEmail || '').toLowerCase(),
    userName: payload.userName,
    status: 'booked',
    roomName: payload.roomName,
    startTime: payload.startTime,
    endTime: payload.endTime,
    duration: payload.duration,
    userId: payload.userId,
  });

  const booking: RoomBooking = {
    id: data.id,
    type: 'room',
    userId: data.userId ?? payload.userId,
    userName: data.userName ?? payload.userName,
    roomName: data.roomName ?? payload.roomName,
    date: data.fromDate ?? payload.date,
    startTime: data.startTime ?? payload.startTime,
    endTime: data.endTime ?? payload.endTime,
    duration: data.duration ?? payload.duration,
    purpose: data.reason ?? payload.purpose,
    status: (data.status ?? 'booked') as RoomBooking['status'],
    createdAt: data.createdAt ?? new Date().toISOString(),
    approvedBy: data.approvedBy,
  };

  return booking;
}

export async function managerApprove(
  requestId: string,
  decision: 'approved' | 'rejected',
  managerName: string
): Promise<Request> {
  // Not implemented in your backend yet
  throw new Error('managerApprove endpoint not implemented in backend yet');
}

export async function cancelRequest(requestId: string): Promise<void> {
  // Not implemented in your backend yet
  throw new Error('cancelRequest endpoint not implemented in backend yet');
}