"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getSavedIdentityId, saveIdentityId } from "@/lib/apiClient";

export type ResidencyType = "resident" | "elsewhere" | "diaspora";
export type VerificationStatus = "unregistered" | "draft" | "pending" | "verified" | "rejected";
export type VerificationPath = "resident" | "indigene";

export const RESIDENT_PROOF_TYPES: string[] = [
  "Utility bill with Ekiti address",
  "Employer or business registration letter",
  "Landlord / rental agreement confirmation",
  "Local Government resident attestation",
];

export const INDIGENE_PROOF_TYPES: string[] = [
  "Birth certificate (Ekiti LGA)",
  "Certificate of Indigeneship",
  "Local Government attestation letter",
  "Parent's indigene certificate",
];

/** @deprecated use INDIGENE_PROOF_TYPES */
export const PROOF_TYPES = INDIGENE_PROOF_TYPES;

export const LGAS: { code: string; name: string }[] = [
  { code: "ADO", name: "Ado-Ekiti" },
  { code: "EFO", name: "Efon" },
  { code: "EAS", name: "Ekiti East" },
  { code: "ESW", name: "Ekiti South-West" },
  { code: "EWE", name: "Ekiti West" },
  { code: "EMU", name: "Emure" },
  { code: "GBO", name: "Gbonyin" },
  { code: "IDO", name: "Ido-Osi" },
  { code: "IJE", name: "Ijero" },
  { code: "IKR", name: "Ikere" },
  { code: "IKL", name: "Ikole" },
  { code: "ILJ", name: "Ilejemeje" },
  { code: "IRE", name: "Irepodun/Ifelodun" },
  { code: "ISO", name: "Ise/Orun" },
  { code: "MOB", name: "Moba" },
  { code: "OYE", name: "Oye" },
];

export interface EkitiIdProfile {
  fullName: string;
  dob: string;
  phone: string;
  verificationPath: VerificationPath | null;
  lgaCode: string;
  lgaName: string;
  proofType: string;
  residency: ResidencyType | null;
  currentAddress: string;
  residentProofType: string;
  nin: string;
}

export interface IssuedEkitiId {
  idNumber: string;
  issuedAt: number;
  verifiedByLga: string;
  verificationPath: VerificationPath;
}

const EMPTY_PROFILE: EkitiIdProfile = {
  fullName: "",
  dob: "",
  phone: "",
  verificationPath: null,
  lgaCode: "",
  lgaName: "",
  proofType: "",
  residency: null,
  currentAddress: "",
  residentProofType: "",
  nin: "",
};

interface BackendEkitiId {
  _id: string;
  fullName: string;
  dob: string;
  phone: string;
  verificationPath: VerificationPath;
  lgaCode?: string;
  lgaName?: string;
  proofType?: string;
  residency?: ResidencyType;
  currentAddress?: string;
  residentProofType?: string;
  nin?: string;
  status: "draft" | "pending" | "verified" | "rejected";
  idNumber?: string;
  verifiedByLga?: string;
  issuedAt?: string;
}

function fromBackend(doc: BackendEkitiId): { profile: EkitiIdProfile; status: VerificationStatus; issuedId: IssuedEkitiId | null } {
  const profile: EkitiIdProfile = {
    fullName: doc.fullName ?? "",
    dob: doc.dob ?? "",
    phone: doc.phone ?? "",
    verificationPath: doc.verificationPath ?? null,
    lgaCode: doc.lgaCode ?? "",
    lgaName: doc.lgaName ?? "",
    proofType: doc.proofType ?? "",
    residency: doc.residency ?? null,
    currentAddress: doc.currentAddress ?? "",
    residentProofType: doc.residentProofType ?? "",
    nin: doc.nin ?? "",
  };
  const issuedId: IssuedEkitiId | null = doc.idNumber
    ? {
        idNumber: doc.idNumber,
        issuedAt: doc.issuedAt ? new Date(doc.issuedAt).getTime() : Date.now(),
        verifiedByLga: doc.verifiedByLga ?? "Ekiti State",
        verificationPath: doc.verificationPath,
      }
    : null;
  return { profile, status: doc.status, issuedId };
}

