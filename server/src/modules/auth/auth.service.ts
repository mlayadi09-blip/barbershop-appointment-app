import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";
import { generateToken } from "../../utils/generateToken";
import { AppError } from "../../errors/AppError";

export async function registerUser(data: { email: string; password: string }) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
    },
  });

  return user;
}

export async function loginUser(data: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const validPassword = await bcrypt.compare(data.password, user.password);

  if (!validPassword) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user.id);

  return {
    token,
  };
}
