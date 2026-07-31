import { Router } from "express";
import {
  registerIdentity,
  submitForVerification,
  approveVerification,
  linkNin,
  getIdentity,
} from "../controllers/identityController";

const router = Router();

router.post("/", registerIdentity);
router.get("/:id", getIdentity);
router.post("/:id/submit", submitForVerification);
router.post("/:id/approve", approveVerification); // in production: admin-only
router.post("/:id/link-nin", linkNin);

export default router;
