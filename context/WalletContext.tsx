"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/apiClient";
import { useIdentity } from "@/context/IdentityContext";

export interface SettlementRecord {
  id: string;
  taskId: string;
  grossNaira: number;
  treasuryShareNaira: number;
  taskerShareNaira: number;
  timestamp: number;
}

export interface JobSettlementRecord {
  id: string;
  bookingId: string;
  grossNaira: number;
  workerShareNaira: number;
  timestamp: number;
}

export interface ApprenticeshipSettlement {
  id: string;
  applicationId: string;
  grossNaira: number;
  apprenticeShareNaira: number;
  masterShareNaira: number;
  timestamp: number;
}

export interface CivicScoreEvent {
  id: string;
  delta: number;
  reason: string;
  timestamp: number;
}

const TREASURY_SPLIT = 0.8;
const TASKER_SPLIT = 0.2;
const MONTHLY_LISTING_FEE_NAIRA = 500;

interface BackendWallet {
  _id: string;
  balanceNaira: number;
  civicScore: number;
  isListingActive: boolean;
  listingExpiresAt?: string;
}

interface BackendTransaction {
  _id: string;
  type: "civic_task" | "job_booking" | "apprenticeship" | "listing_fee" | "withdrawal";
  grossNaira: number;
  walletShareNaira: number;
  counterpartyShareNaira: number;
  referenceId: string;
  reason: string;
  createdAt: string;
}

// The backend doesn't keep a separate civic-score-delta log — the fixed
// deltas below mirror what each settlement type awards, reconstructed
// client-side from transaction history for display purposes only.
const SCORE_DELTA_BY_TYPE: Record<BackendTransaction["type"], number> = {
  civic_task: 5,
  job_booking: 3,
  apprenticeship: 2,
  listing_fee: 0,
  withdrawal: 0,
};

interface WalletContextValue {
  balanceNaira: number;
  civicScore: number;
  settlements: SettlementRecord[];
  jobSettlements: JobSettlementRecord[];
  apprenticeshipSettlements: ApprenticeshipSettlement[];
  civicScoreLog: CivicScoreEvent[];
  isListingActive: boolean;
  listingExpiresAt: number | null;
  monthlyListingFeeNaira: number;
  isLoading: boolean;
  payListingFee: () => Promise<boolean>;
  settleTaskPayout: (taskId: string, grossNaira: number) => Promise<SettlementRecord | null>;
  settleJobPayout: (bookingId: string, grossNaira: number) => Promise<JobSettlementRecord | null>;
  settleApprenticeshipJob: (applicationId: string, grossNaira: number) => Promise<ApprenticeshipSettlement | null>;
  withdraw: (amountNaira: number) => Promise<boolean>;
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { identityId, isVerified } = useIdentity();

  const [balanceNaira, setBalanceNaira] = useState(0);
  const [civicScore, setCivicScore] = useState(500);
  const [isListingActive, setIsListingActive] = useState(false);
  const [listingExpiresAt, setListingExpiresAt] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<BackendTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const applyWalletDoc = useCallback((doc: BackendWallet) => {
    setBalanceNaira(doc.balanceNaira);
    setCivicScore(doc.civicScore);
    setIsListingActive(doc.isListingActive);
    setListingExpiresAt(doc.listingExpiresAt ? new Date(doc.listingExpiresAt).getTime() : null);
  }, []);

  const refreshWallet = useCallback(async () => {
    if (!identityId || !isVerified) return;
    setIsLoading(true);
    try {
      const [wallet, txns] = await Promise.all([
        api.get<BackendWallet>(`/api/wallet/${identityId}`),
        api.get<BackendTransaction[]>(`/api/wallet/${identityId}/transactions`),
      ]);
      applyWalletDoc(wallet);
      setTransactions(txns);
    } catch {
      // Wallet may not exist yet if identity was just approved — safe to ignore.
    } finally {
      setIsLoading(false);
    }
  }, [identityId, isVerified, applyWalletDoc]);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  const settleTaskPayout = useCallback(
    async (taskId: string, grossNaira: number): Promise<SettlementRecord | null> => {
      if (!identityId) return null;
      const wallet = await api.post<BackendWallet>("/api/wallet/settle/civic-task", {
        ekitiId: identityId,
        grossNaira,
        referenceId: taskId,
        reason: `Verified task ${taskId} completed`,
      });
      applyWalletDoc(wallet);
      const treasuryShareNaira = Math.round(grossNaira * TREASURY_SPLIT);
      const record: SettlementRecord = {
        id: makeId("settlement"),
        taskId,
        grossNaira,
        treasuryShareNaira,
        taskerShareNaira: grossNaira - treasuryShareNaira,
        timestamp: Date.now(),
      };
      refreshWallet();
      return record;
    },
    [identityId, applyWalletDoc, refreshWallet]
  );

