import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDatabase } from "./config/db";
import { notFoundHandler, errorHandler } from "./middleware/errorHandling";

import identityRoutes from "./routes/identity.routes";
import walletRoutes from "./routes/wallet.routes";
import jobsRoutes from "./routes/jobs.routes";
import teachingHubRoutes from "./routes/teachingHub.routes";
import talentRoutes from "./routes/talent.routes";
import diasporaRoutes from "./routes/diaspora.routes";
import innovationRoutes from "./routes/innovation.routes";
import priceTransparencyRoutes from "./routes/priceTransparency.routes";
import opportunityRoutes from "./routes/opportunity.routes";
import reputationRoutes from "./routes/reputation.routes";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ekiro-backend" });
});

app.use("/api/identity", identityRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/teaching-hub", teachingHubRoutes);
app.use("/api/talent", talentRoutes);
app.use("/api/diaspora", diasporaRoutes);
app.use("/api/innovation", innovationRoutes);
app.use("/api/price-transparency", priceTransparencyRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/reputation", reputationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function start() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`[ekiro-backend] Listening on port ${PORT}`);
    console.log(`[ekiro-backend] Run "npm run seed" once to populate reference data if this is a fresh database.`);
  });
}

start().catch((err) => {
  console.error("[ekiro-backend] Failed to start:", err);
  process.exit(1);
});
