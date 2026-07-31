import { Router } from "express";
import { listProjects, fundProject, mentorTalent, listContributions } from "../controllers/diasporaController";

const router = Router();

router.get("/projects", listProjects);
router.post("/projects/:id/fund", (req, res, next) => {
  req.body.projectId = req.params.id;
  fundProject(req, res).catch(next);
});
router.post("/mentor", mentorTalent);
router.get("/contributions", listContributions);

export default router;
