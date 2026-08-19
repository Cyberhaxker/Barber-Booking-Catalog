import { useSearch, Link } from "wouter";
import { useGetBooking } from "@workspace/api-client-react";
import { getGetBookingQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Clock, User, Scissors } from "lucide-react";

export default function Confirmation() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const idStr = searchParams.get("id");
  const id = idStr ? parseInt(idStr, 10) : 0;

  const { data: booking, isLoading, isError } = useGetBooking(id, {
    query: {
      enabled: !!id,
      queryKey: getGetBookingQueryKey(id)
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-muted rounded-full mb-4"></div>
          <div className="h-6 w-48 bg-muted mb-2"></div>
          <div className="h-4 w-32 bg-muted"></div>
        </div>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-destructive/50 p-8 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Booking Not Found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find the details for this appointment.</p>
          <Button variant="outline" className="rounded-none w-full" asChild>
            <Link href="/book">Return to Booking</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 md:py-24">
      <div className="container mx-auto px-4 flex justify-center">
        <div className="max-w-xl w-full">
          <div className="bg-card border border-border p-8 md:p-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 text-primary/5">
              <CheckCircle2 className="w-64 h-64" />
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6 border border-primary/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">You're Booked.</h1>
              <p className="text-muted-foreground text-lg mb-8">
                Your appointment is confirmed. We've sent the details to your email.
              </p>

              <div className="space-y-6 bg-background/50 border border-border p-6 mb-8">
                <div className="flex items-start gap-4">
                  <User className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Client</p>
                    <p className="font-medium">{booking.clientName}</p>
                    <p className="text-sm text-muted-foreground">{booking.clientPhone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Scissors className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Service</p>
                    <p className="font-medium">{booking.styleName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                    <p className="font-medium">{new Date(booking.bookingDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="font-mono text-primary mt-1">{booking.bookingTime}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Reference Number</p>
                  <p className="font-mono text-lg font-bold tracking-widest">#{booking.id.toString().padStart(6, '0')}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="flex-1 rounded-none h-12" asChild>
                  <Link href="/">Return Home</Link>
                </Button>
                <Button variant="outline" className="flex-1 rounded-none h-12" asChild>
                  <Link href="/catalogue">View Catalogue</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}