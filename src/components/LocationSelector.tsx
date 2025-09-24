import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const COMMON_CITIES = [
  "Москва",
  "Санкт-Петербург",
  "Новосибирск",
  "Екатеринбург",
  "Казань",
  "Нижний Новгород",
  "Челябинск",
  "Самара",
  "Омск",
  "Ростов-на-Дону",
  "Уфа",
  "Красноярск",
  "Воронеж",
  "Пермь",
  "Волгоград",
  "Краснодар",
  "Саратов",
  "Тюмень",
  "Тольятти",
  "Ижевск",
  "Барнаул",
  "other"
];

const LocationSelector: React.FC<LocationSelectorProps> = ({ value, onChange, error }) => {
  const [showCustomInput, setShowCustomInput] = useState(
    value && !COMMON_CITIES.includes(value) && value !== ""
  );

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "other") {
      setShowCustomInput(true);
      onChange("");
    } else {
      setShowCustomInput(false);
      onChange(selectedValue);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="location">Местоположение *</Label>
      
      {!showCustomInput ? (
        <Select value={value} onValueChange={handleSelectChange}>
          <SelectTrigger className="bg-telegram-section-bg border-border">
            <SelectValue placeholder="Выберите город" />
          </SelectTrigger>
          <SelectContent className="z-50">
            {COMMON_CITIES.slice(0, -1).map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
            <SelectItem value="other">Другой город</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <div className="space-y-2">
          <Input
            id="location"
            value={value}
            onChange={handleCustomInputChange}
            placeholder="Введите название города"
            className="bg-telegram-section-bg border-border"
          />
          <button
            type="button"
            onClick={() => {
              setShowCustomInput(false);
              onChange("");
            }}
            className="text-sm text-telegram-button hover:underline"
          >
            Выбрать из списка
          </button>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default LocationSelector;