"use client";

import React from "react";
import Link from "next/link";
import {
  Award,
  Briefcase,
  ClipboardList,
  CreditCard,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Sparkles,
  Wallet as WalletIcon,
} from "lucide-react";
import { useIdentity } from "@/context/IdentityContext";
import { useWallet } from "@/context/WalletContext";
import { useJobs, JOB_CATEGORIES } from "@/context/JobsContext";
import { useTeachingHub, GRADUATION_JOBS_THRESHOLD } from "@/context/TeachingHubContext";
import { useReputation } from "@/context/ReputationContext";
import IdentityGate from "@/components/identity/IdentityGate";

export default function UserDashboard() {
  const { profile, issuedId, isVerified, isIndigeneVerified } = useIdentity();
  const {
    balanceNaira,
    civicScore,
    isListingActive,
    listingExpiresAt,
    monthlyListingFeeNaira,
    jobSettlements,
    settlements,
  } = useWallet();
  const { bookings } = useJobs();
  const { applications } = useTeachingHub();
  const { currentTier } = useReputation();

  if (!isVerified) return <IdentityGate />;

  const pendingBookings = bookings.filter((b) => b.status !== "completed").length;
  const completedBookings = bookings.filter((b) => b.status === "completed").length;
  const totalJobsEarned = jobSettlements.reduce((sum, s) => sum + s.workerShareNaira, 0);
  const totalTaskEarned = settlements.reduce((sum, s) => sum + s.taskerShareNaira, 0);
  const activeApprenticeships = applications.filter((a) => a.status === "training");
  const graduatedApprenticeships = applications.filter((a) => a.status === "graduated");

  return (
    <div className="min-h-screen bg-ekiti-canvas">
      <header className="px-5 sm:px-10 py-6 border-b border-ekiti-neutral/10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-ekiti-green mb-1">
          Your Dashboard
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-medium">
          {profile.fullName ? `Welcome back, ${profile.fullName.split(" ")[0]}` : "Welcome back"}
        </h1>
      </header>

      <main className="px-5 sm:px-10 py-6 grid gap-5 lg:grid-cols-3">
        <section className="lg:col-span-1 rounded-sm bg-ekiti-neutral text-white p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-ekiti-gold">
            <ShieldCheck size={18} />
            <span className="font-mono text-[11px] uppercase tracking-widest">
              {isIndigeneVerified ? "Indigene Verification" : "Resident Access"}
            </span>
          </div>
          <div className="font-mono text-lg tracking-wide">{issuedId?.idNumber}</div>
          <div className="flex flex-col gap-2 text-sm pt-3 border-t border-white/10">
            <Row label="Name" value={profile.fullName} />
            {isIndigeneVerified ? (
              <Row label="LGA of origin" value={profile.lgaName} />
            ) : (
              <Row label="Address" value={profile.currentAddress} />
            )}
            <Row label="NIN" value={profile.nin ? "Linked" : "Not linked"} />
          </div>
          {isIndigeneVerified && (
            <div className="flex items-center gap-2 text-xs font-mono text-ekiti-gold pt-2">
              <Sparkles size={13} /> Eligible for diaspora & heritage programs
            </div>
          )}
        </section>

        <section className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
          <StatCard icon={WalletIcon} label="Wallet balance" value={`₦${balanceNaira.toLocaleString()}`} accent />
          <StatCard icon={Award} label={`Civic score · ${currentTier.name}`} value={String(civicScore)} />
          <div className="sm:col-span-2 -mt-2">
            <Link href="/reputation" className="text-xs font-semibold text-ekiti-green">
              View full reputation & badges →
            </Link>
          </div>
          <StatCard
            icon={Briefcase}
            label="Jobs earned (100% share)"
            value={`₦${totalJobsEarned.toLocaleString()}`}
          />
          <StatCard
            icon={MapPin}
            label="Civic tasks earned (20% share)"
            value={`₦${totalTaskEarned.toLocaleString()}`}
          />
        </section>

        <section className="lg:col-span-3 rounded-sm border border-ekiti-neutral/10 bg-white p-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <CreditCard size={20} className="text-ekiti-green" />
            <div>
              <div className="text-sm font-semibold">Worker listing status</div>
              <div className="text-xs opacity-60">
                {isListingActive && listingExpiresAt
                  ? `Active until ${new Date(listingExpiresAt).toLocaleDateString()}`
                  : `Not active — pay ₦${monthlyListingFeeNaira}/month to be bookable`}
              </div>
            </div>
          </div>
          <Link
            href="/jobs"
            className="min-h-[44px] px-4 flex items-center rounded-sm bg-ekiti-neutral text-white text-sm font-semibold"
          >
            Manage listing
          </Link>
        </section>

        <section className="lg:col-span-1 rounded-sm border border-ekiti-neutral/10 bg-white p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-ekiti-green" />
            <h2 className="font-display text-lg font-medium">Bookings</h2>
          </div>
          <Row label="Pending / in progress" value={String(pendingBookings)} />
          <Row label="Completed" value={String(completedBookings)} />
          <Link href="/jobs" className="mt-2 text-sm font-semibold text-ekiti-green">
            View Jobs Marketplace →
          </Link>
        </section>

        <section className="lg:col-span-2 rounded-sm border border-ekiti-neutral/10 bg-white p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-ekiti-green" />
            <h2 className="font-display text-lg font-medium">Teaching Hub progress</h2>
          </div>
          {activeApprenticeships.length === 0 && graduatedApprenticeships.length === 0 ? (
            <p className="text-sm opacity-60">
              Not currently training or supervising anyone. Visit the Teaching Hub to apply under a Master or
              open your own apprentice slots.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {activeApprenticeships.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span>
                    {a.applicantName} · {JOB_CATEGORIES.find((c) => c.key === a.category)?.label}
                  </span>
                  <span className="font-mono text-xs opacity-60">
                    {a.completedSupervisedJobs}/{GRADUATION_JOBS_THRESHOLD} jobs
                  </span>
                </div>
              ))}
              {graduatedApprenticeships.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm text-ekiti-green">
                  <span>{a.applicantName}</span>
                  <span className="font-mono text-xs">Graduated</span>
                </div>
              ))}
            </div>
          )}
          <Link href="/teaching-hub" className="mt-2 text-sm font-semibold text-ekiti-green">
            Open Teaching Hub →
          </Link>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof WalletIcon;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-sm p-5 flex flex-col gap-2 ${
        accent ? "bg-ekiti-neutral text-white" : "border border-ekiti-neutral/10 bg-white"
      }`}
    >
      <div className={`flex items-center gap-2 ${accent ? "text-ekiti-gold" : "text-ekiti-green"}`}>
        <Icon size={16} />
        <span className="font-mono text-[11px] uppercase tracking-widest">{label}</span>
      </div>
      <div className="font-display text-2xl font-medium">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="opacity-60">{label}</span>
      <span className="font-medium text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );
}
