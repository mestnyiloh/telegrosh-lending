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
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const Index = () => {
  const { isReady, user, tg } = useTelegram();
  const { toast } = useToast();
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewType, setViewType] = useState<'list' | 'grid'>('list');

  // Загрузка объявлений из Supabase
  const loadAds = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить объявления",
          variant: "destructive",
        });
        return;
      }

      setAds(data || []);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при загрузке данных",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
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
    try {
      let imageUrl = null;

      // Загружаем изображение в Storage если оно есть
      if (adData.image) {
        const fileExt = adData.image.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('ad-images')
          .upload(fileName, adData.image);

        if (uploadError) {
          toast({
            title: "Ошибка загрузки изображения",
            description: uploadError.message,
            variant: "destructive",
          });
          return;
        }

        // Получаем публичный URL изображения
        const { data: urlData } = supabase.storage
          .from('ad-images')
          .getPublicUrl(uploadData.path);
        
        imageUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('ads')
        .insert({
          title: adData.title,
          description: adData.description,
          price: adData.price,
          category: adData.category,
          ad_type: adData.ad_type,
          contact_info: adData.contact_info,
          author_id: user?.id || Date.now(),
          author_name: user?.first_name || 'Тестовый пользователь',
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось создать объявление",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Успешно!",
        description: "Объявление создано",
      });

      // Обновляем список объявлений
      await loadAds();
      setShowCreateForm(false);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при создании объявления",
        variant: "destructive",
      });
    }
  };

  // Фильтрация объявлений
  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ad.category === selectedCategory;
    const matchesType = selectedType === 'all' || ad.ad_type.includes(selectedType);
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      figures: 'Фигурки',
      merch: 'Мерч',
      plush: 'Плюши'
    };
    return labels[category] || category;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sale: 'Продажа',
      exchange: 'Обмен'
    };
    return labels[type] || type;
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
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

            <Select value={selectedType} onValueChange={setSelectedType}>
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
          <motion.div 
            className={viewType === 'grid' ? 'space-y-3' : 'space-y-3'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredAds.map((ad, index) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {viewType === 'grid' ? (
                  <AdGridCard 
                    ad={ad} 
                    onClick={() => setSelectedAd(ad)}
                  />
                ) : (
                  <AdCard 
                    ad={ad} 
                    onClick={() => setSelectedAd(ad)}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;