  const settleJobPayout = useCallback(
    async (bookingId: string, grossNaira: number): Promise<JobSettlementRecord | null> => {
      if (!identityId) return null;
      const wallet = await api.post<BackendWallet>("/api/wallet/settle/job-booking", {
        ekitiId: identityId,
        grossNaira,
        referenceId: bookingId,
        reason: `Booking ${bookingId} completed`,
      });
      applyWalletDoc(wallet);
      const record: JobSettlementRecord = {
        id: makeId("jobsettlement"),
        bookingId,
        grossNaira,
        workerShareNaira: grossNaira,
        timestamp: Date.now(),
      };
      refreshWallet();
      return record;
    },
    [identityId, applyWalletDoc, refreshWallet]
  );

  const settleApprenticeshipJob = useCallback(
    async (applicationId: string, grossNaira: number): Promise<ApprenticeshipSettlement | null> => {
      if (!identityId) return null;
      // Single-user demo: the same identity plays both apprentice and Master
      // roles, so both sides of the split land on one wallet. A real
      // multi-account system would pass the actual Master's ekitiId here.
      const result = await api.post<{ apprenticeWallet: BackendWallet; masterWallet: BackendWallet }>(
        "/api/wallet/settle/apprenticeship",
        { apprenticeEkitiId: identityId, masterEkitiId: identityId, grossNaira, referenceId: applicationId }
      );
      applyWalletDoc(result.masterWallet);
      const apprenticeShareNaira = Math.round(grossNaira * 0.6);
      const record: ApprenticeshipSettlement = {
        id: makeId("apprenticeship-settlement"),
        applicationId,
        grossNaira,
        apprenticeShareNaira,
        masterShareNaira: grossNaira - apprenticeShareNaira,
        timestamp: Date.now(),
      };
      refreshWallet();
      return record;
    },
    [identityId, applyWalletDoc, refreshWallet]
  );

  const payListingFee = useCallback(async (): Promise<boolean> => {
    if (!identityId) return false;
    const wallet = await api.post<BackendWallet>("/api/wallet/listing-fee", { ekitiId: identityId });
    applyWalletDoc(wallet);
    return true;
  }, [identityId, applyWalletDoc]);

  const withdraw = useCallback(
    async (amountNaira: number): Promise<boolean> => {
      if (!identityId) return false;
      try {
        const wallet = await api.post<BackendWallet>("/api/wallet/withdraw", { ekitiId: identityId, amountNaira });
        applyWalletDoc(wallet);
        return true;
      } catch {
        return false;
      }
    },
    [identityId, applyWalletDoc]
  );

  // Derived, read-only views reconstructed from transaction history so
  // existing components (Wallet page, Dashboard) don't need to change shape.
  const settlements: SettlementRecord[] = transactions
    .filter((t) => t.type === "civic_task")
    .map((t) => ({
      id: t._id,
      taskId: t.referenceId,
      grossNaira: t.grossNaira,
      treasuryShareNaira: t.counterpartyShareNaira,
      taskerShareNaira: t.walletShareNaira,
      timestamp: new Date(t.createdAt).getTime(),
    }));

  const jobSettlements: JobSettlementRecord[] = transactions
    .filter((t) => t.type === "job_booking")
    .map((t) => ({
      id: t._id,
      bookingId: t.referenceId,
      grossNaira: t.grossNaira,
      workerShareNaira: t.walletShareNaira,
      timestamp: new Date(t.createdAt).getTime(),
    }));

  const apprenticeshipSettlements: ApprenticeshipSettlement[] = transactions
    .filter((t) => t.type === "apprenticeship")
    .map((t) => ({
      id: t._id,
      applicationId: t.referenceId,
      grossNaira: t.grossNaira,
      apprenticeShareNaira: t.walletShareNaira,
      masterShareNaira: t.counterpartyShareNaira,
      timestamp: new Date(t.createdAt).getTime(),
    }));

  const civicScoreLog: CivicScoreEvent[] = transactions
    .filter((t) => SCORE_DELTA_BY_TYPE[t.type] > 0)
    .map((t) => ({
      id: `score-${t._id}`,
      delta: SCORE_DELTA_BY_TYPE[t.type],
      reason: t.reason,
      timestamp: new Date(t.createdAt).getTime(),
    }));

  const value = useMemo<WalletContextValue>(
    () => ({
      balanceNaira,
      civicScore,
      settlements,
      jobSettlements,
      apprenticeshipSettlements,
      civicScoreLog,
      isListingActive,
      listingExpiresAt,
      monthlyListingFeeNaira: MONTHLY_LISTING_FEE_NAIRA,
      isLoading,
      payListingFee,
      settleTaskPayout,
      settleJobPayout,
      settleApprenticeshipJob,
      withdraw,
      refreshWallet,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [balanceNaira, civicScore, isListingActive, listingExpiresAt, isLoading, transactions, payListingFee, settleTaskPayout, settleJobPayout, settleApprenticeshipJob, withdraw, refreshWallet]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return ctx;
}

export const SPLIT_RATIOS = { TREASURY_SPLIT, TASKER_SPLIT };
