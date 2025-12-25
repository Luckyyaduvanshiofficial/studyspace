import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeatmapData {
  hour: string;
  occupancy: number;
}

interface HeatmapChartProps {
  data: HeatmapData[];
}

export function HeatmapChart({ data }: HeatmapChartProps) {
  const getHeatColor = (occupancy: number) => {
    if (occupancy >= 80) return 'bg-destructive/80';
    if (occupancy >= 60) return 'bg-chart-2/80';
    if (occupancy >= 40) return 'bg-chart-3/80';
    if (occupancy >= 20) return 'bg-chart-1/60';
    return 'bg-muted';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Hourly Occupancy Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span>Low</span>
            <div className="flex gap-1">
              <div className="h-4 w-4 rounded bg-muted" />
              <div className="h-4 w-4 rounded bg-chart-1/60" />
              <div className="h-4 w-4 rounded bg-chart-3/80" />
              <div className="h-4 w-4 rounded bg-chart-2/80" />
              <div className="h-4 w-4 rounded bg-destructive/80" />
            </div>
            <span>High</span>
          </div>

          {/* Heatmap Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-2">
            {data.map((item, index) => (
              <div
                key={index}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg transition-all hover:scale-105',
                  getHeatColor(item.occupancy)
                )}
                title={`${item.hour}: ${item.occupancy}% occupancy`}
              >
                <span className="text-xs font-medium text-foreground/80">
                  {item.hour.replace(':00', '')}
                </span>
                <span className="text-xs text-foreground/60">{item.occupancy}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
