import { Router } from "express";
import {
  listTalents,
  createTalentProfile,
  nominateTalent,
  expressMentorshipInterest,
  getBreakdown,
} from "../controllers/talentController";

const router = Router();

router.get("/", listTalents);
router.get("/breakdown", getBreakdown);
router.post("/", createTalentProfile);
router.post("/nominate", nominateTalent);
router.post("/mentorship-interest", expressMentorshipInterest);

export default router;
