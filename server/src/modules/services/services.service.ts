import { prisma } from "../../config/prisma";
import { AppError } from "../../errors/AppError";

export async function createService(data: {
  name: string;
  description?: string;
  duration: number;
  price: number;
}) {
  const existingService = await prisma.service.findUnique({
    where: { name: data.name },
  });

  if (existingService) {
    throw new AppError("Service with this name already exists", 409);
  }

  const service = await prisma.service.create({
    data,
  });

  return service;
}

export async function getAllServices() {
  const services = await prisma.service.findMany();
  return services;
}

export async function getServiceById(id: string) {
  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    throw new AppError("Service not found", 404);
  }

  return service;
}

export async function updateService(
  id: string,
  data: {
    name?: string;
    description?: string;
    duration?: number;
    price?: number;
  },
) {
  try {
    return await prisma.service.update({
      where: { id },
      data,
    });
  } catch (err) {
    throw new AppError("Service not found", 404);
  }
}

export async function deleteService(id: string) {
  try {
    return await prisma.service.delete({
      where: { id },
    });
  } catch (err) {
    throw new AppError("Service not found", 404);
  }
}
