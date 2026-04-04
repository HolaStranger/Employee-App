import { API_BASE_URL } from "@/constants/api";
import { LeaveRequest, Request, RoomBooking } from "@/types";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

async function readErrorMessage(res: Response) {
  try {
    const data = await res.json();
    return data?.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export const [RequestsProvider, useRequests] = createContextHook(() => {
  // 1. Hooks (ORDER IS CRITICAL)
  const { user, isManager } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTeamView, setIsTeamView] = useState(false);

  // 2. Callbacks
  const loadRequests = useCallback(async () => {
    try {
      if (!user) {
        setRequests([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      console.log("[Requests] Loading...");

      const url = isManager
        ? `${API_BASE_URL}/requests`
        : `${API_BASE_URL}/requests?userId=${encodeURIComponent(user.userId)}`;

      const res = await fetch(url);
      if (!res.ok) {
        const msg = await readErrorMessage(res);
        throw new Error(msg);
      }

      const data: Request[] = await res.json();
      setRequests(data);
    } catch (error) {
      console.error("[Requests] Load Error:", error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, isManager]);

  const createLeaveRequest = useCallback(
    async (payload: any): Promise<LeaveRequest> => {
      if (!user) throw new Error("User not authenticated");
      const res = await fetch(`${API_BASE_URL}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, type: "leave", userId: user.userId, userName: user.name }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res));
      const created = await res.json();
      await loadRequests();
      return created;
    },
    [user, loadRequests]
  );

  const createRoomBooking = useCallback(
    async (payload: any): Promise<RoomBooking> => {
      if (!user) throw new Error("User not authenticated");
      const res = await fetch(`${API_BASE_URL}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, type: "room", userId: user.userId, userName: user.name }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res));
      const created = await res.json();
      await loadRequests();
      return created;
    },
    [user, loadRequests]
  );

  const approveRequest = useCallback(
    async (requestId: string, decision: "approved" | "rejected"): Promise<Request> => {
      if (!user || !isManager) throw new Error("Unauthorized");
      const res = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision, approvedBy: user.name }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res));
      const updated = await res.json();
      await loadRequests();
      return updated;
    },
    [user, isManager, loadRequests]
  );

  const cancelRequest = useCallback(async (requestId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/requests/${requestId}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await readErrorMessage(res));
    await loadRequests();
  }, [loadRequests]);

  // 3. Effects
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // 4. Memos (ORDER IS CRITICAL)
  const userRequests = useMemo(() => {
    if (!user) return [];
    
    // Initial filtering logic
    let list = requests;
    if (!isManager || !isTeamView) {
      list = requests.filter((r) => r.userId === user.userId);
    }
    
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [user, isManager, isTeamView, requests]);

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

  // 5. Final Return
  return {
    requests: userRequests,
    leaveRequests,
    roomBookings,
    pendingRequests,
    isLoading,
    isTeamView,
    setIsTeamView,
    createLeaveRequest,
    createRoomBooking,
    approveRequest,
    cancelRequest,
    refetch: loadRequests,
  };
});

// Helper Hook (uses useRequests internally)
export function useFilteredRequests(filter: string) {
  const { requests } = useRequests();
  return useMemo(() => {
    if (filter === "all") return requests;
    if (filter === "leave" || filter === "room") return requests.filter((r) => r.type === filter);
    return requests.filter((r) => r.status === filter);
  }, [requests, filter]);
}