import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("Ingresa un correo valido")
  .max(255, "El correo es demasiado largo");

export const passwordSchema = z
  .string()
  .min(8, "La contrasena debe tener al menos 8 caracteres")
  .max(72, "La contrasena es demasiado larga");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Ingresa tu contrasena")
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Ingresa tu nombre").max(120, "El nombre es demasiado largo"),
  email: emailSchema,
  password: passwordSchema
});

export const recoverPasswordSchema = z.object({
  email: emailSchema
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RecoverPasswordInput = z.infer<typeof recoverPasswordSchema>;
