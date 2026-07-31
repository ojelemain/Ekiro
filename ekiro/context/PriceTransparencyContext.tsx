"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/apiClient";

export interface SubsidizedBatch {
  batchCode: string;
  itemName: string;
  officialPriceNaira: number;
  unit: string;
  assignedLocation: string;
  agentName: string;
  quantityReleased: number;
}

export interface OverchargeReport {
  id: string;
  batchCode: string;
  itemName: string;
  officialPriceNaira: number;
  reportedPriceNaira: number;
  location: string;
  reporterNote: string;
  timestamp: number;
}

export interface StateStoreItem {
  id: string;
  itemName: string;
  priceNaira: number;
  unit: string;
  availableQuantity: number;
  category: string;
}

export interface StateStoreOrder {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  totalNaira: number;
  timestamp: number;
}

export interface DiversionFlag {
  batchCode: string;
  itemName: string;
  reportCount: number;
  maxOverchargeNaira: number;
}

interface BackendReport {
  _id: string;
  batchCode: string;
  itemName: string;
  officialPriceNaira: number;
  reportedPriceNaira: number;
  location: string;
  reporterNote: string;
  createdAt: string;
}

interface BackendStoreItem {
  _id: string;
  itemName: string;
  priceNaira: number;
  unit: string;
  availableQuantity: number;
  category: string;
}

function toReport(doc: BackendReport): OverchargeReport {
  return {
    id: doc._id,
    batchCode: doc.batchCode,
    itemName: doc.itemName,
    officialPriceNaira: doc.officialPriceNaira,
    reportedPriceNaira: doc.reportedPriceNaira,
    location: doc.location,
    reporterNote: doc.reporterNote,
    timestamp: new Date(doc.createdAt).getTime(),
  };
}

function toStoreItem(doc: BackendStoreItem): StateStoreItem {
  return {
    id: doc._id,
    itemName: doc.itemName,
    priceNaira: doc.priceNaira,
    unit: doc.unit,
    availableQuantity: doc.availableQuantity,
    category: doc.category,
  };
}

interface PriceTransparencyContextValue {
  reports: OverchargeReport[];
  storeItems: StateStoreItem[];
  storeOrders: StateStoreOrder[];
  diversionFlags: DiversionFlag[];
  isLoading: boolean;
  lookupBatch: (batchCode: string) => Promise<SubsidizedBatch | null>;
  reportOvercharge: (input: {
    batchCode: string;
    reportedPriceNaira: number;
    location: string;
    reporterNote: string;
  }) => Promise<{ success: boolean; reason?: string }>;
  placeStateStoreOrder: (itemId: string, quantity: number) => Promise<StateStoreOrder | null>;
}

const PriceTransparencyContext = createContext<PriceTransparencyContextValue | undefined>(undefined);

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function PriceTransparencyProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<OverchargeReport[]>([]);
  const [storeItems, setStoreItems] = useState<StateStoreItem[]>([]);
  const [storeOrders, setStoreOrders] = useState<StateStoreOrder[]>([]);
  const [diversionFlags, setDiversionFlags] = useState<DiversionFlag[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedReports, fetchedItems, fetchedFlags] = await Promise.all([
        api.get<BackendReport[]>("/api/price-transparency/reports"),
        api.get<BackendStoreItem[]>("/api/price-transparency/store"),
        api.get<DiversionFlag[]>("/api/price-transparency/diversion-flags"),
      ]);
      setReports(fetchedReports.map(toReport));
      setStoreItems(fetchedItems.map(toStoreItem));
      setDiversionFlags(fetchedFlags);
    } catch {
      // leave state as-is on failure
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const lookupBatch = useCallback(async (batchCode: string): Promise<SubsidizedBatch | null> => {
    try {
      return await api.get<SubsidizedBatch>(`/api/price-transparency/batches/${encodeURIComponent(batchCode.trim())}`);
    } catch {
      return null;
    }
  }, []);

  const reportOvercharge = useCallback(
    async (input: {
      batchCode: string;
      reportedPriceNaira: number;
      location: string;
      reporterNote: string;
    }): Promise<{ success: boolean; reason?: string }> => {
      try {
        const created = await api.post<BackendReport>("/api/price-transparency/reports", input);
        setReports((prev) => [toReport(created), ...prev]);
        refresh();
        return { success: true };
      } catch (err) {
        return { success: false, reason: (err as Error).message || "Batch code not recognized." };
      }
    },
    [refresh]
  );

  const placeStateStoreOrder = useCallback(
    async (itemId: string, quantity: number): Promise<StateStoreOrder | null> => {
      try {
        const result = await api.post<{ itemId: string; itemName: string; quantity: number; totalNaira: number; item: BackendStoreItem }>(
          "/api/price-transparency/store/order",
          { itemId, quantity }
        );
        const order: StateStoreOrder = {
          id: makeId("storeorder"),
          itemId: result.itemId,
          itemName: result.itemName,
          quantity: result.quantity,
          totalNaira: result.totalNaira,
          timestamp: Date.now(),
        };
        setStoreOrders((prev) => [order, ...prev]);
        setStoreItems((prev) => prev.map((i) => (i.id === itemId ? toStoreItem(result.item) : i)));
        return order;
      } catch {
        return null;
      }
    },
    []
  );

  const value = useMemo<PriceTransparencyContextValue>(
    () => ({ reports, storeItems, storeOrders, diversionFlags, isLoading, lookupBatch, reportOvercharge, placeStateStoreOrder }),
    [reports, storeItems, storeOrders, diversionFlags, isLoading, lookupBatch, reportOvercharge, placeStateStoreOrder]
  );

  return <PriceTransparencyContext.Provider value={value}>{children}</PriceTransparencyContext.Provider>;
}

export function usePriceTransparency(): PriceTransparencyContextValue {
  const ctx = useContext(PriceTransparencyContext);
  if (!ctx) {
    throw new Error("usePriceTransparency must be used within a PriceTransparencyProvider");
  }
  return ctx;
}
