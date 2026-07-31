import { Router } from "express";
import {
  becomeMaster,
  applyForApprenticeship,
  acceptApplication,
  rejectApplication,
  recordSupervisedJob,
  listApplicationsForMaster,
  listMasters,
} from "../controllers/teachingHubController";

const router = Router();

router.get("/masters", listMasters);
router.post("/masters", becomeMaster);
router.post("/applications", applyForApprenticeship);
router.post("/applications/:id/accept", acceptApplication);
router.post("/applications/:id/reject", rejectApplication);
router.post("/applications/:id/supervised-job", recordSupervisedJob);
router.get("/masters/:masterId/applications", listApplicationsForMaster);

export default router;
