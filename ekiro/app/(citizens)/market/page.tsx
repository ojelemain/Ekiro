"use client";

import React, { useMemo, useState } from "react";
import { MapPin, Sprout, Volume2 } from "lucide-react";
import { useDialect } from "@/context/DialectContext";
import { useIdentity } from "@/context/IdentityContext";
import IdentityGate from "@/components/identity/IdentityGate";

interface ProduceListing {
  id: string;
  cropName: string;
  cropNameYoruba: string;
  quantity: string;
  priceNaira: number;
  distanceKm: number;
  farmerName: string;
  postedMinutesAgo: number;
}

const LISTINGS: ProduceListing[] = [
  {
    id: "listing-01",
    cropName: "Fresh cassava tubers",
    cropNameYoruba: "Gbaguda tuntun",
    quantity: "1 bag (100kg)",
    priceNaira: 18500,
    distanceKm: 2.4,
    farmerName: "Mama Adebayo",
    postedMinutesAgo: 12,
  },
  {
    id: "listing-02",
    cropName: "Yam tubers, medium size",
    cropNameYoruba: "Isu alabọde",
    quantity: "20 tubers",
    priceNaira: 24000,
    distanceKm: 5.1,
    farmerName: "Baba Ojo",
    postedMinutesAgo: 34,
  },
  {
    id: "listing-03",
    cropName: "Cocoa beans, sun-dried",
    cropNameYoruba: "Ọ̀gẹ̀dẹ̀ koko gbígbẹ",
    quantity: "50kg sack",
    priceNaira: 62000,
    distanceKm: 8.7,
    farmerName: "Mama Folasade",
    postedMinutesAgo: 61,
  },
  {
    id: "listing-04",
    cropName: "Fresh peppers (tatashe)",
    cropNameYoruba: "Ata tuntun",
    quantity: "5 baskets",
    priceNaira: 9500,
    distanceKm: 1.2,
    farmerName: "Iya Kehinde",
    postedMinutesAgo: 5,
  },
];

function speak(text: string, dialect: "en" | "eki-yo") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = dialect === "eki-yo" ? "yo-NG" : "en-NG";
  window.speechSynthesis.speak(utterance);
}

export default function MarketPage() {
  const { isVerified } = useIdentity();
  const { dialect } = useDialect();
  const [sortByDistance, setSortByDistance] = useState(true);

  const sortedListings = useMemo(() => {
    const copy = [...LISTINGS];
    if (sortByDistance) {
      copy.sort((a, b) => a.distanceKm - b.distanceKm);
    } else {
      copy.sort((a, b) => a.postedMinutesAgo - b.postedMinutesAgo);
    }
    return copy;
  }, [sortByDistance]);

  if (!isVerified) return <IdentityGate />;

  return (
    <div className="min-h-screen bg-ekiti-canvas">
      <header className="px-5 sm:px-10 py-6 border-b border-ekiti-neutral/10 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-ekiti-green mb-1">
            Farm to Market
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-medium">Produce near you</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSortByDistance(true)}
            className={`px-4 py-2.5 min-h-[52px] rounded-sm text-sm font-semibold ${
              sortByDistance ? "bg-ekiti-green text-white" : "border border-ekiti-neutral/20"
            }`}
          >
            Nearest first
          </button>
          <button
            type="button"
            onClick={() => setSortByDistance(false)}
            className={`px-4 py-2.5 min-h-[52px] rounded-sm text-sm font-semibold ${
              !sortByDistance ? "bg-ekiti-green text-white" : "border border-ekiti-neutral/20"
            }`}
          >
            Newest first
          </button>
        </div>
      </header>

      <main className="px-5 sm:px-10 py-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sortedListings.map((listing) => (
          <div key={listing.id} className="rounded-sm border border-ekiti-neutral/10 bg-white p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Sprout size={18} className="text-ekiti-green" />
                <span className="font-mono text-[11px] opacity-60">{listing.postedMinutesAgo}m ago</span>
              </div>
              <button
                type="button"
                onClick={() => speak(`${listing.cropNameYoruba}. ${listing.quantity}`, dialect)}
                aria-label="Listen to listing"
                className="w-11 h-11 flex items-center justify-center rounded-sm bg-[#EAF2ED] text-ekiti-green"
              >
                <Volume2 size={18} />
              </button>
            </div>

            <div>
              <h3 className="font-display text-lg font-medium">{listing.cropName}</h3>
              <p className="text-xs font-mono opacity-60">{listing.cropNameYoruba}</p>
            </div>

            <p className="text-sm opacity-75">{listing.quantity}</p>

            <div className="flex items-center justify-between pt-3 border-t border-ekiti-neutral/10">
              <span className="font-display text-lg text-ekiti-green">
                ₦{listing.priceNaira.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 text-xs font-mono opacity-60">
                <MapPin size={12} /> {listing.distanceKm}km · {listing.farmerName}
              </span>
            </div>

            <button
              type="button"
              className="min-h-[52px] rounded-sm font-semibold text-sm bg-ekiti-neutral text-white"
            >
              Contact farmer
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}
