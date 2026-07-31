import { NextFunction, Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  console.error("[ekiro-backend] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error." });
}
