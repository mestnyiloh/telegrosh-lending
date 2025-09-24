import React from "react";
import { Button } from "@/components/ui/button";
import { User, FileText, Plus, Heart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTelegram } from "@/hooks/useTelegram";

interface BottomNavigationProps {
  onCreateAd: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onCreateAd }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useTelegram();

  const handleProfileClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/profile");
  };

  const handleMyListingsClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/my-listings");
  };

  const handleCreateClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    onCreateAd();
  };

  const handleSwipesClick = () => {
    toast({
      title: "Функция в разработке",
      description: "Скоро появится новый способ поиска!",
    });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-telegram-bg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-4">
        {/* Профиль */}
        <Button
          variant="ghost"
          onClick={handleProfileClick}
          className={`flex flex-col items-center justify-center h-12 px-3 space-y-1 ${
            isActive("/profile") ? "text-telegram-button" : "text-telegram-hint"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-xs">Профиль</span>
        </Button>

        {/* Мои объявления */}
        <Button
          variant="ghost"
          onClick={handleMyListingsClick}
          className={`flex flex-col items-center justify-center h-12 px-3 space-y-1 ${
            isActive("/my-listings") ? "text-telegram-button" : "text-telegram-hint"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-xs">Мои</span>
        </Button>

        {/* Создать объявление - центральная кнопка */}
        <Button
          onClick={handleCreateClick}
          className="w-14 h-14 rounded-full bg-telegram-button text-telegram-button-text hover:bg-telegram-button/90 shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </Button>

        {/* Свайпы */}
        <Button
          variant="ghost"
          onClick={handleSwipesClick}
          className="flex flex-col items-center justify-center h-12 px-3 space-y-1 text-telegram-hint opacity-60"
        >
          <Heart className="w-5 h-5" />
          <span className="text-xs">Свайпы</span>
        </Button>

        {/* Пустое место для симметрии */}
        <div className="w-12"></div>
      </div>
    </div>
  );
};

export default BottomNavigation;