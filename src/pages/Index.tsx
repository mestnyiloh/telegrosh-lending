import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Search, RefreshCw } from "lucide-react";
import { AdCard } from "@/components/AdCard";
import { AdDetail } from "@/components/AdDetail";
import { CreateAdForm } from "@/components/CreateAdForm";
import { useTelegram } from "@/hooks/useTelegram";
import { useToast } from "@/hooks/use-toast";
import { Ad } from "@/types";

const Index = () => {
  const { isReady, user, tg } = useTelegram();
  const { toast } = useToast();
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Моковые данные для демонстрации
  const mockAds: Ad[] = [
    {
      id: '1',
      title: 'iPhone 14 Pro в отличном состоянии',
      description: 'Продаю iPhone 14 Pro 128GB в идеальном состоянии. Использовался аккуратно, всегда в чехле и с защитным стеклом. В комплекте зарядное устройство и коробка.',
      price: 85000,
      image_url: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=400',
      created_at: '2024-01-15T10:00:00Z',
      author_id: 12345,
      author_name: 'Алексей',
      contact_info: '+7 999 123-45-67'
    },
    {
      id: '2',
      title: 'MacBook Air M2 почти новый',
      description: 'MacBook Air M2 13 дюймов, 256GB SSD, 8GB RAM. Куплен 3 месяца назад, использовался для учебы. Состояние как новый.',
      price: 120000,
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      created_at: '2024-01-14T15:30:00Z',
      author_id: 67890,
      author_name: 'Мария',
      contact_info: 'maria@example.com'
    },
    {
      id: '3',
      title: 'Диван-кровать IKEA',
      description: 'Продаю диван-кровать от IKEA в хорошем состоянии. Серый цвет, размер 200x140 см в разложенном виде. Очень удобный для сна.',
      price: 25000,
      created_at: '2024-01-13T09:15:00Z',
      author_id: 11111,
      author_name: 'Дмитрий'
    }
  ];

  useEffect(() => {
    // Устанавливаем моковые данные при загрузке
    setAds(mockAds);
  }, []);

  // Настройка главной кнопки
  useEffect(() => {
    if (tg?.MainButton && !selectedAd && !showCreateForm) {
      tg.MainButton.setText('Создать объявление');
      tg.MainButton.show();
      tg.MainButton.onClick(handleCreateAd);
      
      return () => {
        tg.MainButton.hide();
        tg.MainButton.offClick(handleCreateAd);
      };
    }
  }, [tg, selectedAd, showCreateForm]);

  const handleCreateAd = () => {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Пользователь не найден",
        variant: "destructive",
      });
      return;
    }
    setShowCreateForm(true);
  };

  const handleAdSubmit = async (adData: any) => {
    // Здесь будет интеграция с Supabase
    const newAd: Ad = {
      id: Date.now().toString(),
      ...adData,
      created_at: new Date().toISOString(),
      author_id: user?.id || 0,
      author_name: user?.first_name || 'Аноним',
      image_url: adData.image ? URL.createObjectURL(adData.image) : undefined,
    };
    
    setAds(prev => [newAd, ...prev]);
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-telegram-hint" />
          <p className="text-telegram-hint">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (selectedAd) {
    return (
      <AdDetail 
        ad={selectedAd} 
        onClose={() => setSelectedAd(null)} 
      />
    );
  }

  if (showCreateForm) {
    return (
      <CreateAdForm 
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleAdSubmit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-telegram-bg">
      {/* Заголовок */}
      <div className="sticky top-0 z-10 bg-telegram-bg border-b border-border">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-telegram-text">
              Объявления
            </h1>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleCreateAd}
              className="p-2 h-auto"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          
          {user && (
            <p className="text-sm text-telegram-hint mt-1">
              Добро пожаловать, {user.first_name}!
            </p>
          )}
        </div>
      </div>

      {/* Список объявлений */}
      <div className="p-4">
        {ads.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-telegram-hint">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Пока нет объявлений</p>
              <p className="text-sm">Станьте первым, кто разместит объявление!</p>
            </div>
            <Button 
              onClick={handleCreateAd}
              className="mt-4 bg-telegram-button text-telegram-button-text"
            >
              Создать объявление
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {ads.map((ad) => (
              <AdCard 
                key={ad.id} 
                ad={ad} 
                onClick={() => setSelectedAd(ad)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
