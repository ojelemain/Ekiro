import { Router } from "express";
import {
  lookupBatch,
  reportOvercharge,
  getDiversionFlags,
  listReports,
  listStoreItems,
  placeStoreOrder,
} from "../controllers/priceTransparencyController";

const router = Router();

router.get("/batches/:code", lookupBatch);
router.post("/reports", reportOvercharge);
router.get("/reports", listReports);
router.get("/diversion-flags", getDiversionFlags);
router.get("/store", listStoreItems);
router.post("/store/order", placeStoreOrder);

export default router;
