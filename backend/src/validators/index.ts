import { z } from 'zod';

export const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

export const RegisterSchema = z.object({
  name: z.string().min(20, 'Name must be at least 20 characters').max(60, 'Name cannot exceed 60 characters'),
  email: z.string().email('Invalid email address'),
  address: z.string().max(400, 'Address cannot exceed 400 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password cannot exceed 16 characters')
    .regex(passwordRegex, 'Password must contain at least one uppercase letter and one special character'),
  role: z.enum(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER']).optional(), // Optional for normal signup
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

export const UpdatePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string()
    .min(8)
    .max(16)
    .regex(passwordRegex, 'Password must contain at least one uppercase letter and one special character'),
});

export const CreateStoreSchema = z.object({
  name: z.string().min(1, 'Store name is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().max(400, 'Address cannot exceed 400 characters'),
  ownerId: z.string().uuid('Invalid owner ID'),
});

export const SubmitRatingSchema = z.object({
  storeId: z.string().uuid('Invalid store ID'),
  rating: z.number().int().min(1).max(5),
});
