import { Request, Response } from "express";

import { registerUser, loginUser } from "./auth.service";

import { registerSchema } from "./auth.validation";

export async function register(req: Request, res: Response) {
  const validatedData = registerSchema.parse(req.body);

  const user = await registerUser(validatedData);

  res.status(201).json(user);
}

export async function login(req: Request, res: Response) {
  const result = await loginUser(req.body);

  res.json(result);
}
