import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, RefreshCw, Filter, Grid, List } from "lucide-react";
import { AdCard } from "@/components/AdCard";
import { AdGridCard } from "@/components/AdGridCard";
import { AdDetail } from "@/components/AdDetail";
import { CreateAdForm } from "@/components/CreateAdForm";
import { useTelegram } from "@/hooks/useTelegram";
import { useToast } from "@/hooks/use-toast";
import { Ad, AdCategory, AdType } from "@/types";

const Index = () => {
  const { isReady, user, tg } = useTelegram();
  const { toast } = useToast();
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AdCategory | 'all'>('all');
  const [selectedType, setSelectedType] = useState<AdType | 'all'>('all');
  const [viewType, setViewType] = useState<'list' | 'grid'>('list');

  // Моковые данные для демонстрации коллекционных фигурок
  const mockAds: Ad[] = [
    {
      id: '1',
      title: 'Labubu - Winter Series (Mint)',
      description: 'Оригинальная фигурка Labubu из зимней серии в идеальном состоянии. Никогда не вскрывалась, есть все аксессуары и карточка.',
      price: 3500,
      category: 'figures',
      ad_type: ['sale'],
      image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      created_at: '2024-01-15T10:00:00Z',
      author_id: 12345,
      author_name: 'Алексей',
      contact_info: '+7 999 123-45-67'
    },
    {
      id: '2',
      title: 'Hirono UFO Series - Chase',
      description: 'Редкая чейз версия Hirono из UFO серии. В отличном состоянии, с оригинальной упаковкой. Готов к обмену на Skullpanda.',
      price: 8000,
      category: 'figures',
      ad_type: ['sale', 'exchange'],
      image_url: 'https://images.unsplash.com/photo-1530325553146-dfc1684b6e40?w=400',
      created_at: '2024-01-14T15:30:00Z',
      author_id: 67890,
      author_name: 'Мария',
      contact_info: 'maria@example.com'
    },
    {
      id: '3',
      title: 'Pop Mart мерч - кружка Labubu',
      description: 'Официальная кружка с принтом Labubu от Pop Mart. Использовалась пару раз, в отличном состоянии.',
      price: 1200,
      category: 'merch',
      ad_type: ['sale'],
      created_at: '2024-01-13T09:15:00Z',
      author_id: 11111,
      author_name: 'Дмитрий'
    },
    {
      id: '4',
      title: 'Плюшевый Skullpanda 30см',
      description: 'Большая плюшевая игрушка Skullpanda высотой 30см. Очень мягкая и приятная на ощупь. Состояние новой.',
      price: 2800,
      category: 'plush',
      ad_type: ['exchange'],
      image_url: 'https://images.unsplash.com/photo-1530325553146-dfc1684b6e40?w=400',
      created_at: '2024-01-12T14:20:00Z',
      author_id: 22222,
      author_name: 'Анна'
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
    // Временно отключаем проверку пользователя для тестирования
    setShowCreateForm(true);
  };

  const handleAdSubmit = async (adData: any) => {
    // Здесь будет интеграция с Supabase
    const newAd: Ad = {
      id: Date.now().toString(),
      ...adData,
      created_at: new Date().toISOString(),
      author_id: user?.id || Date.now(),
      author_name: user?.first_name || 'Тестовый пользователь',
      image_url: adData.image ? URL.createObjectURL(adData.image) : undefined,
    };
    
    setAds(prev => [newAd, ...prev]);
    setShowCreateForm(false);
  };

  // Фильтрация объявлений
  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ad.category === selectedCategory;
    const matchesType = selectedType === 'all' || ad.ad_type.includes(selectedType);
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getCategoryLabel = (category: AdCategory) => {
    const labels = {
      figures: 'Фигурки',
      merch: 'Мерч',
      plush: 'Плюши'
    };
    return labels[category];
  };

  const getTypeLabel = (type: AdType) => {
    const labels = {
      sale: 'Продажа',
      exchange: 'Обмен'
    };
    return labels[type];
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
              Pop Mart Маркет
            </h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setViewType(viewType === 'list' ? 'grid' : 'list')}
                className="p-2 h-auto"
              >
                {viewType === 'list' ? <Grid className="w-5 h-5" /> : <List className="w-5 h-5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleCreateAd}
                className="p-2 h-auto"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-telegram-hint mt-1">
            Коллекционные фигурки и мерч
          </p>

          {/* Поиск */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-telegram-hint" />
            <Input
              placeholder="Поиск по названию или описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-telegram-secondary-bg border-telegram-separator"
            />
          </div>

          {/* Фильтры */}
          <div className="mt-3 flex gap-2">
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as AdCategory | 'all')}>
              <SelectTrigger className="flex-1 bg-telegram-secondary-bg border-telegram-separator">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                <SelectItem value="figures">Фигурки</SelectItem>
                <SelectItem value="merch">Мерч</SelectItem>
                <SelectItem value="plush">Плюши</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as AdType | 'all')}>
              <SelectTrigger className="flex-1 bg-telegram-secondary-bg border-telegram-separator">
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="sale">Продажа</SelectItem>
                <SelectItem value="exchange">Обмен</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Список объявлений */}
      <div className="p-4">
        {filteredAds.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-telegram-hint">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">
                {searchQuery || selectedCategory !== 'all' || selectedType !== 'all' 
                  ? 'Ничего не найдено' 
                  : 'Пока нет объявлений'}
              </p>
              <p className="text-sm">
                {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                  ? 'Попробуйте изменить критерии поиска'
                  : 'Станьте первым, кто разместит объявление!'}
              </p>
            </div>
            {!searchQuery && selectedCategory === 'all' && selectedType === 'all' && (
              <Button 
                onClick={handleCreateAd}
                className="mt-4 bg-telegram-button text-telegram-button-text"
              >
                Создать объявление
              </Button>
            )}
          </Card>
        ) : (
          <div className={viewType === 'grid' ? 'space-y-3' : 'space-y-3'}>
            {filteredAds.map((ad) => (
              viewType === 'grid' ? (
                <AdGridCard 
                  key={ad.id}
                  ad={ad} 
                  onClick={() => setSelectedAd(ad)}
                />
              ) : (
                <AdCard 
                  key={ad.id}
                  ad={ad} 
                  onClick={() => setSelectedAd(ad)}
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
