import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Award, BarChart3, Bot, Briefcase, Compass, CreditCard, GraduationCap, Lightbulb, MapPin, Mic, Plane, Radio, ShieldAlert, TrendingUp } from "lucide-react";
import EkitiHero from "@/components/home/EkitiHero";
import SiteHeader from "@/components/home/SiteHeader";

const IKOGOSI_IMG = "http://ekitistate.gov.ng/wp-content/uploads/2012/06/Canadian-12.jpg";

const gateways = [
  {
    code: "PT/00",
    href: "/ekiti-id",
    title: "Get your Ekiti ID",
    dialect: "Ìdánimọ̀ Ìpínlẹ̀",
    desc: "Live or work in Ekiti? Get Resident Access to start earning and learning. Ekiti indigene? Verify your origin for that plus heritage-based programs. Start here.",
    icon: CreditCard,
    stat: "Required before earning on EKIRO",
  },
  {
    code: "PT/01",
    href: "/opportunities",
    title: "Opportunity Engine",
    dialect: "Ẹ̀rọ Àǹfààní",
    desc: "Jobs, apprenticeships, scholarships, and grants matched to your skills and civic score — opportunities search for you instead of the other way around.",
    icon: Compass,
    stat: "7 opportunity types tracked and matched",
  },
  {
    code: "PT/02",
    href: "/reputation",
    title: "Civic Reputation",
    dialect: "Ọlá Ìjọba",
    desc: "Reputation tiers that actually unlock things — reach Verified Professional and qualify to become a Teaching Hub Master without the usual job count.",
    icon: TrendingUp,
    stat: "5 tiers, 5 earnable badges",
  },
  {
    code: "PT/03",
    href: "/talent",
    title: "Talent Engine",
    dialect: "Ẹ̀bùn Ìjọba",
    desc: "A public directory for artisans, farmers, musicians, athletes, coders, and students — nominated by schools and communities, not just self-listed.",
    icon: Award,
    stat: "4 talents recognized across 4 LGAs",
  },
  {
    code: "PT/04",
    href: "/innovation",
    title: "Innovation Engine",
    dialect: "Ẹ̀rọ Ìṣẹ̀dá",
    desc: "Government posts real problems — cassava spoilage, park congestion, flood warnings. Anyone can submit a solution; State Honorees judge the winner.",
    icon: Lightbulb,
    stat: "3 open challenges, funded by state and diaspora",
  },
  {
    code: "PT/05",
    href: "/voice-hub",
    title: "Voice & Market Hub",
    dialect: "Ọjà Ìbílẹ̀",
    desc: "List produce, request services, and report roadside issues by speaking Ekiti Yoruba into your phone. No reading or typing required.",
    icon: Mic,
    stat: "12,480 voice listings this month",
  },
  {
    code: "PT/06",
    href: "/radar",
    title: "Tasker Radar",
    dialect: "Àwọn Òṣìṣẹ́",
    desc: "Claim 10-metre mapping and verification zones near you, submit geo-tagged evidence, and get paid the moment it's confirmed.",
    icon: Radio,
    stat: "3,214 zones verified, ₦18.6m paid out",
  },
  {
    code: "PT/07",
    href: "/jobs",
    title: "Jobs Marketplace",
    dialect: "Iṣẹ́ Ọjọ́-Ọjọ́",
    desc: "List your trade or book a verified plumber, tailor, caterer, or tutor nearby. Keep 100% of every booking — a flat monthly listing fee, not a per-job cut.",
    icon: Briefcase,
    stat: "1,046 workers listed, ₦6.2m booked",
  },
  {
    code: "PT/08",
    href: "/teaching-hub",
    title: "Teaching Hub",
    dialect: "Ilé-Ẹ̀kọ́ Iṣẹ́ Ọwọ́",
    desc: "Learn a trade under a verified Master — no literacy or experience required. Earn while you train, graduate to your own listing after 5 supervised jobs.",
    icon: GraduationCap,
    stat: "38 Masters training 112 apprentices",
  },
  {
    code: "PT/09",
    href: "/price-check",
    title: "Price Check & State Store",
    dialect: "Ìdíyelé Òtítọ́",
    desc: "Check a subsidized batch's real price before you buy, report overcharging in one tap, or order fertilizer and tools directly from government at the fixed price.",
    icon: ShieldAlert,
    stat: "Stops hoarding before it reaches the resale market",
  },
  {
    code: "PT/10",
    href: "/diaspora",
    title: "Diaspora Engine",
    dialect: "Àwọn Ọmọ Èkìtì Lóde",
    desc: "Verified diaspora indigenes fund a specific project, mentor a talent, or invest in a business — with a transparent impact log, not a black-box donation.",
    icon: Plane,
    stat: "5 fundable projects, ₦820k raised so far",
  },
  {
    code: "PT/11",
    href: "/ekiti-ai",
    title: "Ekiti AI",
    dialect: "Ọlọ́gbọ́n Ẹ̀rọ Ìpínlẹ̀",
    desc: "Ask the state a question — IGR, infrastructure, talent, jobs, diaspora funding. A rule-based scaffold today, built to be swapped for a trained model.",
    icon: Bot,
    stat: "Answers 8 live question categories",
  },
  {
    code: "PT/12",
    href: "/igr-analytics",
    title: "Living State Dashboard",
    dialect: "Ìjọba Ìpínlẹ̀",
    desc: "Revenue, talent, jobs, learning, diaspora funding, and innovation — every engine's real data rolled up into one live government view, not scattered across ministries.",
    icon: BarChart3,
    stat: "IGR up 34% year-on-year",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ekiti-canvas">
      <SiteHeader />

      <EkitiHero />

      <section className="max-w-6xl mx-auto px-5 sm:px-10 py-16 sm:py-20">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase mb-2 text-ekiti-green">
              Register of Portals
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-medium">Choose your gateway</h2>
          </div>
          <p className="max-w-xs text-sm opacity-60 leading-relaxed">
            Each pass below routes to a purpose-built interface — no portal makes you learn the others.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {gateways.map((g) => {
            const Icon = g.icon;
            return (
              <Link
                key={g.code}
                href={g.href}
                className="group relative p-6 pt-8 rounded-sm border border-ekiti-neutral/10 bg-white transition-colors hover:border-ekiti-gold"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-[11px] tracking-widest text-ekiti-green">{g.code}</span>
                  <Icon size={20} className="text-ekiti-green" />
                </div>
                <h3 className="font-display text-xl font-medium mb-1">{g.title}</h3>
                <div className="text-xs font-mono mb-4 opacity-60">{g.dialect}</div>
                <p className="text-sm leading-relaxed opacity-80 mb-6">{g.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-ekiti-neutral/10">
                  <span className="text-[11px] font-mono opacity-60">{g.stat}</span>
                  <ArrowUpRight size={16} className="text-ekiti-green group-hover:text-ekiti-gold" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden min-h-[320px]">
        <div className="absolute inset-0">
          <Image src={IKOGOSI_IMG} alt="Ikogosi Warm Springs, Ekiti State" fill className="object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, rgba(10,26,16,0.92) 20%, rgba(10,26,16,0.35) 75%)",
            }}
          />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-10 h-full flex items-center py-16">
          <div className="max-w-md">
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase mb-3 text-ekiti-gold">
              Farm to Market
            </div>
            <h3 className="font-display text-white text-2xl sm:text-3xl font-medium leading-snug mb-4">
              From Ikogosi&apos;s farms to the city market, by voice alone.
            </h3>
            <p className="text-[#EDEFE9] text-sm leading-relaxed mb-6">
              A farmer records a price and quantity in her own dialect. Buyers nearby see it instantly,
              with distance and freshness — no smartphone literacy needed.
            </p>
            <Link
              href="/market"
              className="inline-block text-sm font-semibold px-5 py-3 rounded-sm bg-ekiti-gold text-ekiti-neutral"
            >
              Open Market Hub
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-5 sm:px-10 py-10 flex flex-wrap items-center justify-between gap-4 bg-ekiti-neutral text-ekiti-canvas">
        <div className="flex items-center gap-2 text-sm opacity-80">
          <MapPin size={14} className="text-ekiti-gold" />
          Ekiti State, Nigeria — Office of the Executive Governor
        </div>
        <div className="font-mono text-[11px] opacity-50">EKIRO — Digital Intelligence Infrastructure of Ekiti State</div>
      </footer>
    </main>
  );
}
