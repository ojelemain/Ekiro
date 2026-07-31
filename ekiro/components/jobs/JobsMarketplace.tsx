"use client";

import React, { useMemo, useState } from "react";
import { Briefcase, CheckCircle2, ClipboardList, CreditCard, Search, Star, UserPlus } from "lucide-react";
import { useIdentity } from "@/context/IdentityContext";
import { useWallet } from "@/context/WalletContext";
import { JOB_CATEGORIES, useJobs, type JobCategory } from "@/context/JobsContext";
import IdentityGate from "@/components/identity/IdentityGate";

type Tab = "browse" | "become" | "bookings";

export default function JobsMarketplace() {
  const { isVerified, profile } = useIdentity();
  const [tab, setTab] = useState<Tab>("browse");

  if (!isVerified) return <IdentityGate />;

  return (
    <div className="min-h-screen bg-ekiti-canvas">
      <header className="px-5 sm:px-10 py-6 border-b border-ekiti-neutral/10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-ekiti-green mb-1">
          Jobs Marketplace
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-medium">Real work, real recurring income</h1>
        <p className="text-xs opacity-60 mt-1">
          Keep 100% of every booking. EKIRO charges a flat ₦500/month listing fee instead of a per-job cut —
          nothing to gain by taking a job off the app.
        </p>
      </header>

      <ListingStatusBanner />

      <div className="px-5 sm:px-10 pt-5 flex gap-2 flex-wrap">
        <TabButton active={tab === "browse"} onClick={() => setTab("browse")} icon={Search} label="Browse workers" />
        <TabButton active={tab === "become"} onClick={() => setTab("become")} icon={UserPlus} label="Become a worker" />
        <TabButton active={tab === "bookings"} onClick={() => setTab("bookings")} icon={ClipboardList} label="My bookings" />
      </div>

      <main className="px-5 sm:px-10 py-6">
        {tab === "browse" && <BrowseWorkers />}
        {tab === "become" && <BecomeWorker fullName={profile.fullName} onDone={() => setTab("bookings")} />}
        {tab === "bookings" && <MyBookings />}
      </main>
    </div>
  );
}

