import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, QrCode } from 'lucide-react';

interface BookingQRCodeProps {
  bookingId: string;
  seatLabel: string;
  date: string;
  shift: string;
}

export function BookingQRCode({ bookingId, seatLabel, date, shift }: BookingQRCodeProps) {
  const qrValue = `BK-${bookingId.substring(0, 8).toUpperCase()}`;

  const handleDownload = () => {
    const svg = document.getElementById('booking-qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        
        const downloadLink = document.createElement('a');
        downloadLink.download = `booking-${bookingId.substring(0, 8)}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Your Booking QR
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center p-4 bg-white rounded-lg">
          <QRCodeSVG
            id="booking-qr-code"
            value={qrValue}
            size={160}
            level="H"
            includeMargin={true}
          />
        </div>
        
        <div className="text-center">
          <p className="font-mono text-lg font-bold">{qrValue}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Seat {seatLabel} • {date} • {shift}
          </p>
        </div>

        <Button onClick={handleDownload} variant="outline" className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download QR Code
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Show this QR code at the entrance for check-in
        </p>
      </CardContent>
    </Card>
  );
}
