import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { zones, shifts } from '@/data/mockData';
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Easy Booking',
    description: 'Reserve your seat in seconds with our intuitive booking system.',
  },
  {
    icon: Clock,
    title: 'Flexible Shifts',
    description: 'Choose morning, evening, or full-day sessions that fit your schedule.',
  },
  {
    icon: Users,
    title: 'Zone Variety',
    description: 'Find your perfect study environment from quiet to collaborative spaces.',
  },
  {
    icon: Shield,
    title: 'Guaranteed Spot',
    description: 'Your reserved seat is locked and waiting for you.',
  },
  {
    icon: Zap,
    title: 'Quick Check-in',
    description: 'Scan your QR code and start studying immediately.',
  },
  {
    icon: Sparkles,
    title: 'Premium Amenities',
    description: 'Air conditioning, high-speed WiFi, and comfortable seating.',
  },
];

export default function Landing() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        <div className="container relative py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Now accepting bookings for January 2026</span>
            </div>
            
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Your Perfect
              <span className="text-primary"> Study Space</span>
              <br />Awaits
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Book your seat, pick your shift, and focus on what matters.
              StudySpace offers premium study environments designed for serious learners.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/book">
                <Button size="lg" className="gap-2 px-8">
                  <Calendar className="h-5 w-5" />
                  Book a Seat
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="gap-2 px-8">
                  <BookOpen className="h-5 w-5" />
                  View My Bookings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card py-8">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Study Seats</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">15hrs</div>
              <div className="text-sm text-muted-foreground">Daily Operating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">4</div>
              <div className="text-sm text-muted-foreground">Study Zones</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Zones Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground">Choose Your Zone</h2>
            <p className="mt-3 text-muted-foreground">
              Different zones for different study styles
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {zones.map((zone) => (
              <Card key={zone.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-${zone.color}/10`}>
                    <BookOpen className={`h-6 w-6 text-${zone.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {zone.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{zone.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Shifts Section */}
      <section className="py-16 md:py-24 bg-accent/30">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground">
                Flexible Shift Options
              </h2>
              <p className="mt-4 text-muted-foreground">
                Our operating hours run from <strong>07:00 to 22:00 IST</strong>.
                Book a half-day or full-day session based on your study needs.
              </p>
              
              <div className="mt-8 space-y-4">
                {shifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{shift.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {shift.startTime} - {shift.endTime} IST
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Full Day</h4>
                    <p className="text-sm text-muted-foreground">
                      07:00 - 22:00 IST (Both Shifts)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {features.slice(0, 4).map((feature, index) => (
                <Card key={index} className="p-4">
                  <feature.icon className="h-8 w-8 text-primary mb-3" />
                  <h4 className="font-semibold text-foreground text-sm">{feature.title}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground">Why StudySpace?</h2>
            <p className="mt-3 text-muted-foreground">
              Everything you need for productive study sessions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="container text-center">
          <h2 className="font-serif text-3xl font-bold text-primary-foreground">
            Ready to Start Studying?
          </h2>
          <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
            Join hundreds of students who've found their perfect study spot.
            Book your seat now and experience focused, distraction-free learning.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/book">
              <Button size="lg" variant="secondary" className="gap-2 px-8">
                <CheckCircle className="h-5 w-5" />
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
