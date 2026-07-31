"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/apiClient";
import { useJobs, type JobCategory } from "@/context/JobsContext";
import { useWallet } from "@/context/WalletContext";
import { useIdentity } from "@/context/IdentityContext";

export const MASTER_ELIGIBLE_JOBS_THRESHOLD = 20;
export const GRADUATION_JOBS_THRESHOLD = 5;
export const APPRENTICE_SPLIT = 0.6;
export const MASTER_SPLIT = 0.4;

export interface Master {
  id: string;
  workerId: string;
  name: string;
  category: JobCategory;
  apprenticeSlots: number;
  activeApprentices: number;
}

export type ApplicationStatus = "pending" | "training" | "graduated" | "rejected";

export interface ApprenticeshipApplication {
  id: string;
  applicantName: string;
  category: JobCategory;
  masterId: string;
  masterName: string;
  status: ApplicationStatus;
  completedSupervisedJobs: number;
  createdAt: number;
}

interface BackendMaster {
  _id: string;
  worker: { _id: string; name: string; category: JobCategory } | string;
  apprenticeSlots: number;
  activeApprentices: number;
}

interface BackendApplication {
  _id: string;
  applicantName: string;
  category: JobCategory;
  master: string;
  status: ApplicationStatus;
  completedSupervisedJobs: number;
  createdAt: string;
}

interface TeachingHubContextValue {
  masters: Master[];
  applications: ApprenticeshipApplication[];
  isLoading: boolean;
  becomeMaster: (workerId: string, slots: number, qualifiesByReputation?: boolean) => Promise<{ success: boolean; reason?: string }>;
  applyForApprenticeship: (applicantName: string, category: JobCategory, masterId: string) => Promise<ApprenticeshipApplication | null>;
  acceptApplication: (applicationId: string) => Promise<void>;
  rejectApplication: (applicationId: string) => Promise<void>;
  runSupervisedJob: (applicationId: string, grossNaira: number) => Promise<{ apprenticeShare: number; masterShare: number } | null>;
}

const TeachingHubContext = createContext<TeachingHubContextValue | undefined>(undefined);

function toMaster(doc: BackendMaster, masterNameMap: Map<string, { name: string; category: JobCategory }>): Master {
  const workerId = typeof doc.worker === "string" ? doc.worker : doc.worker._id;
  const workerInfo =
    typeof doc.worker === "object" ? { name: doc.worker.name, category: doc.worker.category } : masterNameMap.get(workerId);
  return {
    id: doc._id,
    workerId,
    name: workerInfo?.name ?? "Unknown",
    category: workerInfo?.category ?? "plumbing",
    apprenticeSlots: doc.apprenticeSlots,
    activeApprentices: doc.activeApprentices,
  };
}

function toApplication(doc: BackendApplication, masters: Master[]): ApprenticeshipApplication {
  const master = masters.find((m) => m.id === doc.master);
  return {
    id: doc._id,
    applicantName: doc.applicantName,
    category: doc.category,
    masterId: doc.master,
    masterName: master?.name ?? "Unknown Master",
    status: doc.status,
    completedSupervisedJobs: doc.completedSupervisedJobs,
    createdAt: new Date(doc.createdAt).getTime(),
  };
}

