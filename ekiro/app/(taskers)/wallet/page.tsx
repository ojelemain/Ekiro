"use client";

import React, { useState } from "react";
import { ArrowDownCircle, Award, Wallet as WalletIcon } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

export default function WalletPage() {
  const { balanceNaira, civicScore, settlements, civicScoreLog, withdraw } = useWallet();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }
    const success = await withdraw(amount);
    setMessage(success ? `₦${amount.toLocaleString()} sent to your bank.` : "Insufficient balance.");
    if (success) setWithdrawAmount("");
  };

  return (
    <div className="min-h-screen bg-ekiti-canvas">
      <header className="px-5 sm:px-10 py-6 border-b border-ekiti-neutral/10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-ekiti-green mb-1">
          Tasker Wallet
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-medium">Payouts &amp; civic score</h1>
      </header>

      <main className="px-5 sm:px-10 py-8 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-1 rounded-sm bg-ekiti-neutral text-white p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-ekiti-gold">
            <WalletIcon size={20} />
            <span className="font-mono text-[11px] uppercase tracking-widest">Available balance</span>
          </div>
          <div className="font-display text-4xl">₦{balanceNaira.toLocaleString()}</div>

          <div className="mt-4 flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Amount"
              className="flex-1 min-h-[52px] px-3 rounded-sm bg-white/10 text-white placeholder:text-white/40 outline-none"
            />
            <button
              type="button"
              onClick={handleWithdraw}
              className="flex items-center gap-2 px-4 min-h-[52px] rounded-sm bg-ekiti-gold text-ekiti-neutral font-semibold"
            >
              <ArrowDownCircle size={18} /> Withdraw
            </button>
          </div>
          {message && <p className="text-xs font-mono opacity-80">{message}</p>}

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2">
            <Award size={18} className="text-ekiti-gold" />
            <span className="font-mono text-[11px] uppercase tracking-widest opacity-70">Civic score</span>
          </div>
          <div className="font-display text-3xl text-ekiti-gold">{civicScore}</div>
        </section>

        <section className="lg:col-span-2 rounded-sm border border-ekiti-neutral/10 bg-white p-6">
          <h2 className="font-display text-lg font-medium mb-4">Recent settlements</h2>
          {settlements.length === 0 ? (
            <p className="text-sm opacity-60">
              No payouts yet — complete a verified task on the Tasker Radar to see split-settlements appear here.
            </p>
          ) : (
            <ul className="divide-y divide-ekiti-neutral/10">
              {settlements.map((s) => (
                <li key={s.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-mono text-xs opacity-60">{s.taskId}</div>
                    <div className="text-xs opacity-50">{new Date(s.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-ekiti-green font-semibold">
                      +₦{s.taskerShareNaira.toLocaleString()} to you
                    </div>
                    <div className="text-xs opacity-50">
                      ₦{s.treasuryShareNaira.toLocaleString()} to State Treasury
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <h2 className="font-display text-lg font-medium mt-8 mb-4">Civic score history</h2>
          {civicScoreLog.length === 0 ? (
            <p className="text-sm opacity-60">Your civic score changes will appear here.</p>
          ) : (
            <ul className="space-y-2">
              {civicScoreLog.map((e) => (
                <li key={e.id} className="flex items-center justify-between text-xs font-mono">
                  <span className="opacity-70">{e.reason}</span>
                  <span className={e.delta >= 0 ? "text-ekiti-green" : "text-red-600"}>
                    {e.delta >= 0 ? "+" : ""}
                    {e.delta}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
