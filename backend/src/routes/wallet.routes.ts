import { Router } from "express";
import {
  getWallet,
  settleCivicTask,
  settleJobBooking,
  settleApprenticeshipJob,
  payListingFee,
  withdraw,
  getTransactions,
} from "../controllers/walletController";

const router = Router();

router.get("/:ekitiId", getWallet);
router.get("/:ekitiId/transactions", getTransactions);
router.post("/settle/civic-task", settleCivicTask);
router.post("/settle/job-booking", settleJobBooking);
router.post("/settle/apprenticeship", settleApprenticeshipJob);
router.post("/listing-fee", payListingFee);
router.post("/withdraw", withdraw);

export default router;
