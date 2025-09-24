import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Package, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTelegram } from "@/hooks/useTelegram";
import { useToast } from "@/hooks/use-toast";
import { Ad } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const MyListings = () => {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const { toast } = useToast();
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadMyAds();
  }, [user, navigate]);

  const loadMyAds = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить ваши объявления",
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

  const handleDelete = async (adId: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId)
        .eq('author_id', user?.id);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось удалить объявление",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Успешно!",
        description: "Объявление удалено",
      });

      await loadMyAds();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (adId: string, newStatus: 'active' | 'sold' | 'exchanged') => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ status: newStatus })
        .eq('id', adId)
        .eq('author_id', user?.id);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось изменить статус объявления",
          variant: "destructive",
        });
        return;
      }

      const statusText = newStatus === 'sold' ? 'продано' : 
                        newStatus === 'exchanged' ? 'обменено' : 'активировано';

      toast({
        title: "Успешно!",
        description: `Объявление отмечено как ${statusText}`,
      });

      await loadMyAds();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при изменении статуса",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sold':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Продано</Badge>;
      case 'exchanged':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Обменено</Badge>;
      default:
        return <Badge variant="outline">Активно</Badge>;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-telegram-bg pb-20">
      {/* Заголовок */}
      <div className="sticky top-0 z-10 bg-telegram-bg border-b border-border">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-semibold text-telegram-text">
              Мои объявления
            </h1>
          </div>
        </div>
      </div>

      {/* Содержимое */}
      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-telegram-hint">Загрузка...</p>
          </div>
        ) : ads.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-telegram-hint opacity-50" />
            <p className="text-lg mb-2 text-telegram-text">У вас пока нет объявлений</p>
            <p className="text-sm text-telegram-hint mb-4">
              Создайте первое объявление и начните продавать или обменивать товары
            </p>
            <Button 
              onClick={() => navigate("/")}
              className="bg-telegram-button text-telegram-button-text"
            >
              Создать объявление
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {ads.map((ad) => (
              <Card key={ad.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-telegram-text line-clamp-1">
                        {ad.title}
                      </h3>
                      {getStatusBadge(ad.status)}
                    </div>
                    
                    <p className="text-sm text-telegram-hint mb-2 line-clamp-2">
                      {ad.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-telegram-hint">
                      <span>{ad.location}</span>
                      <span>
                        {format(new Date(ad.created_at), "dd MMM yyyy", { locale: ru })}
                      </span>
                    </div>
                    
                    <div className="mt-2">
                      <span className="font-semibold text-telegram-text">
                        {ad.price.toLocaleString()} ₽
                      </span>
                    </div>
                  </div>
                  
                  {ad.images.length > 0 && (
                    <img
                      src={ad.images[0]}
                      alt={ad.title}
                      className="w-16 h-16 object-cover rounded-lg ml-3"
                    />
                  )}
                </div>

                {/* Действия */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/edit-ad/${ad.id}`)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Редактировать
                  </Button>

                  {ad.status === 'active' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(ad.id, 'sold')}
                        className="flex-1"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Продано
                      </Button>
                      
                      {ad.ad_type.includes('exchange') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(ad.id, 'exchanged')}
                          className="flex-1"
                        >
                          <Package className="w-4 h-4 mr-1" />
                          Обменено
                        </Button>
                      )}
                    </>
                  )}

                  {ad.status !== 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(ad.id, 'active')}
                      className="flex-1"
                    >
                      Активировать
                    </Button>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="px-3">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удалить объявление?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Это действие нельзя отменить. Объявление будет удалено навсегда.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(ad.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;