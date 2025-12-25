import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    try {
      setError(null);
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Extract booking ID from QR code
          const bookingId = decodedText.replace('BK-', '');
          onScan(bookingId);
          stopScanner();
        },
        () => {} // Ignore errors during scanning
      );

      setIsScanning(true);
    } catch (err: any) {
      setError(err.message || 'Failed to start camera');
      console.error('Error starting scanner:', err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div 
        id="qr-reader" 
        className="w-full aspect-square rounded-lg overflow-hidden bg-muted"
      />
      
      {error && (
        <div className="text-destructive text-sm text-center p-2 bg-destructive/10 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {!isScanning ? (
          <Button onClick={startScanner} className="flex-1 gap-2">
            <Camera className="h-4 w-4" />
            Start Camera
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="outline" className="flex-1 gap-2">
            <X className="h-4 w-4" />
            Stop Camera
          </Button>
        )}
        <Button onClick={onClose} variant="ghost">
          Cancel
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Point the camera at a booking QR code to check in the user
      </p>
    </div>
  );
}
