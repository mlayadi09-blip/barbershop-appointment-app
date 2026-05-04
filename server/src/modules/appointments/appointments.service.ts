import { prisma } from "../../config/prisma";
import { AppError } from "../../errors/AppError";

export async function createAppointment(data: {
  userId: string;
  serviceId: string;
  startTime: Date;
}) {
  const service = await prisma.service.findUnique({
    where: { id: data.serviceId },
  });

  if (!service) {
    throw new AppError("Service not found", 404);
  }

  const endTime = new Date(data.startTime.getTime() + service.duration * 60000);
  const conflict = await prisma.appointment.findFirst({
    where: {
      AND: [
        {
          startTime: { lt: endTime },
        },
        {
          endTime: { gt: data.startTime },
        },
      ],
    },
  });

  if (conflict) {
    throw new AppError("Time slot already booked", 409);
  }

  return prisma.appointment.create({
    data: {
      userId: data.userId,
      serviceId: data.serviceId,
      startTime: data.startTime,
      endTime,
    },
  });
}
