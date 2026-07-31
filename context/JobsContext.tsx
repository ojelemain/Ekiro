"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/apiClient";
import { useIdentity } from "@/context/IdentityContext";

export type JobCategory =
  | "plumbing"
  | "electrical"
  | "tailoring"
  | "catering"
  | "mechanic"
  | "tutoring"
  | "tax_helper";

export const JOB_CATEGORIES: { key: JobCategory; label: string }[] = [
  { key: "plumbing", label: "Plumbing" },
  { key: "electrical", label: "Electrical" },
  { key: "tailoring", label: "Tailoring" },
  { key: "catering", label: "Catering" },
  { key: "mechanic", label: "Mechanic" },
  { key: "tutoring", label: "Digital Skills Tutoring" },
  { key: "tax_helper", label: "Tax Registration Helper" },
];

export interface WorkerProfile {
  id: string;
  name: string;
  category: JobCategory;
  bio: string;
  rateNaira: number;
  rateUnit: "per job" | "per hour";
  rating: number;
  completedJobs: number;
  isSelf?: boolean;
}

export type BookingStatus = "requested" | "accepted" | "completed";

export interface Booking {
  id: string;
  workerId: string;
  workerName: string;
  category: JobCategory;
  note: string;
  agreedNaira: number;
  status: BookingStatus;
  createdAt: number;
}

interface BackendWorker {
  _id: string;
  ekitiId?: string;
  name: string;
  category: JobCategory;
  bio: string;
  rateNaira: number;
  rateUnit: "per job" | "per hour";
  rating: number;
  completedJobs: number;
}

interface BackendBooking {
  _id: string;
  worker: string | BackendWorker;
  note: string;
  agreedNaira: number;
  status: BookingStatus;
  createdAt: string;
}

interface JobsContextValue {
  workers: WorkerProfile[];
  bookings: Booking[];
  isLoading: boolean;
  registerAsWorker: (input: Omit<WorkerProfile, "id" | "rating" | "completedJobs" | "isSelf">) => Promise<WorkerProfile | null>;
  bookWorker: (workerId: string, note: string) => Promise<Booking | null>;
  acceptBooking: (bookingId: string) => Promise<void>;
  completeBooking: (bookingId: string) => Promise<Booking | null>;
  selfWorkerId: string | null;
  refreshJobs: () => Promise<void>;
}

const JobsContext = createContext<JobsContextValue | undefined>(undefined);

function toWorkerProfile(doc: BackendWorker, selfWorkerId: string | null): WorkerProfile {
  return {
    id: doc._id,
    name: doc.name,
    category: doc.category,
    bio: doc.bio,
    rateNaira: doc.rateNaira,
    rateUnit: doc.rateUnit,
    rating: doc.rating,
    completedJobs: doc.completedJobs,
    isSelf: doc._id === selfWorkerId,
  };
}

function toBooking(doc: BackendBooking, workers: WorkerProfile[]): Booking {
  const workerId = typeof doc.worker === "string" ? doc.worker : doc.worker._id;
  const worker = workers.find((w) => w.id === workerId);
  return {
    id: doc._id,
    workerId,
    workerName: worker?.name ?? (typeof doc.worker === "object" ? doc.worker.name : "Unknown worker"),
    category: worker?.category ?? (typeof doc.worker === "object" ? doc.worker.category : "plumbing"),
    note: doc.note,
    agreedNaira: doc.agreedNaira,
    status: doc.status,
    createdAt: new Date(doc.createdAt).getTime(),
  };
}

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const { identityId } = useIdentity();
  const [backendWorkers, setBackendWorkers] = useState<BackendWorker[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selfWorkerId, setSelfWorkerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const workers = useMemo(() => backendWorkers.map((w) => toWorkerProfile(w, selfWorkerId)), [backendWorkers, selfWorkerId]);

  const refreshJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedWorkers = await api.get<BackendWorker[]>("/api/jobs/workers");
      setBackendWorkers(fetchedWorkers);

      // Pull bookings for whichever worker profile belongs to this session,
      // if any — mirrors the "selfWorkerId" concept from the in-memory version.
      if (selfWorkerId) {
        const workerBookings = await api.get<BackendBooking[]>(`/api/jobs/workers/${selfWorkerId}/bookings`);
        setBookings(workerBookings.map((b) => toBooking(b, fetchedWorkers.map((w) => toWorkerProfile(w, selfWorkerId)))));
      }
    } catch {
      // leave state as-is on failure
    } finally {
      setIsLoading(false);
    }
  }, [selfWorkerId]);

  useEffect(() => {
    refreshJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registerAsWorker = useCallback(
    async (input: Omit<WorkerProfile, "id" | "rating" | "completedJobs" | "isSelf">): Promise<WorkerProfile | null> => {
      try {
        const created = await api.post<BackendWorker>("/api/jobs/workers", { ...input, ekitiId: identityId ?? undefined });
        setBackendWorkers((prev) => [created, ...prev]);
        setSelfWorkerId(created._id);
        return toWorkerProfile(created, created._id);
      } catch {
        return null;
      }
    },
    [identityId]
  );

  const bookWorker = useCallback(
    async (workerId: string, note: string): Promise<Booking | null> => {
      try {
        const created = await api.post<BackendBooking>("/api/jobs/bookings", {
          workerId,
          note,
          customerEkitiId: identityId ?? undefined,
        });
        const booking = toBooking(created, workers);
        setBookings((prev) => [booking, ...prev]);
        return booking;
      } catch {
        return null;
      }
    },
    [identityId, workers]
  );

  const acceptBooking = useCallback(async (bookingId: string) => {
    try {
      await api.patch(`/api/jobs/bookings/${bookingId}/status`, { status: "accepted" });
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "accepted" } : b)));
    } catch {
      // no-op on failure
    }
  }, []);

  const completeBooking = useCallback(
    async (bookingId: string): Promise<Booking | null> => {
      try {
        await api.patch(`/api/jobs/bookings/${bookingId}/status`, { status: "completed" });
        let updated: Booking | null = null;
        setBookings((prev) =>
          prev.map((b) => {
            if (b.id !== bookingId) return b;
            updated = { ...b, status: "completed" };
            return updated;
          })
        );
        setBackendWorkers((prev) =>
          prev.map((w) => {
            const booking = bookings.find((b) => b.id === bookingId);
            if (!booking || w._id !== booking.workerId) return w;
            return { ...w, completedJobs: w.completedJobs + 1 };
          })
        );
        return updated;
      } catch {
        return null;
      }
    },
    [bookings]
  );

  const value = useMemo<JobsContextValue>(
    () => ({ workers, bookings, isLoading, registerAsWorker, bookWorker, acceptBooking, completeBooking, selfWorkerId, refreshJobs }),
    [workers, bookings, isLoading, registerAsWorker, bookWorker, acceptBooking, completeBooking, selfWorkerId, refreshJobs]
  );

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

export function useJobs(): JobsContextValue {
  const ctx = useContext(JobsContext);
  if (!ctx) {
    throw new Error("useJobs must be used within a JobsProvider");
  }
  return ctx;
}
