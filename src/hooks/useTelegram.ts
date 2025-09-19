import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          start_param?: string;
        };
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color: string;
          text_color: string;
          hint_color: string;
          link_color: string;
          button_color: string;
          button_text_color: string;
          secondary_bg_color: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
        };
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        onEvent: (eventType: string, callback: () => void) => void;
        offEvent: (eventType: string, callback: () => void) => void;
      };
    };
  }
}

export const useTelegram = () => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Инициализация WebApp
      tg.ready();
      tg.expand();
      
      // Установка пользователя
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }
      
      // Установка темы
      setColorScheme(tg.colorScheme);
      document.documentElement.classList.toggle('dark', tg.colorScheme === 'dark');
      
      // Обработка изменения темы
      const handleThemeChanged = () => {
        setColorScheme(tg.colorScheme);
        document.documentElement.classList.toggle('dark', tg.colorScheme === 'dark');
      };
      
      tg.onEvent('themeChanged', handleThemeChanged);
      setIsReady(true);
      
      return () => {
        tg.offEvent('themeChanged', handleThemeChanged);
      };
    }
  }, []);

  return {
    isReady,
    user,
    colorScheme,
    webApp: window.Telegram?.WebApp,
    tg: window.Telegram?.WebApp,
  };
};