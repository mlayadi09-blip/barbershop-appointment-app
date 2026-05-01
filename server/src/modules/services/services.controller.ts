import { Request, Response } from "express";
import {
  createService,
  getServiceById,
  getAllServices,
  updateService,
  deleteService,
} from "./services.service";
import {
  createServiceSchema,
  updateServiceSchema,
} from "./services.validation";
import { TypedRequest } from "../../types/typedRequest";

type Params = {
  id: string;
};

export async function create(req: Request, res: Response) {
  const validatedData = createServiceSchema.parse(req.body);

  const service = await createService(validatedData);

  res.status(201).json(service);
}

export async function getAll(req: Request, res: Response) {
  const services = await getAllServices();
  res.json(services);
}

export async function getById(req: TypedRequest<Params>, res: Response) {
  const { id } = req.params;

  const service = await getServiceById(id);

  res.json({
    success: true,
    data: service,
  });
}

export async function update(req: TypedRequest<Params>, res: Response) {
  const { id } = req.params;

  const validatedData = updateServiceSchema.parse(req.body);

  const updatedService = await updateService(id, validatedData);

  res.json({
    success: true,
    data: updatedService,
  });
}

export async function remove(req: TypedRequest<Params>, res: Response) {
  const { id } = req.params;

  await deleteService(id);

  res.json({
    success: true,
    message: "Service deleted successfully",
  });
}
