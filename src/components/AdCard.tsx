import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ad } from "@/types";

interface AdCardProps {
  ad: Ad;
  onClick: () => void;
}

export const AdCard = ({ ad, onClick }: AdCardProps) => {
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
      month: 'short',
    });
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
      className="p-0 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
      onClick={onClick}
    >
      <div className="flex gap-3 p-3">
        {ad.images.length > 0 && (
          <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted">
            <img 
              src={ad.images[0]} 
              alt={ad.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0 flex flex-col">
          <h3 className="font-medium text-telegram-text text-sm leading-tight mb-1 line-clamp-2">
            {ad.title}
          </h3>
          
          <p className="text-sm font-semibold text-telegram-text mb-2">
            {formatPrice(ad.price)}
          </p>
          
          <div className="flex items-center justify-between text-xs text-telegram-hint mb-2">
            <span>{formatDate(ad.created_at)}</span>
            <span>{ad.author_name}</span>
          </div>

          <div className="flex gap-1 mt-auto">
            <Badge variant="secondary" className="text-xs">
              {getCategoryLabel(ad.category)}
            </Badge>
            {ad.ad_type.includes('sale') && (
              <Badge variant="outline" className="text-xs">
                Продажа
              </Badge>
            )}
            {ad.ad_type.includes('exchange') && (
              <Badge variant="outline" className="text-xs">
                Обмен
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};