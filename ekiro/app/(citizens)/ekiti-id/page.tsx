"use client";

import React from "react";
import { useIdentity } from "@/context/IdentityContext";
import EkitiIdRegistration from "@/components/identity/EkitiIdRegistration";
import EkitiIdPendingReview from "@/components/identity/EkitiIdPendingReview";
import EkitiIdCard from "@/components/identity/EkitiIdCard";

export default function EkitiIdPage() {
  const { status, isLoading } = useIdentity();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ekiti-canvas flex items-center justify-center">
        <p className="text-sm opacity-60">Loading your Ekiti ID…</p>
      </div>
    );
  }

  if (status === "verified") return <EkitiIdCard />;
  if (status === "pending") return <EkitiIdPendingReview />;
  return <EkitiIdRegistration />;
}
