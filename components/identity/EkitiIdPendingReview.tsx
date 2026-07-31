"use client";

import React from "react";
import { CreditCard } from "lucide-react";
import { useIdentity } from "@/context/IdentityContext";

export default function EkitiIdPendingReview() {
  const { profile, approveVerification } = useIdentity();
  const isIndigene = profile.verificationPath === "indigene";

  return (
    <div className="min-h-screen bg-ekiti-canvas flex items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <div className="w-[72px] h-[72px] rounded-full bg-[#EAF2ED] flex items-center justify-center mx-auto mb-5">
          <CreditCard size={32} className="text-ekiti-green" />
        </div>
        <h1 className="font-display text-2xl font-medium mb-2">
          {isIndigene ? "Pending LGA review" : "Pending residency review"}
        </h1>
        <p className="text-sm opacity-70 leading-relaxed mb-6">
          {isIndigene
            ? `Your details have been sent to ${profile.lgaName || "your"} Local Government office for verification. This usually takes 24–48 hours once your proof of origin is checked.`
            : "Your details have been sent for verification against your proof of residence. This usually takes 24–48 hours."}
        </p>
        <button
          type="button"
          onClick={approveVerification}
          className="min-h-[56px] px-6 rounded-sm bg-ekiti-gold text-ekiti-neutral font-semibold"
        >
          Simulate approval (demo)
        </button>
      </div>
    </div>
  );
}
