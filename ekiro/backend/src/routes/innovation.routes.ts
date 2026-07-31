import { Router } from "express";
import {
  listChallenges,
  listSubmissionsForChallenge,
  submitSolution,
  endorseSubmission,
  declareWinner,
} from "../controllers/innovationController";

const router = Router();

router.get("/challenges", listChallenges);
router.get("/challenges/:challengeId/submissions", listSubmissionsForChallenge);
router.post("/challenges/:challengeId/submissions", submitSolution);
router.post("/submissions/:id/endorse", endorseSubmission);
router.post("/submissions/:id/declare-winner", declareWinner);

export default router;
