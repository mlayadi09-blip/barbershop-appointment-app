import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),

  description: z.string().max(200).optional(),

  duration: z.coerce
    .number()
    .int()
    .min(5, "Duration must be at least 5 minutes")
    .max(300, { message: "Duration must be at most 300 minutes" }),

  price: z.coerce.number().positive().min(0),
});

export const updateServiceSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be at most 50 characters" })
    .optional(),

  description: z.string().max(200).optional(),

  duration: z.coerce
    .number()
    .int()
    .min(5, { message: "Duration must be at least 5 minutes" })
    .max(300, { message: "Duration must be at most 300 minutes" })
    .optional(),

  price: z.coerce.number().positive().optional(),
});
