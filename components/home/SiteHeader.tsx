"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Menu, X } from "lucide-react";

interface NavSection {
  label: string;
  links: { label: string; href: string }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Start here",
    links: [
      { label: "Get your Ekiti ID", href: "/ekiti-id" },
      { label: "My Dashboard", href: "/dashboard" },
      { label: "Civic Reputation", href: "/reputation" },
      { label: "Ekiti AI", href: "/ekiti-ai" },
      { label: "Ekiti AI", href: "/ekiti-ai" },
      { label: "Opportunity Engine", href: "/opportunities" },
    ],
  },
  {
    label: "For citizens",
    links: [
      { label: "Voice & Market Hub", href: "/voice-hub" },
      { label: "Farm to Market", href: "/market" },
      { label: "Price Check & State Store", href: "/price-check" },
      { label: "Talent Engine", href: "/talent" },
      { label: "Innovation Engine", href: "/innovation" },
    ],
  },
  {
    label: "For workers",
    links: [
      { label: "Jobs Marketplace", href: "/jobs" },
      { label: "Teaching Hub", href: "/teaching-hub" },
      { label: "Tasker Radar", href: "/radar" },
      { label: "Wallet", href: "/wallet" },
    ],
  },
  {
    label: "For diaspora",
    links: [{ label: "Diaspora Engine", href: "/diaspora" }],
  },
  {
    label: "For government",
    links: [{ label: "Living State Dashboard", href: "/igr-analytics" }],
  },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="relative flex items-center justify-between px-5 sm:px-10 py-4 border-b border-ekiti-neutral/10 bg-ekiti-canvas">
      <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
        <div className="w-8 h-8 rounded-sm flex items-center justify-center bg-ekiti-green">
          <span className="text-white text-xs font-bold font-mono">EK</span>
        </div>
        <span className="text-sm sm:text-base font-semibold tracking-tight">
          EKIRO <span className="text-ekiti-gold">·</span>{" "}
          <span className="opacity-60 font-normal">Digital Intelligence Infrastructure</span>
        </span>
      </Link>

      {/* Desktop nav */}
      <div className="hidden lg:flex items-center gap-7">
        <nav className="flex items-center gap-6">
          {NAV_SECTIONS.flatMap((s) => s.links)
            .slice(0, 6)
            .map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-medium text-ekiti-neutral hover:text-ekiti-green">
                {l.label}
              </Link>
            ))}
        </nav>
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-sm bg-[#EAF2ED] text-ekiti-green border border-ekiti-green/15">
          <CheckCircle2 size={13} /> Ekiti State Government Platform
        </div>
      </div>

      {/* Mobile / tablet menu trigger */}
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
        aria-expanded={menuOpen}
        className="lg:hidden flex items-center justify-center w-11 h-11 rounded-sm border border-ekiti-neutral/15 text-ekiti-neutral"
      >
        <Menu size={20} />
      </button>

      {/* Slide-in drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-ekiti-neutral/50 lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[86%] max-w-sm bg-ekiti-canvas border-l border-ekiti-neutral/10 flex flex-col lg:hidden"
              aria-label="Site menu"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-ekiti-neutral/10">
                <span className="font-mono text-[11px] uppercase tracking-widest text-ekiti-green">Menu</span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="flex items-center justify-center w-10 h-10 rounded-sm border border-ekiti-neutral/15"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                {NAV_SECTIONS.map((section) => (
                  <div key={section.label} className="mb-6">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-ekiti-green/70 mb-2">
                      {section.label}
                    </div>
                    <div className="flex flex-col">
                      {section.links.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setMenuOpen(false)}
                          className="py-3.5 min-h-[52px] flex items-center justify-between border-b border-ekiti-neutral/8 text-[15px] font-medium text-ekiti-neutral"
                        >
                          {l.label}
                          <ChevronRight size={16} className="text-ekiti-neutral/40" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 py-4 border-t border-ekiti-neutral/10 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ekiti-green">
                <CheckCircle2 size={13} /> Ekiti State Government Platform
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
