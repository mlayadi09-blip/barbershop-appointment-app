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

export async function getAvailableSlots(date: string, serviceId: string) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new AppError("Service not found", 404);
  }

  const selectedDate = new Date(date);

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(9, 0, 0, 0);

  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(18, 0, 0, 0);

  const appointments = await prisma.appointment.findMany({
    where: {
      startTime: {
        gte: startOfDay,
        lt: endOfDay,
      },
      status: {
        not: "CANCELLED",
      },
    },
  });

  const slots: {
    time: string;
    available: boolean;
  }[] = [];

  const slotDuration = service.duration;

  let current = new Date(startOfDay);

  function isOverlapping(start: Date, end: Date) {
    return appointments.some((appointment) => {
      return start < appointment.endTime && end > appointment.startTime;
    });
  }

  while (current < endOfDay) {
    const slotStart = new Date(current);

    const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

    if (slotEnd > endOfDay) {
      break;
    }

    const available = !isOverlapping(slotStart, slotEnd);

    slots.push({
      time: slotStart.toISOString(),
      available,
    });

    current = new Date(current.getTime() + 30 * 60000);
  }

  return slots;
}
