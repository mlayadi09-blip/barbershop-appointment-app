import { z } from "zod";

export const createAppointmentSchema = z.object({
  serviceId: z.uuid({
    message: "Invalid service ID",
  }),

  startTime: z.coerce.date().refine((date) => date > new Date(), {
    message: "Appointment must be in the future",
  }),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]),
});

export const getAvailabilitySchema = z.object({
  date: z.string().min(1, "Date is required"),

  serviceId: z.uuid({
    message: "Invalid service ID",
  }),
});
