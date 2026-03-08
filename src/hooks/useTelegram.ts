'use client';

import { useEffect, useState } from 'react';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
}

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [tg, setTg] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const webApp = (window as any).Telegram.WebApp;

      // 1. Сообщаем Telegram, что приложение готово
      webApp.ready();

      // 2. Разворачиваем на весь экран (очень важно!)
      webApp.expand();

      // 3. Получаем информацию о пользователе
      if (webApp.initDataUnsafe?.user) {
        setUser(webApp.initDataUnsafe.user);
      }

      // 4. Сохраняем объект WebApp для дальнейшего использования
      setTg(webApp);
    }
  }, []);

  // Функция вибрации (только на мобильных устройствах)
  const hapticFeedback = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(style);
    }
  };

  return { tg, user, hapticFeedback };
}
