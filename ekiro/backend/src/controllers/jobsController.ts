import { Request, Response } from "express";
import { Worker, Booking } from "../models/Jobs";

export async function listWorkers(req: Request, res: Response) {
  const { category } = req.query;
  const filter = category ? { category } : {};
  const workers = await Worker.find(filter).sort({ createdAt: -1 });
  res.json(workers);
}

export async function createWorker(req: Request, res: Response) {
  try {
    const worker = await Worker.create(req.body);
    res.status(201).json(worker);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function createBooking(req: Request, res: Response) {
  try {
    const worker = await Worker.findById(req.body.workerId);
    if (!worker) return res.status(404).json({ error: "Worker not found." });

    const booking = await Booking.create({
      worker: worker._id,
      customerEkitiId: req.body.customerEkitiId,
      note: req.body.note,
      agreedNaira: worker.rateNaira,
      status: "requested",
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function updateBookingStatus(req: Request, res: Response) {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ error: "Booking not found." });

    if (status === "completed") {
      await Worker.findByIdAndUpdate(booking.worker, { $inc: { completedJobs: 1 } });
    }

    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function listBookingsForWorker(req: Request, res: Response) {
  const bookings = await Booking.find({ worker: req.params.workerId }).sort({ createdAt: -1 });
  res.json(bookings);
}