interface IdentityContextValue {
  profile: EkitiIdProfile;
  status: VerificationStatus;
  issuedId: IssuedEkitiId | null;
  identityId: string | null;
  isLoading: boolean;
  updateProfile: (patch: Partial<EkitiIdProfile>) => void;
  submitForVerification: () => Promise<void>;
  approveVerification: () => Promise<IssuedEkitiId | null>;
  linkNin: (nin: string) => Promise<void>;
  isVerified: boolean;
  isIndigeneVerified: boolean;
}

const IdentityContext = createContext<IdentityContextValue | undefined>(undefined);

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<EkitiIdProfile>(EMPTY_PROFILE);
  const [status, setStatus] = useState<VerificationStatus>("unregistered");
  const [issuedId, setIssuedId] = useState<IssuedEkitiId | null>(null);
  const [identityId, setIdentityId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, restore identity from whatever the browser previously saved.
  useEffect(() => {
    const savedId = getSavedIdentityId();
    if (!savedId) {
      setIsLoading(false);
      return;
    }
    api
      .get<BackendEkitiId>(`/api/identity/${savedId}`)
      .then((doc) => {
        const { profile: p, status: s, issuedId: iid } = fromBackend(doc);
        setProfile(p);
        setStatus(s === "draft" ? "draft" : s);
        setIssuedId(iid);
        setIdentityId(doc._id);
      })
      .catch(() => {
        // saved id no longer resolves (e.g. database reset) — start fresh
      })
      .finally(() => setIsLoading(false));
  }, []);

  const updateProfile = useCallback((patch: Partial<EkitiIdProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      if (patch.lgaCode) {
        next.lgaName = LGAS.find((l) => l.code === patch.lgaCode)?.name ?? "";
      }
      return next;
    });
    setStatus((prev) => (prev === "unregistered" ? "draft" : prev));
  }, []);

  const submitForVerification = useCallback(async () => {
    // First save (create if needed), then move to pending.
    let currentId = identityId;
    if (!currentId) {
      const created = await api.post<BackendEkitiId>("/api/identity", profile);
      currentId = created._id;
      setIdentityId(currentId);
      saveIdentityId(currentId);
    }
    const updated = await api.post<BackendEkitiId>(`/api/identity/${currentId}/submit`, {});
    setStatus(updated.status);
  }, [identityId, profile]);

  const approveVerification = useCallback(async (): Promise<IssuedEkitiId | null> => {
    if (!identityId) return null;
    const updated = await api.post<BackendEkitiId>(`/api/identity/${identityId}/approve`, {});
    const { issuedId: iid, status: s } = fromBackend(updated);
    setIssuedId(iid);
    setStatus(s);
    return iid;
  }, [identityId]);

  const linkNin = useCallback(
    async (nin: string) => {
      if (!identityId) return;
      const updated = await api.post<BackendEkitiId>(`/api/identity/${identityId}/link-nin`, { nin });
      setProfile((prev) => ({ ...prev, nin: updated.nin ?? nin }));
    },
    [identityId]
  );

  const value = useMemo<IdentityContextValue>(
    () => ({
      profile,
      status,
      issuedId,
      identityId,
      isLoading,
      updateProfile,
      submitForVerification,
      approveVerification,
      linkNin,
      isVerified: status === "verified",
      isIndigeneVerified: status === "verified" && issuedId?.verificationPath === "indigene",
    }),
    [profile, status, issuedId, identityId, isLoading, updateProfile, submitForVerification, approveVerification, linkNin]
  );

  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>;
}

export function useIdentity(): IdentityContextValue {
  const ctx = useContext(IdentityContext);
  if (!ctx) {
    throw new Error("useIdentity must be used within an IdentityProvider");
  }
  return ctx;
}
