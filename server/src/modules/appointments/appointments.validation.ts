import { z } from "zod";

export const createAppointmentSchema = z.object({
  serviceId: z.uuid(),
  startTime: z.coerce.date(),
});
