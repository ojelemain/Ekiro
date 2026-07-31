import { Router } from "express";
import {
  listOpportunities,
  getMatches,
  expressInterest,
  listExpressions,
} from "../controllers/opportunityController";

const router = Router();

router.get("/", listOpportunities);
router.get("/matches", getMatches);
router.post("/interest", expressInterest);
router.get("/interest", listExpressions);

export default router;
