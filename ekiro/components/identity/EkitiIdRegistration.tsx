"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Home,
  MapPin,
  Phone,
  Plane,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import {
  LGAS,
  INDIGENE_PROOF_TYPES,
  RESIDENT_PROOF_TYPES,
  useIdentity,
  type ResidencyType,
  type VerificationPath,
} from "@/context/IdentityContext";

const RESIDENCY_OPTIONS: { key: ResidencyType; label: string; icon: typeof Home }[] = [
  { key: "resident", label: "I live in Ekiti", icon: Home },
  { key: "elsewhere", label: "I live elsewhere in Nigeria", icon: Building2 },
  { key: "diaspora", label: "I live abroad (diaspora)", icon: Plane },
];

const PATH_STEPS = ["Choose path", "Basic details", "Verification", "NIN", "Review"];

export default function EkitiIdRegistration() {
  const { profile, updateProfile, submitForVerification } = useIdentity();
  const [step, setStep] = useState(0);
  const path = profile.verificationPath;

  const canProceed = () => {
    if (step === 0) return !!path;
    if (step === 1) return profile.fullName.trim().length > 2 && profile.dob && profile.phone.trim().length >= 7;
    if (step === 2) {
      if (path === "indigene") return !!profile.lgaCode && !!profile.proofType && !!profile.residency;
      return profile.currentAddress.trim().length > 3 && !!profile.residentProofType;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-ekiti-canvas">
      <header className="px-6 py-6 border-b border-ekiti-neutral/10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-ekiti-green mb-1">
          Ekiti Digital Identity
        </div>
        <h1 className="font-display text-2xl font-medium">Register for your Ekiti ID</h1>
      </header>

      <div className="px-6 pt-4 flex gap-1.5">
        {PATH_STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div className={`h-1 rounded-full ${i <= step ? "bg-ekiti-green" : "bg-ekiti-neutral/10"}`} />
            <div className={`text-[10px] font-mono mt-1.5 ${i === step ? "opacity-100" : "opacity-40"}`}>{label}</div>
          </div>
        ))}
      </div>

      <main className="px-6 py-6 max-w-lg">
        {step === 0 && <ChoosePath path={path} onSelect={(p) => updateProfile({ verificationPath: p })} />}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Field icon={User} label="Full name">
              <input
                value={profile.fullName}
                onChange={(e) => updateProfile({ fullName: e.target.value })}
                placeholder="e.g. Adekunle Olufemi Ojo"
                className="w-full min-h-[52px] px-3.5 rounded-sm border border-ekiti-neutral/15 bg-white text-sm outline-none focus:border-ekiti-gold"
              />
            </Field>
            <Field icon={User} label="Date of birth">
              <input
                type="date"
                value={profile.dob}
                onChange={(e) => updateProfile({ dob: e.target.value })}
                className="w-full min-h-[52px] px-3.5 rounded-sm border border-ekiti-neutral/15 bg-white text-sm outline-none focus:border-ekiti-gold"
              />
            </Field>
            <Field icon={Phone} label="Phone number">
              <input
                value={profile.phone}
                onChange={(e) => updateProfile({ phone: e.target.value })}
                placeholder="080..."
                className="w-full min-h-[52px] px-3.5 rounded-sm border border-ekiti-neutral/15 bg-white text-sm outline-none focus:border-ekiti-gold"
              />
            </Field>
          </div>
        )}

        {step === 2 && path === "indigene" && (
          <div className="flex flex-col gap-5">
            <div>
              <FieldLabel icon={MapPin}>LGA of origin</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {LGAS.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => updateProfile({ lgaCode: l.code })}
                    className={`px-3 py-2.5 rounded-sm text-xs text-left ${
                      profile.lgaCode === l.code ? "border border-ekiti-gold bg-[#FFF8E7] font-semibold" : "border border-ekiti-neutral/15 bg-white"
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel icon={ShieldCheck}>Proof of origin</FieldLabel>
              <div className="flex flex-col gap-2">
                {INDIGENE_PROOF_TYPES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateProfile({ proofType: p })}
                    className={`px-4 py-3.5 rounded-sm text-sm text-left ${
                      profile.proofType === p ? "border border-ekiti-gold bg-[#FFF8E7]" : "border border-ekiti-neutral/15 bg-white"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Where do you currently live?</FieldLabel>
              <div className="flex flex-col gap-2">
                {RESIDENCY_OPTIONS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateProfile({ residency: key })}
                    className={`flex items-center gap-2.5 px-4 py-3.5 rounded-sm text-sm text-left ${
                      profile.residency === key ? "border border-ekiti-gold bg-[#FFF8E7]" : "border border-ekiti-neutral/15 bg-white"
                    }`}
                  >
                    <Icon size={16} className="text-ekiti-green" /> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && path === "resident" && (
          <div className="flex flex-col gap-5">
            <Field icon={MapPin} label="Current address / area in Ekiti">
              <input
                value={profile.currentAddress}
                onChange={(e) => updateProfile({ currentAddress: e.target.value })}
                placeholder="e.g. No. 4 Fajuyi Road, Ado-Ekiti"
                className="w-full min-h-[52px] px-3.5 rounded-sm border border-ekiti-neutral/15 bg-white text-sm outline-none focus:border-ekiti-gold"
              />
            </Field>
            <div>
              <FieldLabel icon={ShieldCheck}>Proof of residence</FieldLabel>
              <div className="flex flex-col gap-2">
                {RESIDENT_PROOF_TYPES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateProfile({ residentProofType: p })}
                    className={`px-4 py-3.5 rounded-sm text-sm text-left ${
                      profile.residentProofType === p ? "border border-ekiti-gold bg-[#FFF8E7]" : "border border-ekiti-neutral/15 bg-white"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <Field icon={CreditCard} label="NIN (optional — you can add this later)">
            <input
              value={profile.nin}
              onChange={(e) => updateProfile({ nin: e.target.value.replace(/\D/g, "").slice(0, 11) })}
              placeholder="11-digit NIN"
              className="w-full min-h-[52px] px-3.5 rounded-sm border border-ekiti-neutral/15 bg-white text-sm outline-none focus:border-ekiti-gold"
            />
          </Field>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-1 text-sm">
            <SummaryRow label="Verification path" value={path === "indigene" ? "Indigene Verification" : "Resident Access"} />
            <SummaryRow label="Full name" value={profile.fullName} />
            <SummaryRow label="Date of birth" value={profile.dob} />
            <SummaryRow label="Phone" value={profile.phone} />
            {path === "indigene" ? (
              <>
                <SummaryRow label="LGA of origin" value={profile.lgaName} />
                <SummaryRow label="Proof of origin" value={profile.proofType} />
                <SummaryRow label="Residency" value={RESIDENCY_OPTIONS.find((r) => r.key === profile.residency)?.label} />
              </>
            ) : (
              <>
                <SummaryRow label="Current address" value={profile.currentAddress} />
                <SummaryRow label="Proof of residence" value={profile.residentProofType} />
              </>
            )}
            <SummaryRow label="NIN" value={profile.nin || "Not provided yet"} />
            <p className="text-xs opacity-60 mt-3">
              {path === "indigene"
                ? `By submitting, this information is sent to ${profile.lgaName || "your"} Local Government for verification against your proof of origin.`
                : "By submitting, this information is sent for verification against your proof of residence. This grants full access to earn and learn on EKIRO."}
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 min-h-[52px] px-5 rounded-sm border border-ekiti-neutral/20 font-semibold"
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}
          {step < 4 ? (
            <button
              type="button"
              disabled={!canProceed()}
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 flex items-center justify-center gap-1.5 min-h-[52px] rounded-sm bg-ekiti-neutral text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={submitForVerification}
              className="flex-1 min-h-[52px] rounded-sm bg-ekiti-gold text-ekiti-neutral font-semibold"
            >
              Submit for verification
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function ChoosePath({ path, onSelect }: { path: VerificationPath | null; onSelect: (p: VerificationPath) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm opacity-70 leading-relaxed">
        Earning and learning on EKIRO doesn't require Ekiti ancestry — anyone who lives or works here can
        join. Indigene status stays reserved for a few heritage-specific programs later (diaspora investment,
        scholarship slots, land programs).
      </p>

      <button
        type="button"
        onClick={() => onSelect("resident")}
        className={`text-left p-5 rounded-sm border ${
          path === "resident" ? "border-ekiti-gold bg-[#FFF8E7]" : "border-ekiti-neutral/15 bg-white"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Briefcase size={18} className="text-ekiti-green" />
          <span className="font-display text-lg font-medium">Resident Access</span>
        </div>
        <p className="text-sm opacity-75 leading-relaxed">
          I live or work in Ekiti right now, regardless of where I'm originally from. Unlocks Jobs Marketplace,
          Teaching Hub, Voice Hub, Market, and Tasker Radar.
        </p>
      </button>

      <button
        type="button"
        onClick={() => onSelect("indigene")}
        className={`text-left p-5 rounded-sm border ${
          path === "indigene" ? "border-ekiti-gold bg-[#FFF8E7]" : "border-ekiti-neutral/15 bg-white"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={18} className="text-ekiti-green" />
          <span className="font-display text-lg font-medium">Indigene Verification</span>
        </div>
        <p className="text-sm opacity-75 leading-relaxed">
          I'm an Ekiti indigene by birth or descent. Includes everything in Resident Access, plus eligibility for
          diaspora and heritage-based programs later.
        </p>
      </button>
    </div>
  );
}

function Field({ icon: Icon, label, children }: { icon: typeof User; label: string; children: React.ReactNode }) {
  return (
    <div>
      <FieldLabel icon={Icon}>{label}</FieldLabel>
      {children}
    </div>
  );
}

function FieldLabel({ icon: Icon, children }: { icon?: typeof User; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-sm font-semibold mb-2.5">
      {Icon && <Icon size={14} className="text-ekiti-green" />} {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-ekiti-neutral/10">
      <span className="opacity-60">{label}</span>
      <span className="font-medium text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );
}
