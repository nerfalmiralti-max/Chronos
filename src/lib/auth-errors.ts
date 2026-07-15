type Locale = 'ru' | 'en';
const messages = {
  ru: { config: 'Подключение к Supabase ещё не настроено.', invalid: 'Неверный email или пароль.', confirm: 'Подтвердите адрес электронной почты.', rate: 'Слишком много попыток. Попробуйте позже.', network: 'Не удалось подключиться к серверу.', expired: 'Срок действия сессии истёк. Войдите снова.', weak: 'Пароль не соответствует требованиям безопасности.', generic: 'Не удалось выполнить действие. Попробуйте ещё раз.' },
  en: { config: 'Supabase connection is not configured yet.', invalid: 'Incorrect email or password.', confirm: 'Please confirm your email address.', rate: 'Too many attempts. Try again later.', network: 'Could not connect to the server.', expired: 'Your session expired. Sign in again.', weak: 'The password does not meet the security requirements.', generic: 'Could not complete the action. Please try again.' },
} as const;

export function authErrorMessage(error: unknown, locale: Locale = 'ru') {
  const text = error instanceof Error ? error.message.toLowerCase() : '';
  const copy = messages[locale];
  if (text.includes('not_configured')) return copy.config;
  if (text.includes('invalid login') || text.includes('invalid_credentials')) return copy.invalid;
  if (text.includes('email not confirmed')) return copy.confirm;
  if (text.includes('rate') || text.includes('too many')) return copy.rate;
  if (text.includes('network') || text.includes('fetch')) return copy.network;
  if (text.includes('expired') || text.includes('refresh_token')) return copy.expired;
  if (text.includes('weak') || text.includes('password should')) return copy.weak;
  return copy.generic;
}
