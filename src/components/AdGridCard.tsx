import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ad } from "@/types";

interface AdGridCardProps {
  ad: Ad;
  onClick: () => void;
}

export const AdGridCard = ({ ad, onClick }: AdGridCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'figures': 'Фигурки',
      'merch': 'Мерч',
      'plush': 'Плюши'
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <Card 
      className="p-0 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98] aspect-square"
      onClick={onClick}
    >
      <div className="relative h-full">
        {/* Фото на всю карточку */}
        <div className="absolute inset-0">
          {ad.image_url ? (
            <img 
              src={ad.image_url} 
              alt={ad.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Нет фото</span>
            </div>
          )}
        </div>
        
        {/* Градиент и информация снизу */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <p className="text-lg font-semibold mb-2">
              {formatPrice(ad.price)}
            </p>
            
            <div className="flex gap-1 flex-wrap">
              <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/20">
                {getCategoryLabel(ad.category)}
              </Badge>
              {ad.ad_type.includes('sale') && (
                <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/20">
                  Продажа
                </Badge>
              )}
              {ad.ad_type.includes('exchange') && (
                <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/20">
                  Обмен
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};