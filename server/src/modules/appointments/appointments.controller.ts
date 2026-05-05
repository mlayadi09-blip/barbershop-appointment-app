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

export async function getMyAppointments(req: Request, res: Response) {}

export async function getAllAppointments(req: Request, res: Response) {}

export async function getById(req: Request, res: Response) {}

export async function cancel(req: Request, res: Response) {}

export async function updateStatus(req: Request, res: Response) {}

export async function getAvailability(req: Request, res: Response) {}