function ListingStatusBanner() {
  const { isListingActive, listingExpiresAt, monthlyListingFeeNaira, payListingFee } = useWallet();
  const [justPaid, setJustPaid] = useState(false);

  const handlePay = async () => {
    await payListingFee();
    setJustPaid(true);
  };

  return (
    <div
      className={`mx-5 sm:mx-10 mt-5 rounded-sm px-5 py-4 flex items-center justify-between gap-4 flex-wrap text-sm ${
        isListingActive ? "bg-[#EAF2ED] text-ekiti-green" : "bg-[#FFF8E7] text-ekiti-neutral"
      }`}
    >
      <div className="flex items-center gap-2">
        <CreditCard size={16} />
        {isListingActive && listingExpiresAt ? (
          <span>
            Your worker listing is active until <strong>{new Date(listingExpiresAt).toLocaleDateString()}</strong>.
          </span>
        ) : (
          <span>
            {justPaid
              ? "Payment received — your listing is now active."
              : `Pay ₦${monthlyListingFeeNaira} to activate or renew your worker listing for 30 days.`}
          </span>
        )}
      </div>
      {!isListingActive && (
        <button
          type="button"
          onClick={handlePay}
          className="min-h-[40px] px-4 rounded-sm bg-ekiti-gold text-ekiti-neutral font-semibold text-xs"
        >
          Pay ₦{monthlyListingFeeNaira}/month
        </button>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Search;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 min-h-[48px] rounded-sm text-sm font-semibold ${
        active ? "bg-ekiti-green text-white" : "border border-ekiti-neutral/20"
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );
}

function BrowseWorkers() {
  const { workers, bookWorker } = useJobs();
  const [category, setCategory] = useState<JobCategory | "all">("all");
  const [bookedMessage, setBookedMessage] = useState<Record<string, string>>({});

  const filtered = useMemo(
    () => (category === "all" ? workers : workers.filter((w) => w.category === category)),
    [workers, category]
  );

  const handleBook = async (workerId: string) => {
    const booking = await bookWorker(workerId, "Booked via EKIRO Jobs Marketplace");
    setBookedMessage((prev) => ({
      ...prev,
      [workerId]: booking ? "Request sent — check My Bookings" : "Unable to book right now",
    }));
  };

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`px-3 py-2 rounded-full text-xs font-semibold ${
            category === "all" ? "bg-ekiti-neutral text-white" : "border border-ekiti-neutral/20"
          }`}
        >
          All
        </button>
        {JOB_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCategory(c.key)}
            className={`px-3 py-2 rounded-full text-xs font-semibold ${
              category === c.key ? "bg-ekiti-neutral text-white" : "border border-ekiti-neutral/20"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((w) => (
          <div key={w.id} className="rounded-sm border border-ekiti-neutral/10 bg-white p-6 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-medium">{w.name}</h3>
                <span className="text-xs font-mono opacity-60">
                  {JOB_CATEGORIES.find((c) => c.key === w.category)?.label}
                </span>
              </div>
              {w.rating > 0 && (
                <span className="flex items-center gap-1 text-xs font-mono">
                  <Star size={13} className="text-ekiti-gold fill-ekiti-gold" /> {w.rating.toFixed(1)}
                </span>
              )}
            </div>
            <p className="text-sm opacity-75 leading-relaxed">{w.bio}</p>
            <div className="flex items-center justify-between text-xs font-mono opacity-60">
              <span>{w.completedJobs} jobs completed</span>
              <span>
                ₦{w.rateNaira.toLocaleString()} {w.rateUnit}
              </span>
            </div>
            {bookedMessage[w.id] ? (
              <div className="min-h-[48px] flex items-center justify-center rounded-sm bg-[#EAF2ED] text-ekiti-green text-sm font-semibold">
                {bookedMessage[w.id]}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleBook(w.id)}
                className="min-h-[48px] rounded-sm bg-ekiti-neutral text-white font-semibold text-sm"
              >
                Book now
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BecomeWorker({ fullName, onDone }: { fullName: string; onDone: () => void }) {
  const { registerAsWorker } = useJobs();
  const [category, setCategory] = useState<JobCategory>("plumbing");
  const [bio, setBio] = useState("");
  const [rate, setRate] = useState("");
  const [rateUnit, setRateUnit] = useState<"per job" | "per hour">("per job");
  const [registered, setRegistered] = useState(false);

  const submit = async () => {
    const rateNaira = Number(rate);
    if (!bio.trim() || !Number.isFinite(rateNaira) || rateNaira <= 0) return;
    const created = await registerAsWorker({ name: fullName || "New worker", category, bio, rateNaira, rateUnit });
    if (created) setRegistered(true);
  };

  if (registered) {
    return (
      <div className="max-w-md flex flex-col items-center text-center gap-3 py-10 mx-auto">
        <CheckCircle2 size={40} className="text-ekiti-green" />
        <h2 className="font-display text-xl font-medium">You're listed</h2>
        <p className="text-sm opacity-70">
          Customers can now find you under {JOB_CATEGORIES.find((c) => c.key === category)?.label}. You keep
          100% of every booking — pay the flat ₦500/month listing fee above to go live and start receiving
          requests.
        </p>
        <button
          type="button"
          onClick={onDone}
          className="mt-2 min-h-[52px] px-6 rounded-sm bg-ekiti-gold text-ekiti-neutral font-semibold"
        >
          View my bookings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <Briefcase size={18} className="text-ekiti-green" />
        <h2 className="font-display text-lg font-medium">List your skill</h2>
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Category</div>
        <div className="flex flex-wrap gap-2">
          {JOB_CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={`px-3 py-2 rounded-full text-xs font-semibold ${
                category === c.key ? "bg-ekiti-neutral text-white" : "border border-ekiti-neutral/20"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Short bio / what you offer</div>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="e.g. Pipe repairs, tank installation, borehole fittings."
          className="w-full px-3.5 py-3 rounded-sm border border-ekiti-neutral/15 bg-white text-sm outline-none focus:border-ekiti-gold"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <div className="text-sm font-semibold mb-2">Rate (₦)</div>
          <input
            value={rate}
            onChange={(e) => setRate(e.target.value.replace(/\D/g, ""))}
            placeholder="5000"
            className="w-full min-h-[52px] px-3.5 rounded-sm border border-ekiti-neutral/15 bg-white text-sm outline-none focus:border-ekiti-gold"
          />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold mb-2">Per</div>
          <div className="flex gap-2">
            {(["per job", "per hour"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setRateUnit(u)}
                className={`flex-1 min-h-[52px] rounded-sm text-sm font-semibold ${
                  rateUnit === u ? "bg-ekiti-neutral text-white" : "border border-ekiti-neutral/20"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={submit}
        className="mt-2 min-h-[52px] rounded-sm bg-ekiti-gold text-ekiti-neutral font-semibold"
      >
        List me on the marketplace
      </button>
    </div>
  );
}

function MyBookings() {
  const { bookings, acceptBooking, completeBooking } = useJobs();
  const { settleJobPayout } = useWallet();
  const [paidOut, setPaidOut] = useState<Record<string, boolean>>({});

  const totalEarned = bookings
    .filter((b) => paidOut[b.id])
    .reduce((sum, b) => sum + b.agreedNaira, 0);

  const handleComplete = (bookingId: string, gross: number) => {
    completeBooking(bookingId);
    settleJobPayout(bookingId, gross);
    setPaidOut((prev) => ({ ...prev, [bookingId]: true }));
  };

  if (bookings.length === 0) {
    return (
      <p className="text-sm opacity-60 max-w-md">
        No bookings yet. Once someone books you from the Browse tab, requests will appear here.
      </p>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-sm bg-ekiti-neutral text-white p-5 mb-6 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-widest opacity-70">Total earned (100% — no per-job cut)</span>
        <span className="font-display text-2xl text-ekiti-gold">₦{totalEarned.toLocaleString()}</span>
      </div>

      <ul className="flex flex-col gap-3">
        {bookings.map((b) => (
          <li key={b.id} className="rounded-sm border border-ekiti-neutral/10 bg-white p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="font-medium text-sm">{b.workerName}</div>
              <div className="text-xs font-mono opacity-60">{b.note}</div>
              <div className="text-xs font-mono opacity-50 mt-1">
                ₦{b.agreedNaira.toLocaleString()} · {new Date(b.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div>
              {b.status === "requested" && (
                <button
                  type="button"
                  onClick={() => acceptBooking(b.id)}
                  className="min-h-[44px] px-4 rounded-sm bg-ekiti-neutral text-white text-sm font-semibold"
                >
                  Accept
                </button>
              )}
              {b.status === "accepted" && (
                <button
                  type="button"
                  onClick={() => handleComplete(b.id, b.agreedNaira)}
                  className="min-h-[44px] px-4 rounded-sm bg-ekiti-gold text-ekiti-neutral text-sm font-semibold"
                >
                  Mark complete &amp; get paid
                </button>
              )}
              {b.status === "completed" && (
                <span className="min-h-[44px] px-4 flex items-center rounded-sm bg-[#EAF2ED] text-ekiti-green text-sm font-semibold">
                  Paid
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
