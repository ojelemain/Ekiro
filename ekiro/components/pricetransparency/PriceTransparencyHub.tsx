"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, Package, Search, ShieldAlert, ShoppingBag } from "lucide-react";
import { useIdentity } from "@/context/IdentityContext";
import { usePriceTransparency } from "@/context/PriceTransparencyContext";
import IdentityGate from "@/components/identity/IdentityGate";

type Tab = "check" | "store";

export default function PriceTransparencyHub() {
  const { isVerified } = useIdentity();
  const [tab, setTab] = useState<Tab>("check");

  if (!isVerified) return <IdentityGate />;

  return (
    <div className="min-h-screen bg-ekiti-canvas">
      <header className="px-5 sm:px-10 py-6 border-b border-ekiti-neutral/10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-ekiti-green mb-1">
          Price Transparency
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-medium">Check it. Report it. Buy it fixed-price.</h1>
        <p className="text-xs opacity-60 mt-1 max-w-xl">
          Every government-subsidized batch has a code and a stamped price. Check before you buy, report if
          you're overcharged, or buy directly from the State Store at the official price.
        </p>
      </header>

      <div className="px-5 sm:px-10 pt-5 flex gap-2 flex-wrap">
        <TabButton active={tab === "check"} onClick={() => setTab("check")} icon={Search} label="Check a price" />
        <TabButton active={tab === "store"} onClick={() => setTab("store")} icon={ShoppingBag} label="State Store" />
      </div>

      <main className="px-5 sm:px-10 py-6">
        {tab === "check" && <PriceCheck />}
        {tab === "store" && <StateStore />}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Search;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 min-h-[48px] rounded-sm text-sm font-semibold ${
        active ? "bg-ekiti-green text-white" : "border border-ekiti-neutral/20"
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );
}

function PriceCheck() {
  const { lookupBatch, reportOvercharge } = usePriceTransparency();
  const [batchCode, setBatchCode] = useState("");
  const [lookupResult, setLookupResult] = useState<Awaited<ReturnType<typeof lookupBatch>> | "not_found" | null>(null);

  const [reportedPrice, setReportedPrice] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [reportMessage, setReportMessage] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!batchCode.trim()) return;
    const result = await lookupBatch(batchCode);
    setLookupResult(result ?? "not_found");
    setReportMessage(null);
  };

  const handleReport = async () => {
    if (!lookupResult || lookupResult === "not_found") return;
    const price = Number(reportedPrice);
    if (!Number.isFinite(price) || price <= 0 || !location.trim()) {
      setReportMessage("Enter the price you were charged and where.");
      return;
    }
    const result = await reportOvercharge({
      batchCode: lookupResult.batchCode,
      reportedPriceNaira: price,
      location,
      reporterNote: note,
    });
    setReportMessage(
      result.success
        ? "Report submitted — this is now visible on the Living State Dashboard."
        : result.reason ?? "Unable to submit report."
    );
    if (result.success) {
      setReportedPrice("");
      setLocation("");
      setNote("");
    }
  };

  return (
    <div className="max-w-lg flex flex-col gap-6">
      <div>
        <div className="text-sm font-semibold mb-2">Batch code (on the packaging)</div>
        <div className="flex gap-2">
          <input
            value={batchCode}
            onChange={(e) => setBatchCode(e.target.value)}
            placeholder="e.g. FERT-2026-0091"
            className="flex-1 min-h-[52px] px-3.5 rounded-sm border border-ekiti-neutral/15 bg-white text-sm outline-none focus:border-ekiti-gold font-mono"
          />
          <button
            type="button"
            onClick={handleLookup}
            className="min-h-[52px] px-5 rounded-sm bg-ekiti-neutral text-white font-semibold text-sm"
          >
            Check
          </button>
        </div>
        <p className="text-xs opacity-50 mt-2">Try FERT-2026-0091, FERT-2026-0104, or SEED-2026-0033.</p>
      </div>

      {lookupResult === "not_found" && (
        <div className="rounded-sm bg-red-50 text-red-700 p-4 text-sm flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          Batch code not recognized. Double-check the code printed on the packaging.
        </div>
      )}

      {lookupResult && lookupResult !== "not_found" && (
        <>
          <div className="rounded-sm border border-ekiti-neutral/10 bg-white p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-ekiti-green" />
              <h3 className="font-display text-lg font-medium">{lookupResult.itemName}</h3>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="opacity-60">Official price</span>
              <span className="font-display text-xl text-ekiti-green">
                ₦{lookupResult.officialPriceNaira.toLocaleString()} {lookupResult.unit}
              </span>
            </div>
            <div className="text-xs font-mono opacity-60">Assigned to: {lookupResult.assignedLocation}</div>
            <div className="text-xs font-mono opacity-60">Distributed by: {lookupResult.agentName}</div>
          </div>

          <div className="rounded-sm border border-ekiti-gold/40 bg-[#FFF8E7] p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-ekiti-neutral" />
              <h3 className="font-display text-base font-medium">Charged more than this?</h3>
            </div>
            <input
              value={reportedPrice}
              onChange={(e) => setReportedPrice(e.target.value.replace(/\D/g, ""))}
              placeholder="Price you were actually charged (₦)"
              className="min-h-[48px] px-3.5 rounded-sm border border-ekiti-neutral/15 bg-white text-sm outline-none"
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where were you charged this? (market/area)"
              className="min-h-[48px] px-3.5 rounded-sm border border-ekiti-neutral/15 bg-white text-sm outline-none"
            />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Anything else worth noting (optional)"
              className="px-3.5 py-3 rounded-sm border border-ekiti-neutral/15 bg-white text-sm outline-none"
            />
            {reportMessage && <p className="text-xs text-ekiti-green">{reportMessage}</p>}
            <button
              type="button"
              onClick={handleReport}
              className="min-h-[48px] rounded-sm bg-ekiti-neutral text-white font-semibold text-sm"
            >
              Submit report
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StateStore() {
  const { storeItems, placeStateStoreOrder } = usePriceTransparency();
  const [orderedMessage, setOrderedMessage] = useState<Record<string, string>>({});

  const handleOrder = async (itemId: string) => {
    const order = await placeStateStoreOrder(itemId, 1);
    setOrderedMessage((prev) => ({
      ...prev,
      [itemId]: order ? `Ordered 1 unit for ₦${order.totalNaira.toLocaleString()} — a rider will deliver it.` : "Out of stock",
    }));
  };

  return (
    <div>
      <p className="text-sm opacity-70 max-w-lg mb-6">
        Government-supplied goods at the fixed official price, fulfilled by verified riders from the Jobs
        Marketplace. This isn't meant to replace private sellers — it's the honest floor price everyone can fall
        back on.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {storeItems.map((item) => (
          <div key={item.id} className="rounded-sm border border-ekiti-neutral/10 bg-white p-6 flex flex-col gap-3">
            <span className="text-xs font-mono opacity-60">{item.category}</span>
            <h3 className="font-display text-lg font-medium">{item.itemName}</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="font-display text-xl text-ekiti-green">
                ₦{item.priceNaira.toLocaleString()}
              </span>
              <span className="text-xs font-mono opacity-60">{item.unit}</span>
            </div>
            <div className="text-xs font-mono opacity-50">{item.availableQuantity} in stock</div>
            {orderedMessage[item.id] ? (
              <div className="min-h-[48px] flex items-center justify-center rounded-sm bg-[#EAF2ED] text-ekiti-green text-sm font-semibold text-center px-2">
                <CheckCircle2 size={14} className="mr-1.5 flex-shrink-0" /> {orderedMessage[item.id]}
              </div>
            ) : (
              <button
                type="button"
                disabled={item.availableQuantity === 0}
                onClick={() => handleOrder(item.id)}
                className="min-h-[48px] rounded-sm bg-ekiti-neutral text-white font-semibold text-sm disabled:opacity-40"
              >
                {item.availableQuantity === 0 ? "Out of stock" : "Order 1 unit"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
