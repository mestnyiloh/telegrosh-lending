import { Card } from "@/components/ui/card";
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

  return (
    <Card 
      className="p-0 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
      onClick={onClick}
    >
      <div className="flex gap-3 p-4">
        {ad.image_url && (
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
            <img 
              src={ad.image_url} 
              alt={ad.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-telegram-text text-sm leading-tight mb-1 line-clamp-2">
            {ad.title}
          </h3>
          
          <p className="text-sm font-semibold text-telegram-text mb-2">
            {formatPrice(ad.price)}
          </p>
          
          <div className="flex items-center justify-between text-xs text-telegram-hint">
            <span>{formatDate(ad.created_at)}</span>
            <span>{ad.author_name}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};