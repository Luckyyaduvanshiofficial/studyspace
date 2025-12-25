import { VolumeX, Users, Sun, Monitor } from 'lucide-react';
import { Zone } from '@/types/library';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

const iconMap = {
  'volume-x': VolumeX,
  'users': Users,
  'sun': Sun,
  'monitor': Monitor,
};

interface ZoneSelectorProps {
  zones: Zone[];
  selectedZone: string | null;
  onSelectZone: (zoneId: string) => void;
}

export function ZoneSelector({ zones, selectedZone, onSelectZone }: ZoneSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {zones.map((zone) => {
        const Icon = iconMap[zone.icon as keyof typeof iconMap] || Sun;
        const isSelected = selectedZone === zone.id;
        
        return (
          <Card
            key={zone.id}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-md',
              isSelected
                ? 'ring-2 ring-primary border-primary bg-accent'
                : 'hover:border-primary/50'
            )}
            onClick={() => onSelectZone(zone.id)}
          >
            <CardContent className="p-4 text-center">
              <div
                className={cn(
                  'mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full',
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground">{zone.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {zone.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
