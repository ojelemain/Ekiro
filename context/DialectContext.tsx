"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type DialectCode = "en" | "eki-yo";

export interface DialectPhraseSet {
  greeting: string;
  askListing: string;
  confirm: string;
  cancel: string;
  recording: string;
  submitted: string;
}

const PHRASES: Record<DialectCode, DialectPhraseSet> = {
  en: {
    greeting: "Welcome. Tell us what you want to do.",
    askListing: "What do you want to sell or report?",
    confirm: "Yes, submit this",
    cancel: "No, start again",
    recording: "Listening...",
    submitted: "Your voice note has been received.",
  },
  "eki-yo": {
    greeting: "Ẹ káàbọ̀. Sọ ohun tí o fẹ́ ṣe.",
    askListing: "Kílo fẹ́ tà tàbí kọ?",
    confirm: "Bẹ́ẹ̀ni, fi ránṣẹ́",
    cancel: "Rárá, tún un ṣe",
    recording: "À ń gbọ́ ọ̀rọ̀ rẹ...",
    submitted: "A ti gba ọ̀rọ̀ rẹ.",
  },
};

interface DialectContextValue {
  dialect: DialectCode;
  setDialect: (d: DialectCode) => void;
  toggleDialect: () => void;
  phrases: DialectPhraseSet;
  isAudioFirst: boolean;
  setAudioFirst: (v: boolean) => void;
}

const DialectContext = createContext<DialectContextValue | undefined>(undefined);

export function DialectProvider({ children }: { children: React.ReactNode }) {
  const [dialect, setDialect] = useState<DialectCode>("eki-yo");
  const [isAudioFirst, setAudioFirst] = useState<boolean>(true);

  const toggleDialect = useCallback(() => {
    setDialect((prev) => (prev === "en" ? "eki-yo" : "en"));
  }, []);

  const value = useMemo<DialectContextValue>(
    () => ({
      dialect,
      setDialect,
      toggleDialect,
      phrases: PHRASES[dialect],
      isAudioFirst,
      setAudioFirst,
    }),
    [dialect, isAudioFirst, toggleDialect]
  );

  return <DialectContext.Provider value={value}>{children}</DialectContext.Provider>;
}

export function useDialect(): DialectContextValue {
  const ctx = useContext(DialectContext);
  if (!ctx) {
    throw new Error("useDialect must be used within a DialectProvider");
  }
  return ctx;
}
