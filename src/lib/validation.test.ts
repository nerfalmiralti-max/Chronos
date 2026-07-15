import { describe, expect, it } from 'vitest';
import { authErrorMessage } from './auth-errors';
import { normalizeEmail, registerSchema } from './validation';

describe('auth validation', () => {
  it('normalizes email safely', () => expect(normalizeEmail('  USER@Example.COM ')).toBe('user@example.com'));
  it('rejects weak and mismatched passwords', () => expect(registerSchema.safeParse({ name: 'Anna', email: 'a@example.com', password: 'short', confirmPassword: 'other', accepted: true }).success).toBe(false));
  it('does not expose raw server errors', () => expect(authErrorMessage(new Error('SQL internal abc'))).toBe('Не удалось выполнить действие. Попробуйте ещё раз.'));
});
