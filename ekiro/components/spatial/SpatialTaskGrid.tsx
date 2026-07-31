"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Lock, MapPin, ShieldCheck, Timer, Unlock } from "lucide-react";
import { useLocation, type Coordinates } from "@/context/LocationContext";
import { useWallet } from "@/context/WalletContext";
import { useIdentity } from "@/context/IdentityContext";
import IdentityGate from "@/components/identity/IdentityGate";

interface SpatialTask {
  id: string;
  title: string;
  description: string;
  bountyNaira: number;
  center: Coordinates;
  requiresPeerVerification: boolean;
}

const CURRENT_USER_ID = "tasker-demo-001";

const SEED_TASKS: SpatialTask[] = [
  {
    id: "task-oja-oba-01",
    title: "Map informal stall — Oja Oba junction",
    description: "Photograph the stall frontage and confirm the trader's declared goods category.",
    bountyNaira: 350,
    center: { lat: 7.6212, lng: 5.2211 },
    requiresPeerVerification: false,
  },
  {
    id: "task-pothole-fajuyi",
    title: "Verify pothole report — Fajuyi Road",
    description: "Confirm an existing citizen report and capture a fresh geo-tagged photo.",
    bountyNaira: 500,
    center: { lat: 7.6205, lng: 5.2223 },
    requiresPeerVerification: true,
  },
  {
    id: "task-market-women-hall",
    title: "Tax mapping — Market Women's Hall",
    description: "Log business name, estimated daily turnover band, and stall number.",
    bountyNaira: 420,
    center: { lat: 7.6229, lng: 5.2198 },
    requiresPeerVerification: false,
  },
];

function formatCountdown(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function SpatialTaskGrid() {
  const { isVerified } = useIdentity();
  const { zones, registerZone, claimZone, currentPosition, simulateMovement } = useLocation();
  const { settleTaskPayout } = useWallet();
  const [claimMessage, setClaimMessage] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [, forceTick] = useState(0);

  useEffect(() => {
    SEED_TASKS.forEach((task) => registerZone(task.center));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const zonesById = useMemo(() => {
    const map = new Map<string, (typeof zones)[number]>();
    zones.forEach((z) => map.set(z.id, z));
    return map;
  }, [zones]);

  const tasksWithZones = useMemo(
    () =>
      SEED_TASKS.map((task) => {
        const zoneId = `zone-${task.center.lat.toFixed(5)}-${task.center.lng.toFixed(5)}`;
        return { task, zone: zonesById.get(zoneId) };
      }),
    [zonesById]
  );

  const handleClaim = useCallback(
    (taskId: string, zoneId: string) => {
      const result = claimZone(zoneId, CURRENT_USER_ID);
      setClaimMessage((prev) => ({
        ...prev,
        [taskId]: result.success ? "Zone locked to you for 30 minutes." : result.reason ?? "Unable to claim zone.",
      }));
    },
    [claimZone]
  );

  const handleComplete = useCallback(
    (task: SpatialTask) => {
      settleTaskPayout(task.id, task.bountyNaira);
      setCompleted((prev) => ({ ...prev, [task.id]: true }));
    },
    [settleTaskPayout]
  );

  if (!isVerified) return <IdentityGate />;

  return (
    <div className="min-h-screen bg-ekiti-canvas">
      <header className="px-5 sm:px-10 py-6 border-b border-ekiti-neutral/10 flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-ekiti-green mb-1">
            Tasker Radar
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-medium">10-metre zones near you</h1>
        </div>
        <button
          type="button"
          onClick={() => simulateMovement({ lat: 0.00003, lng: 0.00002 })}
          className="hidden sm:flex items-center gap-2 text-xs font-mono px-3 py-2 rounded-sm border border-ekiti-neutral/20 hover:border-ekiti-gold"
        >
          <MapPin size={14} /> Simulate movement
        </button>
      </header>

      <div className="px-5 sm:px-10 py-3 text-xs font-mono opacity-60">
        Current position: {currentPosition.lat.toFixed(5)}, {currentPosition.lng.toFixed(5)}
      </div>

      <main className="px-5 sm:px-10 py-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tasksWithZones.map(({ task, zone }) => {
          const now = Date.now();
          const isLocked = !!zone?.isLocked && !!zone.lockExpiresAt && zone.lockExpiresAt > now;
          const lockedByMe = isLocked && zone?.lockedBy === CURRENT_USER_ID;
          const isDone = completed[task.id];

          return (
            <div
              key={task.id}
              className="relative rounded-sm border bg-white p-6 flex flex-col gap-4"
              style={{ borderColor: isLocked ? "#D4AF37" : "rgba(10,26,16,0.1)" }}
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[11px] text-ekiti-green">₦{task.bountyNaira}</span>
                {isLocked ? (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-ekiti-gold">
                    <Lock size={12} /> {zone?.lockExpiresAt ? formatCountdown(zone.lockExpiresAt - now) : ""}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-ekiti-green opacity-70">
                    <Unlock size={12} /> Open
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-display text-lg font-medium mb-1">{task.title}</h3>
                <p className="text-sm opacity-75 leading-relaxed">{task.description}</p>
              </div>

              {task.requiresPeerVerification && (
                <div className="flex items-center gap-2 text-xs font-mono opacity-60">
                  <ShieldCheck size={14} className="text-ekiti-green" /> Requires peer verification
                </div>
              )}

              <div className="flex items-center gap-2 text-xs font-mono opacity-50">
                <Timer size={13} /> Lock duration: 30 minutes
              </div>

              {claimMessage[task.id] && (
                <p className="text-xs font-mono" style={{ color: lockedByMe ? "#005826" : "#B91C1C" }}>
                  {claimMessage[task.id]}
                </p>
              )}

              <div className="mt-auto flex gap-2 pt-2">
                {!lockedByMe && !isDone && (
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => zone && handleClaim(task.id, zone.id)}
                    className="flex-1 min-h-[52px] rounded-sm font-semibold text-sm bg-ekiti-neutral text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isLocked ? "Locked by another tasker" : "Claim zone"}
                  </button>
                )}
                {lockedByMe && !isDone && (
                  <button
                    type="button"
                    onClick={() => handleComplete(task)}
                    className="flex-1 min-h-[52px] rounded-sm font-semibold text-sm bg-ekiti-gold text-ekiti-neutral"
                  >
                    Submit evidence &amp; get paid
                  </button>
                )}
                {isDone && (
                  <div className="flex-1 min-h-[52px] rounded-sm flex items-center justify-center font-semibold text-sm bg-[#EAF2ED] text-ekiti-green">
                    Paid — 80/20 split settled
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
