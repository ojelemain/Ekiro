"use client";

import Image from "next/image";
import { ShieldCheck, Sprout, Wallet } from "lucide-react";

const HERO_IMG =
  "https://images.nigeriapropertycentre.com/area-guides/beb2e014-6f7d-4cb0-ae56-72a5d44fac98.jpg";

const trustPoints = [
  { icon: ShieldCheck, label: "Geofenced anti-fraud verification" },
  { icon: Sprout, label: "Farm-to-market produce exchange" },
  { icon: Wallet, label: "Instant split-settlement payouts" },
];

export default function EkitiHero() {
  return (
    <section className="relative overflow-hidden min-h-[560px]">
      <div className="absolute inset-0">
        <Image
          src={HERO_IMG}
          alt="Aerial view of Ekiti State urban landscape"
          fill
          priority
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,26,16,0.55) 0%, rgba(10,26,16,0.82) 65%, #0A1A10 100%)",
          }}
        />
        <div className="absolute inset-0 geofence-grid" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-10 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase mb-5 text-ekiti-gold">
          EKIRO &nbsp;/&nbsp; The Digital Intelligence Infrastructure of Ekiti State
        </div>
        <h1 className="font-display text-white text-4xl sm:text-6xl leading-[1.05] font-medium max-w-3xl">
          Every task, every farm, every naira —{" "}
          <span className="text-ekiti-gold">mapped, verified, and paid.</span>
        </h1>
        <p className="mt-6 max-w-xl text-[#EDEFE9] text-base sm:text-lg leading-relaxed">
          One portal for the citizen who cannot read a form, the young tasker mapping her own street,
          and the state officer watching revenue rise in real time.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/ekiti-id"
            className="px-6 py-3.5 rounded-sm font-semibold text-sm bg-ekiti-gold text-ekiti-neutral transition-transform hover:-translate-y-0.5"
          >
            Get your Ekiti ID
          </a>
          <a
            href="/voice-hub"
            className="px-6 py-3.5 rounded-sm font-semibold text-sm border border-ekiti-canvas text-ekiti-canvas transition-colors hover:bg-white/10"
          >
            Sọ̀rọ̀ ní Yorùbá →
          </a>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
          {trustPoints.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-[#EDEFE9] text-sm">
              <Icon size={16} className="text-ekiti-gold" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
