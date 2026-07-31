// Populates reference/seed data that the frontend contexts used to hardcode
// (SEED_BATCHES, SEED_STORE_ITEMS, SEED_CHALLENGES, SEED_PROJECTS,
// SEED_OPPORTUNITIES). Run once after connecting to a fresh database:
//
//   npm run seed
//
// Safe to re-run — it skips any collection that already has documents.

import "dotenv/config";
import { connectDatabase } from "./config/db";
import { SubsidizedBatch, StateStoreItem } from "./models/PriceTransparency";
import { InnovationChallenge } from "./models/Innovation";
import { FundableProject } from "./models/Diaspora";
import { Opportunity } from "./models/Opportunity";
import { Worker } from "./models/Jobs";
import { Master } from "./models/TeachingHub";
import mongoose from "mongoose";

async function seedIfEmpty<T>(model: mongoose.Model<any>, docs: T[], label: string) {
  const count = await model.countDocuments();
  if (count > 0) {
    console.log(`[seed] ${label}: already has ${count} document(s), skipping`);
    return;
  }
  await model.insertMany(docs as any[]);
  console.log(`[seed] ${label}: inserted ${docs.length} document(s)`);
}

async function run() {
  await connectDatabase();

  await seedIfEmpty(SubsidizedBatch, [
    { batchCode: "FERT-2026-0091", itemName: "NPK Fertilizer (50kg)", officialPriceNaira: 3000, unit: "per bag", assignedLocation: "Ikere-Ekiti Agro Depot", agentName: "State Distribution Agent #12", quantityReleased: 500 },
    { batchCode: "FERT-2026-0104", itemName: "Urea Fertilizer (50kg)", officialPriceNaira: 3200, unit: "per bag", assignedLocation: "Oye-Ekiti Agro Depot", agentName: "State Distribution Agent #07", quantityReleased: 350 },
    { batchCode: "SEED-2026-0033", itemName: "Improved Maize Seedlings", officialPriceNaira: 1500, unit: "per pack", assignedLocation: "Ise/Orun Agro Depot", agentName: "State Distribution Agent #19", quantityReleased: 800 },
  ], "SubsidizedBatch");

  await seedIfEmpty(StateStoreItem, [
    { itemName: "NPK Fertilizer (50kg)", priceNaira: 3000, unit: "per bag", availableQuantity: 240, category: "Agriculture" },
    { itemName: "Improved Maize Seedlings", priceNaira: 1500, unit: "per pack", availableQuantity: 410, category: "Agriculture" },
    { itemName: "Cutlasses & farm tools set", priceNaira: 4500, unit: "per set", availableQuantity: 90, category: "Tools" },
    { itemName: "Cassava stem cuttings", priceNaira: 2000, unit: "per bundle", availableQuantity: 300, category: "Agriculture" },
  ], "StateStoreItem");

  await seedIfEmpty(InnovationChallenge, [
    { title: "Reduce post-harvest cassava spoilage", description: "Farmers in Ise/Orun lose an estimated 30% of cassava yield to spoilage before it reaches market. Propose a low-cost storage or processing fix.", postedBy: "Ministry of Agriculture", prizeDescription: "₦500,000 + pilot implementation support", deadline: "Closes in 30 days", status: "open" },
    { title: "Reduce okada/keke waiting time at Ado-Ekiti motor parks", description: "Riders and passengers both lose time to disorganized queuing at major parks. Propose a dispatch or queuing system, digital or physical.", postedBy: "Ministry of Transportation", prizeDescription: "₦300,000 + city-wide rollout", deadline: "Closes in 18 days", status: "open" },
    { title: "Early flood warning for Ureje River communities", description: "Riverside communities get little notice before flash floods. Propose a low-cost early warning approach using available tools.", postedBy: "Ministry of Environment", prizeDescription: "₦450,000 + equipment grant", deadline: "Closes in 42 days", status: "open" },
  ], "InnovationChallenge");

  await seedIfEmpty(FundableProject, [
    { type: "infrastructure_funding", title: "Repair Fajuyi Road pothole cluster", description: "Flagged as a high-severity fault on the Living State Dashboard — currently unfunded.", location: "Ado-Ekiti", targetNaira: 800000, raisedNaira: 120000 },
    { type: "school_adoption", title: "Adopt Ikole Community High School", description: "Covers roof repairs, library books, and a term of teaching materials.", location: "Ikole-Ekiti", targetNaira: 1200000, raisedNaira: 450000 },
    { type: "healthcare_support", title: "Stock primary health centre — Oye-Ekiti", description: "Basic maternal health and malaria treatment supplies for a rural health centre.", location: "Oye-Ekiti", targetNaira: 600000, raisedNaira: 200000 },
    { type: "equipment_contribution", title: "Sewing machines for Teaching Hub tailoring apprentices", description: "5 machines to expand apprentice capacity beyond current slots.", location: "Ado-Ekiti", targetNaira: 350000, raisedNaira: 0 },
    { type: "sme_investment", title: "Expansion capital — catering business", description: "9 years on the Jobs Marketplace, 4.9 rating, seeking capital to buy bulk-catering equipment.", location: "Ado-Ekiti", targetNaira: 500000, raisedNaira: 50000 },
    { type: "innovation_challenge", title: "Top up the cassava spoilage challenge prize pool", description: "The Ministry of Agriculture's Innovation Engine challenge is short of its full prize target.", location: "Ise/Orun", targetNaira: 500000, raisedNaira: 180000 },
  ], "FundableProject");

  await seedIfEmpty(Opportunity, [
    { kind: "civic_task", title: "Verify fertilizer batch prices — Ikere Agro Depot", description: "Confirm the depot is selling FERT-2026-0091 at the stamped official price.", requiredSkills: [], minCivicScore: 400, requiresIndigene: false, rewardDescription: "₦500 per verification", deadline: "Ongoing", location: "Ikere-Ekiti" },
    { kind: "apprenticeship", title: "Tailoring apprenticeship", description: "Learn ready-to-wear and bespoke tailoring. Earn 60% of supervised job pay while training.", requiredSkills: ["Tailoring"], minCivicScore: 0, requiresIndigene: false, rewardDescription: "60% of supervised jobs", deadline: "Rolling", location: "Ado-Ekiti" },
    { kind: "scholarship", title: "Ekiti State Computer Science Scholarship", description: "Full tuition scholarship for outstanding Ekiti-origin students pursuing computer science.", requiredSkills: ["Coding"], minCivicScore: 500, requiresIndigene: true, rewardDescription: "Full tuition + laptop", deadline: "Closes in 21 days", location: "Statewide" },
    { kind: "grant", title: "Diaspora-funded small business grant", description: "Seed funding for verified small businesses with 6+ months of platform activity.", requiredSkills: ["Catering", "Tailoring", "Farming"], minCivicScore: 550, requiresIndigene: false, rewardDescription: "₦150,000 – ₦400,000", deadline: "Closes in 45 days", location: "Statewide" },
    { kind: "volunteer", title: "Teach digital literacy at Ikere Market", description: "Help market traders learn to use the Voice Hub and Price Check tools.", requiredSkills: ["Teaching", "Digital Skills Tutoring"], minCivicScore: 300, requiresIndigene: false, rewardDescription: "Civic score +15 + ₦2,000 stipend", deadline: "This Saturday", location: "Ikere-Ekiti" },
  ], "Opportunity");

  await seedIfEmpty(Worker, [
    { name: "Bimpe Adeyemi", category: "tailoring", bio: "Ready-to-wear and bespoke Yoruba attire, 8 years experience.", rateNaira: 4500, rateUnit: "per job", rating: 4.8, completedJobs: 214 },
    { name: "Tunde Fashola", category: "plumbing", bio: "Pipe repairs, tank installation, borehole fittings.", rateNaira: 6000, rateUnit: "per job", rating: 4.6, completedJobs: 132 },
    { name: "Ronke Ojo", category: "catering", bio: "Small chops, party trays, and weekly meal prep for offices.", rateNaira: 15000, rateUnit: "per job", rating: 4.9, completedJobs: 87 },
    { name: "Emeka Nwosu", category: "electrical", bio: "House wiring, inverter setup, fault diagnosis.", rateNaira: 5500, rateUnit: "per job", rating: 4.5, completedJobs: 156 },
    { name: "Yusuf Adamu", category: "mechanic", bio: "Generator and small engine repairs, mobile service.", rateNaira: 3000, rateUnit: "per hour", rating: 4.7, completedJobs: 98 },
    { name: "Folake Ige", category: "tutoring", bio: "Teaches market traders and elders how to use the EKIRO app.", rateNaira: 1000, rateUnit: "per hour", rating: 5.0, completedJobs: 341 },
  ], "Worker");

  // Masters reference real Worker ObjectIds, so this looks them up by name
  // after the Worker seed above rather than hardcoding IDs.
  const masterCount = await Master.countDocuments();
  if (masterCount > 0) {
    console.log(`[seed] Master: already has ${masterCount} document(s), skipping`);
  } else {
    const masterSeeds: { workerName: string; apprenticeSlots: number; activeApprentices: number }[] = [
      { workerName: "Bimpe Adeyemi", apprenticeSlots: 3, activeApprentices: 1 },
      { workerName: "Folake Ige", apprenticeSlots: 4, activeApprentices: 0 },
      { workerName: "Tunde Fashola", apprenticeSlots: 2, activeApprentices: 2 },
    ];
    let created = 0;
    for (const seed of masterSeeds) {
      const worker = await Worker.findOne({ name: seed.workerName });
      if (!worker) {
        console.warn(`[seed] Master: could not find worker "${seed.workerName}", skipping`);
        continue;
      }
      await Master.create({
        worker: worker._id,
        apprenticeSlots: seed.apprenticeSlots,
        activeApprentices: seed.activeApprentices,
      });
      created += 1;
    }
    console.log(`[seed] Master: inserted ${created} document(s)`);
  }

  console.log("[seed] Done.");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
