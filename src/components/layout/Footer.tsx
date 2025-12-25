import { BookOpen, Clock, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-semibold">StudySpace</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your focused study destination. Book seats, manage your time, and achieve your goals.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Operating Hours</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>07:00 AM - 10:00 PM IST</span>
              </div>
              <p>Monday - Sunday</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Shifts</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium">Morning:</span> 07:00 - 14:30</p>
              <p><span className="font-medium">Evening:</span> 14:30 - 22:00</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>123 Study Lane, Knowledge City</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} StudySpace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
