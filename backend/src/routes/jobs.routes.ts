import { Router } from "express";
import {
  listWorkers,
  createWorker,
  createBooking,
  updateBookingStatus,
  listBookingsForWorker,
} from "../controllers/jobsController";

const router = Router();

router.get("/workers", listWorkers);
router.post("/workers", createWorker);
router.post("/bookings", createBooking);
router.patch("/bookings/:id/status", updateBookingStatus);
router.get("/workers/:workerId/bookings", listBookingsForWorker);

export default router;
