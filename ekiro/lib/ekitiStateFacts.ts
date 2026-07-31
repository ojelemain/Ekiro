// Canonical seed facts about Ekiti State used across the app. Kept in one
// place so the Living State Dashboard and Ekiti AI's rule-based responder
// never drift out of sync with each other. In production this would be
// replaced by a real data source (a revenue database, a public-works ticket
// system) rather than hardcoded arrays.

export interface LgaRevenue {
  lga: string;
  igrNaira: number;
  growthPercent: number;
  activeTaskers: number;
}

export const LGA_DATA: LgaRevenue[] = [
  { lga: "Ado-Ekiti", igrNaira: 42_500_000, growthPercent: 38, activeTaskers: 612 },
  { lga: "Ikere", igrNaira: 18_200_000, growthPercent: 22, activeTaskers: 214 },
  { lga: "Ikole", igrNaira: 11_800_000, growthPercent: 19, activeTaskers: 158 },
  { lga: "Oye", igrNaira: 9_400_000, growthPercent: 27, activeTaskers: 133 },
  { lga: "Emure", igrNaira: 6_100_000, growthPercent: 14, activeTaskers: 92 },
  { lga: "Ise/Orun", igrNaira: 5_700_000, growthPercent: 31, activeTaskers: 87 },
];

export interface InfrastructureFault {
  id: string;
  location: string;
  type: string;
  severity: "High" | "Medium" | "Low";
  reportedHoursAgo: number;
}

export const INFRASTRUCTURE_FAULTS: InfrastructureFault[] = [
  { id: "flt-01", location: "Fajuyi Road, Ado-Ekiti", type: "Pothole cluster", severity: "High", reportedHoursAgo: 3 },
  { id: "flt-02", location: "Ikere-Ise Expressway", type: "Broken streetlight run", severity: "Medium", reportedHoursAgo: 9 },
  { id: "flt-03", location: "Oye Market Road", type: "Blocked drainage", severity: "High", reportedHoursAgo: 5 },
  { id: "flt-04", location: "Ikole Township Stadium Rd", type: "Signage damage", severity: "Low", reportedHoursAgo: 27 },
];
