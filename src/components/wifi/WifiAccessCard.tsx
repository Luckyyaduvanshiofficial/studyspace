import { useState } from 'react';
import { Wifi, Eye, EyeOff, Copy, Check, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWifi } from '@/hooks/useWifi';
import { useMembership } from '@/hooks/useMembership';
import { useToast } from '@/hooks/use-toast';

export function WifiAccessCard() {
  const { wifi, canAccessWifi, isLoading } = useWifi();
  const { membership, isActive } = useMembership();
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyPassword = async () => {
    if (wifi?.password) {
      await navigator.clipboard.writeText(wifi.password);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'WiFi password copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32" />
        </CardHeader>
        <CardContent>
          <div className="h-10 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!canAccessWifi || !isActive) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-5 w-5" />
            WiFi Access
          </CardTitle>
          <CardDescription>
            Active membership required to access WiFi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">
                {membership ? (
                  membership.status === 'EXPIRED' ? 
                    'Your membership has expired' : 
                    'Your membership is not active'
                ) : (
                  'Please sign in to access WiFi'
                )}
              </p>
            </div>
            <Badge variant="secondary">Locked</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5 text-primary" />
          WiFi Access
        </CardTitle>
        <CardDescription>
          Connect to the library WiFi network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
          <div>
            <p className="text-sm text-muted-foreground">Network Name (SSID)</p>
            <p className="font-medium">{wifi?.ssid || 'StudySpace-WiFi'}</p>
          </div>
          <Badge variant="default" className="bg-green-500">Active</Badge>
        </div>

        <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Password</p>
            <p className="font-mono font-medium">
              {showPassword ? wifi?.password : '••••••••••••'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyPassword}
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          WiFi access is available only for active members
        </p>
      </CardContent>
    </Card>
  );
}
