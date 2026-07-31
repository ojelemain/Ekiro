"use client";

import React from "react";
import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { useIdentity } from "@/context/IdentityContext";

const RESIDENCY_LABELS: Record<string, string> = {
  resident: "I live in Ekiti",
  elsewhere: "I live elsewhere in Nigeria",
  diaspora: "I live abroad (diaspora)",
};

export default function EkitiIdCard() {
  const { profile, issuedId } = useIdentity();

  if (!issuedId) return null;

  const isIndigene = issuedId.verificationPath === "indigene";

  return (
    <div className="min-h-screen bg-ekiti-canvas flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-5">
          <CheckCircle2 size={40} className="text-ekiti-green mx-auto" />
          <h1 className="font-display text-xl font-medium mt-3 mb-1">Ekiti ID issued</h1>
          <p className="text-xs opacity-60">Verified by {issuedId.verifiedByLga}</p>
        </div>

        <div className="rounded-sm bg-ekiti-neutral text-white p-6 border-t-4 border-ekiti-gold">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded flex items-center justify-center bg-ekiti-green">
                <span className="text-[11px] font-bold font-mono">EK</span>
              </div>
              <span className="text-sm font-semibold">Ekiti State Digital ID</span>
            </div>
            <ShieldCheck size={20} className="text-ekiti-gold" />
          </div>

          <div className="font-mono text-xl tracking-wide text-ekiti-gold mb-2">{issuedId.idNumber}</div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-white/60 mb-5">
            {isIndigene ? "Indigene Verification" : "Resident Access"}
          </div>

          <div className="flex flex-col gap-2.5 text-sm">
            <Row label="Name" value={profile.fullName} />
            {isIndigene ? (
              <>
                <Row label="LGA of origin" value={profile.lgaName} />
                <Row label="Residency" value={profile.residency ? RESIDENCY_LABELS[profile.residency] : "—"} />
              </>
            ) : (
              <Row label="Current address" value={profile.currentAddress} />
            )}
            <Row label="NIN" value={profile.nin ? `${profile.nin.slice(0, 3)}••••••••` : "Not linked yet"} />
          </div>

          <div className="mt-5 pt-4 border-t border-white/15 text-[11px] font-mono opacity-50">
            {isIndigene
              ? "Unlocks: Jobs · Teaching Hub · Wallet · Diaspora & heritage programs"
              : "Unlocks: Jobs · Teaching Hub · Wallet · Voice Hub · Market · Radar"}
          </div>
        </div>

        {!profile.nin && (
          <button
            type="button"
            className="mt-4 w-full min-h-[52px] rounded-sm bg-[#EAF2ED] text-ekiti-green font-semibold flex items-center justify-center gap-2"
          >
            <CreditCard size={16} /> Link my NIN now
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between">
      <span className="opacity-60">{label}</span>
      <span>{value || "—"}</span>
    </div>
  );
}
