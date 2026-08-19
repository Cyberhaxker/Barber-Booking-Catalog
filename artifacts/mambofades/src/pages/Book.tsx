import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { 
  useListStyles, 
  useCreateBooking,
  useGetAvailableSlots,
  getGetAvailableSlotsQueryKey,
  useGetStyle,
  getGetStyleQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  clientName: z.string().min(2, "Name must be at least 2 characters"),
  clientPhone: z.string().min(10, "Valid phone number required"),
  clientEmail: z.string().email("Valid email required"),
  styleId: z.coerce.number().positive("Please select a style"),
  bookingDate: z.string().min(1, "Please select a date"),
  bookingTime: z.string().min(1, "Please select a time"),
  notes: z.string().optional(),
});

export default function Book() {
  const [_, setLocation] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();
  
  const { data: styles } = useListStyles();
  const createBooking = useCreateBooking();

  const searchParams = new URLSearchParams(searchString);
  const preselectedStyleId = searchParams.get("style");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      styleId: preselectedStyleId ? parseInt(preselectedStyleId, 10) : 0,
      bookingDate: format(new Date(), "yyyy-MM-dd"),
      bookingTime: "",
      notes: "",
    },
  });

  const selectedDate = form.watch("bookingDate");
  const { data: availableSlotsResponse, isLoading: loadingSlots } = useGetAvailableSlots(
    { date: selectedDate },
    { query: { enabled: !!selectedDate, queryKey: getGetAvailableSlotsQueryKey({ date: selectedDate }) } }
  );

  const timeSlots = Array.isArray(availableSlotsResponse) ? availableSlotsResponse : 
    (availableSlotsResponse as any)?.slots || 
    ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

  function onSubmit(values: z.infer<typeof formSchema>) {
    createBooking.mutate(
      { data: values },
      {
        onSuccess: (booking) => {
          toast({
            title: "Booking Confirmed",
            description: "Your appointment has been successfully scheduled.",
          });
          setLocation(`/booking/confirmation?id=${booking.id}`);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Booking Failed",
            description: "There was an error scheduling your appointment. Please try again.",
          });
        }
      }
    );
  }

  const activeStyles = styles?.filter(s => s.isActive) || [];
  const selectedStyleId = form.watch("styleId");
  
  const { data: freshStyle } = useGetStyle(selectedStyleId, {
    query: {
      enabled: !!selectedStyleId,
      queryKey: getGetStyleQueryKey(selectedStyleId)
    }
  });

  const selectedStyle = freshStyle || activeStyles.find(s => s.id === selectedStyleId);

  return (
    <div className="min-h-screen bg-background py-12 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Book Your Chair</h1>
          <p className="text-muted-foreground text-lg">
            Secure your spot. Premium grooming tailored to your schedule.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-12">
          {/* Form Side */}
          <div className="md:col-span-3 bg-card border border-border p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-4">
                  <h3 className="text-xl font-serif font-bold border-b border-border pb-2">Service Selection</h3>
                  
                  <FormField
                    control={form.control}
                    name="styleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Style</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value ? field.value.toString() : ""}
                        >
                          <FormControl>
                            <SelectTrigger className="rounded-none border-border bg-background focus:ring-primary">
                              <SelectValue placeholder="Choose a haircut or service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-none border-border">
                            {activeStyles.map((style) => (
                              <SelectItem key={style.id} value={style.id.toString()}>
                                {style.name} - ${style.price} ({style.durationMinutes}m)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bookingDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              min={format(new Date(), "yyyy-MM-dd")}
                              className="rounded-none border-border focus-visible:ring-primary" 
                              {...field} 
                              onChange={(e) => {
                                field.onChange(e);
                                form.setValue("bookingTime", ""); // Reset time when date changes
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bookingTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Slot</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-none border-border focus:ring-primary" disabled={loadingSlots}>
                                <SelectValue placeholder={loadingSlots ? "Loading..." : "Select time"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-none border-border">
                              {timeSlots.map((time: string) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                              {timeSlots.length === 0 && !loadingSlots && (
                                <div className="p-2 text-sm text-muted-foreground text-center">No slots available</div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <h3 className="text-xl font-serif font-bold border-b border-border pb-2">Your Details</h3>
                  
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" className="rounded-none border-border focus-visible:ring-primary" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clientPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 000-0000" className="rounded-none border-border focus-visible:ring-primary" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clientEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" className="rounded-none border-border focus-visible:ring-primary" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requests (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any specific instructions for your barber..." 
                            className="rounded-none border-border min-h-[100px] focus-visible:ring-primary" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full rounded-none h-14 text-lg mt-6" 
                  disabled={createBooking.isPending}
                >
                  {createBooking.isPending ? "Confirming..." : "Confirm Booking"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Summary Side */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card border border-border p-6 sticky top-24">
              <h3 className="text-xl font-serif font-bold border-b border-border pb-4 mb-4">Summary</h3>
              
              {selectedStyle ? (
                <div className="space-y-4">
                  <div className="aspect-video relative overflow-hidden bg-muted mb-4">
                    <img 
                      src={selectedStyle.imageUrl || "/images/fade.png"} 
                      alt={selectedStyle.name}
                      className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{selectedStyle.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedStyle.category}</p>
                  </div>
                  <div className="flex justify-between items-center py-3 border-y border-border/50">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-mono">{selectedStyle.durationMinutes} mins</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-mono text-primary font-bold">${selectedStyle.price}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Please select a style to view summary details.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}