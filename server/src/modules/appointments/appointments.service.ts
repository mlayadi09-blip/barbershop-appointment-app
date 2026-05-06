import { prisma } from "../../config/prisma";
import { AppError } from "../../errors/AppError";
import { BOOKING_CONFIG } from "../../config/booking";

export async function createAppointment(data: {
  userId: string;
  serviceId: string;
  startTime: Date;
}) {
  if (data.startTime < new Date()) {
    throw new AppError("Appointment must be in the future", 400);
  }
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
    orderBy: { startTime: "asc" },
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
  const appointment = await prisma.appointment.findUnique({
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
  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  if (appointment.userId !== userId) {
    throw new AppError(
      "You don't have permission to cancel this appointment",
      403,
    );
  }

  if (appointment.status === "CANCELLED") {
    throw new AppError("Appointment already cancelled", 400);
  }

  return prisma.appointment.update({
    where: { id },
    data: {
      status: "CANCELLED",
    },
  });
}

export async function updateAppointmentStatus(
  id: string,
  status: "PENDING" | "CONFIRMED" | "CANCELLED",
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  return prisma.appointment.update({
    where: { id },
    data: { status },
  });
}

export async function getAvailableSlots(date: string, serviceId: string) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new AppError("Service not found", 404);
  }

  const selectedDate = new Date(date);

  if (isNaN(selectedDate.getTime())) {
    throw new AppError("Invalid date", 400);
  }

  // Working hours: 09:00 → 18:00
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(BOOKING_CONFIG.WORK_START_HOUR, 0, 0, 0);

  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(BOOKING_CONFIG.WORK_END_HOUR, 0, 0, 0);

  // Get all non-cancelled appointments for that day
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
    orderBy: {
      startTime: "asc",
    },
  });

  const slots: {
    time: string;
    available: boolean;
  }[] = [];

  const slotDuration = service.duration;

  // Generate slots every 30 minutes
  const SLOT_INTERVAL = BOOKING_CONFIG.SLOT_INTERVAL;

  let current = new Date(startOfDay);

  const now = new Date();

  function isOverlapping(start: Date, end: Date) {
    return appointments.some((appointment) => {
      return start < appointment.endTime && end > appointment.startTime;
    });
  }

  while (current < endOfDay) {
    const slotStart = new Date(current);

    const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);

    // Prevent slots outside working hours
    if (slotEnd > endOfDay) {
      break;
    }

    // Prevent past slots
    if (slotStart < now) {
      current = new Date(current.getTime() + SLOT_INTERVAL * 60 * 1000);

      continue;
    }

    const available = !isOverlapping(slotStart, slotEnd);

    slots.push({
      time: slotStart.toISOString(),
      available,
    });

    current = new Date(current.getTime() + SLOT_INTERVAL * 60 * 1000);
  }

  return slots;
}
