import { Request, Response } from "express";
import { createAppointment } from "./appointments.service";
import { createAppointmentSchema } from "./appointments.validation";

export async function create(req: Request, res: Response) {
  const userId = req.user!.id;

  const data = createAppointmentSchema.parse(req.body);

  const appointment = await createAppointment({
    userId,
    serviceId: data.serviceId,
    startTime: data.startTime,
  });

  res.status(201).json({
    success: true,
    data: appointment,
  });
}
