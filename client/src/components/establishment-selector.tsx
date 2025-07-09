import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building, ChevronDown, ShoppingCart, Coffee, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Establishment } from "@shared/schema";

interface EstablishmentSelectorProps {
  selectedEstablishment: Establishment | null;
  onEstablishmentChange: (establishment: Establishment) => void;
}

const getEstablishmentIcon = (type: string) => {
  switch (type) {
    case 'supermarket':
      return <ShoppingCart className="text-primary" size={16} />;
    case 'butcher':
      return <UtensilsCrossed className="text-secondary" size={16} />;
    case 'bakery':
      return <Coffee className="text-accent" size={16} />;
    default:
      return <Building className="text-slate-600" size={16} />;
  }
};

export function EstablishmentSelector({ selectedEstablishment, onEstablishmentChange }: EstablishmentSelectorProps) {
  const { data: establishments, isLoading } = useQuery<Establishment[]>({
    queryKey: ['/api/establishments'],
  });

  // Set default establishment if none selected
  useEffect(() => {
    if (!selectedEstablishment && establishments && establishments.length > 0) {
      onEstablishmentChange(establishments[0]);
    }
  }, [establishments, selectedEstablishment, onEstablishmentChange]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-lg">
        <Building className="text-slate-600" size={16} />
        <span className="text-sm text-slate-700">Carregando...</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          {selectedEstablishment ? getEstablishmentIcon(selectedEstablishment.type) : <Building className="text-slate-600" size={16} />}
          <span className="text-sm font-medium text-slate-700">
            {selectedEstablishment?.name || 'Selecionar Estabelecimento'}
          </span>
          <ChevronDown className="text-slate-500" size={12} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        {establishments?.map((establishment) => (
          <DropdownMenuItem
            key={establishment.id}
            onClick={() => onEstablishmentChange(establishment)}
            className="flex items-center p-3 cursor-pointer"
          >
            {getEstablishmentIcon(establishment.type)}
            <div className="ml-3">
              <p className="font-medium text-slate-900">{establishment.name}</p>
              <p className="text-xs text-slate-500">{establishment.description}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
