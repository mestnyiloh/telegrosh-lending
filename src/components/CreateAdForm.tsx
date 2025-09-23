import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Camera, Loader2, X } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { useToast } from "@/hooks/use-toast";
import { AdCategory, AdType } from "@/types";
import { compressImages } from "@/utils/imageCompression";

interface CreateAdFormProps {
  onClose: () => void;
  onSubmit: (adData: {
    title: string;
    description: string;
    price: number;
    category: AdCategory;
    ad_type: AdType[];
    images?: File[];
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
    category: '' as AdCategory | '',
    ad_type: [] as AdType[],
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 3) {
      toast({
        title: "Ошибка",
        description: "Можно добавить не более 3 фотографий",
        variant: "destructive",
      });
      return;
    }

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: "Ошибка",
          description: "Размер файла не должен превышать 10MB",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.price || !formData.category || formData.ad_type.length === 0) {
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
      let compressedImages: File[] = [];
      
      if (images.length > 0) {
        toast({
          title: "Обработка изображений",
          description: "Сжимаем фотографии...",
        });
        
        compressedImages = await compressImages(images, 150);
      }

      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: price,
        category: formData.category,
        ad_type: formData.ad_type,
        images: compressedImages.length > 0 ? compressedImages : undefined,
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

  const handleTypeChange = (type: AdType, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      ad_type: checked 
        ? [...prev.ad_type, type]
        : prev.ad_type.filter(t => t !== type)
    }));
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
            Фотографии ({images.length}/3)
          </Label>
          
          <div className="mt-2 space-y-3">
            {/* Превью загруженных изображений */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Кнопка добавления фото */}
            {images.length < 3 && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  multiple
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-telegram-link transition-colors"
                >
                  <div className="flex flex-col items-center text-telegram-hint">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-sm">Добавить фото</span>
                    <span className="text-xs opacity-70">До 150kb каждое</span>
                  </div>
                </label>
              </>
            )}
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
              placeholder="Например: Labubu Winter Series"
              className="mt-1"
              maxLength={100}
            />
          </div>

          <div>
            <Label htmlFor="category" className="text-sm font-medium text-telegram-section-header">
              Категория *
            </Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as AdCategory }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="figures">Фигурки (виниловые)</SelectItem>
                <SelectItem value="merch">Мерч</SelectItem>
                <SelectItem value="plush">Плюши</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-telegram-section-header">
              Тип объявления *
            </Label>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sale" 
                  checked={formData.ad_type.includes('sale')}
                  onCheckedChange={(checked) => handleTypeChange('sale', checked as boolean)}
                />
                <Label htmlFor="sale" className="text-sm">Продажа</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="exchange" 
                  checked={formData.ad_type.includes('exchange')}
                  onCheckedChange={(checked) => handleTypeChange('exchange', checked as boolean)}
                />
                <Label htmlFor="exchange" className="text-sm">Обмен</Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="price" className="text-sm font-medium text-telegram-section-header">
              Цена (₽) *
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
            {user?.first_name || 'Тестовый пользователь'} {user?.last_name || ''}
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