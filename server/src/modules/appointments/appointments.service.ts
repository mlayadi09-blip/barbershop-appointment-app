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

export async function getMyAppointments(userId: string) {
  return prisma.appointment.findMany({
    where: { userId },
    include: {
      service: true,
    },
  });
}

export async function getAllAppointments() {
  return prisma.appointment.findMany({
    include: {
      service: true,
      user: true,
    },
  });
}

export async function getAppointmentById(id: string) {
  const appointment = prisma.appointment.findUnique({
    where: { id },
    include: {
      service: true,
      user: true,
    },
  });
  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }
  return appointment;
}

export async function cancelAppointment(id: string, userId: string) {
  try {
    return prisma.appointment.update({
      where: { id, userId },
      data: { status: "CANCELLED" },
    });
  } catch (err) {
    throw new AppError(
      "Appointment not found or you don't have permission to cancel it",
      404,
    );
  }
}

export async function updateAppointmentStatus(
  id: string,
  status: "PENDING" | "CONFIRMED" | "CANCELLED",
) {
  try {
    return prisma.appointment.update({
      where: { id },
      data: { status },
    });
  } catch (err) {
    throw new AppError("Appointment not found", 404);
  }
}

export async function getAvailableSlots(serviceId: string, date: Date) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new AppError("Service not found", 404);
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      serviceId,
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: { startTime: "asc" },
  });

  const slots = [];
  let currentTime = new Date(startOfDay);

  while (currentTime < endOfDay) {
    const slotEndTime = new Date(
      currentTime.getTime() + service.duration * 60000,
    );
    const conflict = appointments.find(
      (appt) =>
        (appt.startTime < slotEndTime && appt.endTime > currentTime) ||
        (appt.startTime >= currentTime && appt.startTime < slotEndTime),
    );

    if (!conflict) {
      slots.push({
        startTime: new Date(currentTime),
        endTime: slotEndTime,
      });
    }

    currentTime = slotEndTime;
  }

  return slots;
}
