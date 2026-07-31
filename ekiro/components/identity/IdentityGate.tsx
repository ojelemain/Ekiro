"use client";

import React from "react";
import Link from "next/link";
import { CreditCard } from "lucide-react";

export default function IdentityGate() {
  return (
    <div className="min-h-screen bg-ekiti-canvas flex items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <div className="w-[72px] h-[72px] rounded-full bg-[#EAF2ED] flex items-center justify-center mx-auto mb-5">
          <CreditCard size={32} className="text-ekiti-green" />
        </div>
        <h1 className="font-display text-2xl font-medium mb-2">Verify your Ekiti ID first</h1>
        <p className="text-sm opacity-70 leading-relaxed mb-6">
          Earning on EKIRO — bookings, tasks, and payouts — requires a verified Ekiti ID. It only
          takes a few minutes and unlocks everything else on the platform.
        </p>
        <Link
          href="/ekiti-id"
          className="inline-block min-h-[52px] leading-[52px] px-6 rounded-sm bg-ekiti-gold text-ekiti-neutral font-semibold"
        >
          Get your Ekiti ID
        </Link>
      </div>
    </div>
  );
}
