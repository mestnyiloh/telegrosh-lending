import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { useToast } from "@/hooks/use-toast";

interface CreateAdFormProps {
  onClose: () => void;
  onSubmit: (adData: {
    title: string;
    description: string;
    price: number;
    image?: File;
    contact_info?: string;
  }) => Promise<void>;
}

export const CreateAdForm = ({ onClose, onSubmit }: CreateAdFormProps) => {
  const { tg, user } = useTelegram();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    contact_info: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Ошибка",
          description: "Размер файла не должен превышать 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.price) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Ошибка",
        description: "Введите корректную цену",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: price,
        image: image || undefined,
        contact_info: formData.contact_info.trim() || undefined,
      });
      
      toast({
        title: "Успешно!",
        description: "Объявление создано",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать объявление",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="font-medium text-telegram-text">Новое объявление</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Фото */}
        <Card className="p-4">
          <Label className="text-sm font-medium text-telegram-section-header">
            Фотография
          </Label>
          
          <div className="mt-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-telegram-link transition-colors"
            >
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center text-telegram-hint">
                  <Camera className="w-8 h-8 mb-2" />
                  <span className="text-sm">Добавить фото</span>
                </div>
              )}
            </label>
          </div>
        </Card>

        {/* Основная информация */}
        <Card className="p-4 space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-telegram-section-header">
              Название *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Например: iPhone 14 Pro"
              className="mt-1"
              maxLength={100}
            />
          </div>

          <div>
            <Label htmlFor="price" className="text-sm font-medium text-telegram-section-header">
              Цена *
            </Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0"
              className="mt-1"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-telegram-section-header">
              Описание *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Подробное описание товара..."
              className="mt-1"
              rows={4}
              maxLength={1000}
            />
          </div>

          <div>
            <Label htmlFor="contact" className="text-sm font-medium text-telegram-section-header">
              Контакты
            </Label>
            <Input
              id="contact"
              value={formData.contact_info}
              onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
              placeholder="Телефон, email или другие контакты"
              className="mt-1"
              maxLength={100}
            />
          </div>
        </Card>

        {/* Автор */}
        <Card className="p-4">
          <Label className="text-sm font-medium text-telegram-section-header">
            Автор объявления
          </Label>
          <p className="mt-1 text-telegram-text">
            {user?.first_name} {user?.last_name}
          </p>
        </Card>

        {/* Кнопка отправки */}
        <div className="pb-4">
          <Button 
            type="submit"
            size="lg" 
            className="w-full bg-telegram-button text-telegram-button-text"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Создаём...
              </>
            ) : (
              'Опубликовать объявление'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};