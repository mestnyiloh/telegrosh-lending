import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { user, tg } = useTelegram();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Если пользователь уже авторизован, перенаправляем на главную
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleTelegramAuth = async () => {
    if (!agreeToTerms) {
      toast({
        title: "Ошибка",
        description: "Необходимо согласиться с правилами площадки",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Ошибка",
        description: "Не удалось получить данные Telegram пользователя",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Проверяем, существует ли уже пользователь в базе
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (!existingUser) {
        // Создаем новую запись пользователя
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            telegram_id: user.id,
            first_name: user.first_name,
            last_name: user.last_name || null,
            username: user.username || null,
            language_code: user.language_code || 'ru',
          });

        if (insertError) {
          throw insertError;
        }
      }

      toast({
        title: "Успешно!",
        description: "Вы успешно авторизованы через Telegram",
      });

      navigate("/");
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Ошибка авторизации",
        description: "Не удалось выполнить вход через Telegram",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-telegram-bg p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" onClick={handleGoBack} className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-lg">Вход в систему</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-telegram-button rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-.79.5-2.23 1.47-.21.15-.4.22-.58.22-.19 0-.55-.11-.82-.2-.33-.11-.59-.17-.57-.36.01-.1.15-.2.41-.32 1.61-.7 2.69-1.16 3.24-1.39 1.54-.64 1.86-.75 2.07-.75.05 0 .15.01.21.07.05.05.06.12.07.17-.01.06-.01.24-.05.38z"/>
              </svg>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-telegram-text">
                Добро пожаловать!
              </h2>
              <p className="text-telegram-hint text-sm leading-relaxed">
                Для размещения объявлений и связи с авторами необходим вход через Telegram.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="terms" 
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                className="mt-1"
              />
              <label 
                htmlFor="terms" 
                className="text-sm text-telegram-text leading-relaxed cursor-pointer"
              >
                Я согласен с правилами площадки и политикой конфиденциальности
              </label>
            </div>

            <Button 
              onClick={handleTelegramAuth}
              disabled={!agreeToTerms || isLoading || !user}
              className="w-full bg-telegram-button text-telegram-button-text hover:bg-telegram-button/90"
            >
              {isLoading ? "Выполняется вход..." : "Войти через Telegram"}
            </Button>

            {!user && (
              <p className="text-xs text-telegram-hint text-center">
                Откройте приложение через Telegram для продолжения
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;