import { z } from 'zod';

export const normalizeEmail = (value: string) => value.trim().toLowerCase();
export const emailSchema = z.string().trim().toLowerCase().email('Введите корректный email');
export const passwordSchema = z.string().min(10, 'Минимум 10 символов').regex(/[a-zа-я]/i, 'Добавьте букву').regex(/\d/, 'Добавьте цифру');
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, 'Введите пароль') });
export const registerSchema = z.object({ name: z.string().trim().min(2, 'Введите имя').max(60), email: emailSchema, password: passwordSchema, confirmPassword: z.string(), accepted: z.boolean().refine(Boolean, 'Примите условия и политику конфиденциальности') }).refine((data) => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'Пароли не совпадают' });
export const resetSchema = z.object({ password: passwordSchema, confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'Пароли не совпадают' });
