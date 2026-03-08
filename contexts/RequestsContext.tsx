import { LeaveRequest, Request, RoomBooking } from "@/types";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

/**
 * ✅ IMPORTANT:
 * Change this if your laptop IP changes.
 */
const API_BASE_URL = 'http://172.20.10.3:4000';

async function readErrorMessage(res: Response) {
  try {
    const data = await res.json();
    return data?.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export const [RequestsProvider, useRequests] = createContextHook(() => {
  const { user, isManager } = useAuth();

  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!user) {
        setRequests([]);
        return;
      }

      console.log("[Requests] Loading from backend...");

      const url =
        isManager
          ? `${API_BASE_URL}/requests`
          : `${API_BASE_URL}/requests?userId=${encodeURIComponent(user.userId)}`;

      const res = await fetch(url);

      if (!res.ok) {
        const msg = await readErrorMessage(res);
        throw new Error(msg);
      }

      const data: Request[] = await res.json();
      console.log("[Requests] Loaded", data.length, "requests");
      setRequests(data);
    } catch (error) {
      console.error("[Requests] Error loading requests:", error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, isManager]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const createLeaveRequest = useCallback(
    async (payload: {
      leaveType: string;
      startDate: string;
      endDate: string;
      reason: string;
    }): Promise<LeaveRequest> => {
      if (!user) throw new Error("User not authenticated");

      console.log("[Requests] Creating leave request:", payload);

      const res = await fetch(`${API_BASE_URL}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "leave",
          userId: user.userId,
          userName: user.name,
          leaveType: payload.leaveType,
          startDate: payload.startDate,
          endDate: payload.endDate,
          reason: payload.reason,
        }),
      });

      if (!res.ok) {
        const msg = await readErrorMessage(res);
        throw new Error(msg);
      }

      const created: LeaveRequest = await res.json();
      await loadRequests();  //Refresh from backend
      return created;
    },
    [user]
  );

  const createRoomBooking = useCallback(
    async (payload: {
      roomName: string;
      date: string;
      startTime: string;
      endTime: string;
      duration: number;
      purpose: string;
    }): Promise<RoomBooking> => {
      if (!user) throw new Error("User not authenticated");

      console.log("[Requests] Creating room booking:", payload);

      const res = await fetch(`${API_BASE_URL}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "room",
          userId: user.userId,
          userName: user.name,
          roomName: payload.roomName,
          date: payload.date,
          startTime: payload.startTime,
          endTime: payload.endTime,
          duration: payload.duration,
          purpose: payload.purpose,
        }),
      });

      if (!res.ok) {
        const msg = await readErrorMessage(res);
        throw new Error(msg);
      }

      const created: RoomBooking = await res.json();
      await loadRequests();
      return created;
    },
    [user]
  );

  const approveRequest = useCallback(
    async (requestId: string, decision: "approved" | "rejected"): Promise<Request> => {
      if (!user) throw new Error("User not authenticated");
      if (!isManager) throw new Error("Only managers can approve requests");

      console.log("[Requests] Approving:", requestId, decision);

      const res = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: decision, // backend converts room approved -> booked
          approvedBy: user.name,
        }),
      });

      if (!res.ok) {
        const msg = await readErrorMessage(res);
        throw new Error(msg);
      }

      const updated: Request = await res.json();
      await loadRequests();
      return updated;
    },
    [user, isManager]
  );

  const cancelRequest = useCallback(async (requestId: string): Promise<void> => {
    console.log("[Requests] Cancelling:", requestId);

    const res = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const msg = await readErrorMessage(res);
      throw new Error(msg);
    }

    await loadRequests();
  }, []);

  // ✅ Filter requests based on role
  const userRequests = useMemo(() => {
    if (!user) return [];

    const list = isManager ? requests : requests.filter((r) => r.userId === user.userId);

    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [user, isManager, requests]);

  const leaveRequests = useMemo(
    () => userRequests.filter((r) => r.type === "leave") as LeaveRequest[],
    [userRequests]
  );

  const roomBookings = useMemo(
    () => userRequests.filter((r) => r.type === "room") as RoomBooking[],
    [userRequests]
  );

  const pendingRequests = useMemo(
    () => userRequests.filter((r) => r.status === "pending"),
    [userRequests]
  );

  return {
    requests: userRequests,
    leaveRequests,
    roomBookings,
    pendingRequests,
    isLoading,
    createLeaveRequest,
    createRoomBooking,
    approveRequest,
    cancelRequest,
    refetch: loadRequests,
  };
});

export function useFilteredRequests(filter: string) {
  const { requests } = useRequests();

  return useMemo(() => {
    if (filter === "all") return requests;
    if (filter === "leave" || filter === "room") return requests.filter((r) => r.type === filter);
    return requests.filter((r) => r.status === filter);
  }, [requests, filter]);
}