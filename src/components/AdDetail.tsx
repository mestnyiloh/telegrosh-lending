import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, User, Calendar, Phone } from "lucide-react";
import { Ad } from "@/types";
import { useTelegram } from "@/hooks/useTelegram";

interface AdDetailProps {
  ad: Ad;
  onClose: () => void;
}

export const AdDetail = ({ ad, onClose }: AdDetailProps) => {
  const { tg } = useTelegram();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Настройка кнопки "Назад"
  React.useEffect(() => {
    if (tg?.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(onClose);
      
      return () => {
        tg.BackButton.hide();
        tg.BackButton.offClick(onClose);
      };
    }
  }, [tg, onClose]);

  return (
    <div className="min-h-screen bg-telegram-bg">
      {/* Заголовок */}
      <div className="sticky top-0 z-10 bg-telegram-bg border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="p-2 h-auto"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-medium text-telegram-text">Объявление</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Изображение */}
        {ad.image_url && (
          <Card className="p-0 overflow-hidden">
            <img 
              src={ad.image_url} 
              alt={ad.title}
              className="w-full h-64 object-cover"
            />
          </Card>
        )}

        {/* Основная информация */}
        <Card className="p-4 space-y-3">
          <h2 className="text-xl font-semibold text-telegram-text">
            {ad.title}
          </h2>
          
          <p className="text-2xl font-bold text-telegram-link">
            {formatPrice(ad.price)}
          </p>
        </Card>

        {/* Описание */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-telegram-section-header mb-2">
            Описание
          </h3>
          <p className="text-telegram-text leading-relaxed whitespace-pre-wrap">
            {ad.description}
          </p>
        </Card>

        {/* Информация об авторе */}
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-medium text-telegram-section-header mb-2">
            Автор объявления
          </h3>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-telegram-section-bg flex items-center justify-center">
              <User className="w-5 h-5 text-telegram-hint" />
            </div>
            <div>
              <p className="font-medium text-telegram-text">{ad.author_name}</p>
              <p className="text-sm text-telegram-hint">ID: {ad.author_id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-telegram-hint">
            <Calendar className="w-4 h-4" />
            <span>Опубликовано {formatDate(ad.created_at)}</span>
          </div>

          {ad.contact_info && (
            <div className="flex items-center gap-2 text-sm text-telegram-text">
              <Phone className="w-4 h-4" />
              <span>{ad.contact_info}</span>
            </div>
          )}
        </Card>

        {/* Кнопки действий */}
        <div className="pb-4">
          <Button 
            size="lg" 
            className="w-full bg-telegram-button text-telegram-button-text"
          >
            Написать автору
          </Button>
        </div>
      </div>
    </div>
  );
};