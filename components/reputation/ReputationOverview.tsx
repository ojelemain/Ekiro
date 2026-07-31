"use client";

import React from "react";
import { Award, CheckCircle2, Lock, TrendingUp } from "lucide-react";
import { useIdentity } from "@/context/IdentityContext";
import { useWallet } from "@/context/WalletContext";
import { useReputation, REPUTATION_TIERS } from "@/context/ReputationContext";
import IdentityGate from "@/components/identity/IdentityGate";

export default function ReputationOverview() {
  const { isVerified } = useIdentity();
  const { civicScoreLog } = useWallet();
  const { civicScore, currentTier, nextTier, progressPercent, badges } = useReputation();

  if (!isVerified) return <IdentityGate />;

  return (
    <div className="min-h-screen bg-ekiti-canvas">
      <header className="px-5 sm:px-10 py-6 border-b border-ekiti-neutral/10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-ekiti-green mb-1">
          Civic Reputation
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">Reputation that unlocks things</h1>
        <p className="text-xs opacity-60 mt-1 max-w-xl">
          Not just a number — each tier carries a real unlock elsewhere in EKIRO, and every badge below is
          earned from something you actually did, not assigned.
        </p>
      </header>

      <main className="px-5 sm:px-10 py-6 flex flex-col gap-8">
        <section className="rounded-sm bg-ekiti-neutral text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] uppercase tracking-widest text-ekiti-gold">
              {currentTier.name}
            </span>
            <span className="font-display text-2xl">{civicScore}</span>
          </div>
          {nextTier ? (
            <>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
                <div className="h-full bg-ekiti-gold rounded-full" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="text-xs opacity-70">
                {nextTier.minScore - civicScore} points to {nextTier.name}
              </p>
            </>
          ) : (
            <p className="text-xs text-ekiti-gold">Highest tier reached.</p>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-ekiti-green" />
            <h2 className="font-display text-lg font-semibold">Tier ladder</h2>
          </div>
          <div className="flex flex-col gap-3">
            {REPUTATION_TIERS.map((tier) => {
              const reached = civicScore >= tier.minScore;
              return (
                <div
                  key={tier.name}
                  className={`rounded-sm border p-5 flex items-start justify-between gap-4 ${
                    reached ? "border-ekiti-gold bg-[#FFF8E7]" : "border-ekiti-neutral/10 bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {reached ? (
                        <CheckCircle2 size={16} className="text-ekiti-green" />
                      ) : (
                        <Lock size={16} className="opacity-40" />
                      )}
                      <span className="font-display text-base font-semibold">{tier.name}</span>
                      <span className="text-xs font-mono opacity-50">{tier.minScore}+ score</span>
                    </div>
                    <p className="text-sm opacity-75">{tier.perkDescription}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} className="text-ekiti-green" />
            <h2 className="font-display text-lg font-semibold">Badges</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`rounded-sm border p-5 ${
                  b.earned ? "border-ekiti-gold bg-[#FFF8E7]" : "border-ekiti-neutral/10 bg-white opacity-60"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {b.earned ? (
                    <CheckCircle2 size={15} className="text-ekiti-green" />
                  ) : (
                    <Lock size={15} className="opacity-40" />
                  )}
                  <span className="text-sm font-semibold">{b.label}</span>
                </div>
                <p className="text-xs opacity-70">{b.description}</p>
              </div>
            ))}
          </div>
        </section>

        {civicScoreLog.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-semibold mb-4">Recent score changes</h2>
            <ul className="flex flex-col gap-2">
              {civicScoreLog.slice(0, 10).map((e) => (
                <li key={e.id} className="flex items-center justify-between text-sm font-mono">
                  <span className="opacity-70">{e.reason}</span>
                  <span className={e.delta >= 0 ? "text-ekiti-green" : "text-red-600"}>
                    {e.delta >= 0 ? "+" : ""}
                    {e.delta}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