export function TeachingHubProvider({ children }: { children: React.ReactNode }) {
  const { registerAsWorker } = useJobs();
  const { settleApprenticeshipJob } = useWallet();
  const { identityId } = useIdentity();

  const [masters, setMasters] = useState<Master[]>([]);
  const [applications, setApplications] = useState<ApprenticeshipApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedMasters = await api.get<BackendMaster[]>("/api/teaching-hub/masters");
      const nameMap = new Map<string, { name: string; category: JobCategory }>();
      const mappedMasters = fetchedMasters.map((m) => toMaster(m, nameMap));
      setMasters(mappedMasters);

      // Applications are fetched per-Master on the backend; pull them all
      // for every Master so the "Track progress" view has the full list.
      const perMaster = await Promise.all(
        mappedMasters.map((m) => api.get<BackendApplication[]>(`/api/teaching-hub/masters/${m.id}/applications`))
      );
      const allApplications = perMaster.flat().map((a) => toApplication(a, mappedMasters));
      setApplications(allApplications);
    } catch {
      // leave state as-is on failure
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const becomeMaster = useCallback(
    async (workerId: string, slots: number, qualifiesByReputation = false): Promise<{ success: boolean; reason?: string }> => {
      try {
        const created = await api.post<BackendMaster>("/api/teaching-hub/masters", {
          workerId,
          apprenticeSlots: slots,
          ekitiId: identityId ?? undefined,
        });
        setMasters((prev) => [toMaster(created, new Map()), ...prev]);
        return { success: true };
      } catch (err) {
        return { success: false, reason: (err as Error).message || "Unable to become a Master right now." };
      }
    },
    [identityId]
  );

  const applyForApprenticeship = useCallback(
    async (applicantName: string, category: JobCategory, masterId: string): Promise<ApprenticeshipApplication | null> => {
      try {
        const created = await api.post<BackendApplication>("/api/teaching-hub/applications", {
          masterId,
          applicantEkitiId: identityId ?? undefined,
          applicantName,
          category,
        });
        const application = toApplication(created, masters);
        setApplications((prev) => [application, ...prev]);
        return application;
      } catch {
        return null;
      }
    },
    [identityId, masters]
  );

  const acceptApplication = useCallback(
    async (applicationId: string) => {
      try {
        await api.post(`/api/teaching-hub/applications/${applicationId}/accept`, {});
        setApplications((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status: "training" } : a)));
        setMasters((prev) => {
          const app = applications.find((a) => a.id === applicationId);
          if (!app) return prev;
          return prev.map((m) => (m.id === app.masterId ? { ...m, activeApprentices: m.activeApprentices + 1 } : m));
        });
      } catch {
        // no-op on failure
      }
    },
    [applications]
  );

  const rejectApplication = useCallback(async (applicationId: string) => {
    try {
      await api.post(`/api/teaching-hub/applications/${applicationId}/reject`, {});
      setApplications((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status: "rejected" } : a)));
    } catch {
      // no-op on failure
    }
  }, []);

  const runSupervisedJob = useCallback(
    async (applicationId: string, grossNaira: number) => {
      const application = applications.find((a) => a.id === applicationId);
      if (!application || application.status !== "training") return null;

      const settlement = await settleApprenticeshipJob(applicationId, grossNaira);
      if (!settlement) return null;

      try {
        const updated = await api.post<BackendApplication>(
          `/api/teaching-hub/applications/${applicationId}/supervised-job`,
          {}
        );
        const graduated = updated.status === "graduated";
        setApplications((prev) =>
          prev.map((a) =>
            a.id === applicationId
              ? { ...a, completedSupervisedJobs: updated.completedSupervisedJobs, status: updated.status }
              : a
          )
        );
        if (graduated) {
          await registerAsWorker({
            name: application.applicantName,
            category: application.category,
            bio: `Graduate of the EKIRO Teaching Hub, trained under ${application.masterName}.`,
            rateNaira: 3000,
            rateUnit: "per job",
          });
        }
      } catch {
        // settlement already happened; local application state may lag until next refresh
      }

      return { apprenticeShare: settlement.apprenticeShareNaira, masterShare: settlement.masterShareNaira };
    },
    [applications, settleApprenticeshipJob, registerAsWorker]
  );

  const value = useMemo<TeachingHubContextValue>(
    () => ({ masters, applications, isLoading, becomeMaster, applyForApprenticeship, acceptApplication, rejectApplication, runSupervisedJob }),
    [masters, applications, isLoading, becomeMaster, applyForApprenticeship, acceptApplication, rejectApplication, runSupervisedJob]
  );

  return <TeachingHubContext.Provider value={value}>{children}</TeachingHubContext.Provider>;
}

export function useTeachingHub(): TeachingHubContextValue {
  const ctx = useContext(TeachingHubContext);
  if (!ctx) {
    throw new Error("useTeachingHub must be used within a TeachingHubProvider");
  }
  return ctx;
}
