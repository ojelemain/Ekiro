import { Router } from "express";
import { getReputation } from "../controllers/reputationController";

const router = Router();

router.get("/:ekitiId", getReputation);

export default router;
