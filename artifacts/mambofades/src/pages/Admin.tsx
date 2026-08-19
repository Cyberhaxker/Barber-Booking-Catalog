import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { 
  useListBookings, 
  useListStyles,
  useUpdateBooking,
  useDeleteBooking,
  useCreateStyle,
  useUpdateStyle,
  useDeleteStyle,
  useGetSummary,
  useHealthCheck,
  getListBookingsQueryKey,
  getListStylesQueryKey,
  getGetSummaryQueryKey,
  getHealthCheckQueryKey
} from "@workspace/api-client-react";
import { useUpload } from "@workspace/object-storage-web";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, MoreHorizontal, Edit, Trash2, Plus, Activity, Upload, ImageIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

function getImageSrc(objectPath: string | null | undefined): string | null {
  if (!objectPath) return null;
  if (objectPath.startsWith("http")) return objectPath;
  return `/api/storage${objectPath}`;
}

function StyleImageUploader({ value, onChange }: { value: string | null | undefined; onChange: (path: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { uploadFile, isUploading, progress } = useUpload({
    onError: () => toast({ title: "Upload failed", description: "Could not upload image. Try again.", variant: "destructive" }),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadFile(file);
    if (result) {
      onChange(result.objectPath);
    }
    e.target.value = "";
  };

  const imageSrc = getImageSrc(value);

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div
        className="border border-border relative overflow-hidden bg-muted"
        style={{ height: 160 }}
      >
        {imageSrc ? (
          <img src={imageSrc} alt="Style preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs">No image</span>
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
            <div className="h-1.5 w-32 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">Uploading {progress}%</span>
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full rounded-none"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-3.5 w-3.5 mr-2" />
        {imageSrc ? "Replace Image" : "Upload Image"}
      </Button>
    </div>
  );
}

const styleSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  price: z.coerce.number().positive(),
  durationMinutes: z.coerce.number().positive(),
  category: z.string().min(1),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  async function handleLogout() {
    await logout();
    setLocation("/admin/login");
  }
  
  const { data: bookings, isLoading: loadingBookings } = useListBookings();
  const { data: styles, isLoading: loadingStyles } = useListStyles();
  const { data: summary, isLoading: loadingSummary } = useGetSummary({ query: { queryKey: getGetSummaryQueryKey() } });
  const { data: health } = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey() } });
  
  const updateBooking = useUpdateBooking();
  const deleteBooking = useDeleteBooking();
  const deleteStyle = useDeleteStyle();
  const createStyle = useCreateStyle();
  const updateStyle = useUpdateStyle();

  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [editingStyleId, setEditingStyleId] = useState<number | null>(null);

  const styleForm = useForm<z.infer<typeof styleSchema>>({
    resolver: zodResolver(styleSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 30,
      durationMinutes: 30,
      category: "cuts",
      imageUrl: "",
      isActive: true,
    }
  });

  const handleStatusUpdate = (id: number, status: string) => {
    updateBooking.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Status Updated", description: `Booking is now ${status}` });
        queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
      }
    });
  };

  const handleDeleteBooking = (id: number) => {
    if(confirm("Are you sure you want to delete this booking?")) {
      deleteBooking.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Booking Deleted" });
          queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        }
      });
    }
  };

  const handleDeleteStyle = (id: number) => {
    if(confirm("Are you sure you want to delete this style?")) {
      deleteStyle.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Style Deleted" });
          queryClient.invalidateQueries({ queryKey: getListStylesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        }
      });
    }
  };

  const openNewStyleModal = () => {
    setEditingStyleId(null);
    styleForm.reset({
      name: "", description: "", price: 30, durationMinutes: 30, category: "cuts", imageUrl: "", isActive: true,
    });
    setIsStyleModalOpen(true);
  };

  const openEditStyleModal = (style: any) => {
    setEditingStyleId(style.id);
    styleForm.reset({
      name: style.name,
      description: style.description,
      price: style.price,
      durationMinutes: style.durationMinutes,
      category: style.category,
      imageUrl: style.imageUrl || "",
      isActive: style.isActive,
    });
    setIsStyleModalOpen(true);
  };

  const onStyleSubmit = (values: z.infer<typeof styleSchema>) => {
    if (editingStyleId) {
      updateStyle.mutate({ id: editingStyleId, data: values }, {
        onSuccess: () => {
          toast({ title: "Style Updated" });
          setIsStyleModalOpen(false);
          queryClient.invalidateQueries({ queryKey: getListStylesQueryKey() });
        }
      });
    } else {
      createStyle.mutate({ data: values }, {
        onSuccess: () => {
          toast({ title: "Style Created" });
          setIsStyleModalOpen(false);
          queryClient.invalidateQueries({ queryKey: getListStylesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-serif font-bold text-foreground">Admin Command Center</h1>
            <div className="flex items-center gap-3">
              {health && (
                <Badge variant="outline" className="rounded-none border-green-500/50 text-green-500 bg-green-500/10">
                  <Activity className="h-3 w-3 mr-2" /> Server: {health.status}
                </Badge>
              )}
              <Button
                data-testid="button-admin-logout"
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-border text-muted-foreground hover:text-foreground"
              >
                Sign Out
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background border border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
              <p className="text-3xl font-mono font-bold">{loadingSummary ? "-" : summary?.totalBookings || 0}</p>
            </div>
            <div className="bg-background border border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-3xl font-mono font-bold text-primary">{loadingSummary ? "-" : summary?.pendingBookings || 0}</p>
            </div>
            <div className="bg-background border border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">Today</p>
              <p className="text-3xl font-mono font-bold text-accent">{loadingSummary ? "-" : summary?.todayBookings || 0}</p>
            </div>
            <div className="bg-background border border-border p-4">
              <p className="text-sm text-muted-foreground mb-1">Active Styles</p>
              <p className="text-3xl font-mono font-bold">{loadingSummary ? "-" : summary?.totalStyles || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="mb-8 rounded-none border-b border-border bg-transparent p-0 w-full justify-start h-auto">
            <TabsTrigger 
              value="bookings" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-serif text-lg"
            >
              Bookings
            </TabsTrigger>
            <TabsTrigger 
              value="styles" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-serif text-lg"
            >
              Catalogue
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bookings" className="m-0">
            <div className="bg-card border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingBookings ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : bookings?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No bookings found</TableCell>
                    </TableRow>
                  ) : (
                    bookings?.map((booking) => (
                      <TableRow key={booking.id} className="border-border border-t">
                        <TableCell className="font-mono">#{booking.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{booking.clientName}</div>
                          <div className="text-xs text-muted-foreground">{booking.clientPhone}</div>
                        </TableCell>
                        <TableCell>{booking.styleName}</TableCell>
                        <TableCell>
                          <div>{booking.bookingDate}</div>
                          <div className="text-xs font-mono text-primary">{booking.bookingTime}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`
                            rounded-none font-mono uppercase tracking-wider text-[10px] px-2 py-0.5
                            ${booking.status === 'pending' ? 'bg-primary/20 text-primary border-primary/50' : ''}
                            ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-500 border-green-500/50' : ''}
                            ${booking.status === 'cancelled' ? 'bg-destructive/20 text-destructive border-destructive/50' : ''}
                            ${booking.status === 'completed' ? 'bg-muted text-muted-foreground border-border' : ''}
                          `}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 rounded-none">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-none border-border">
                              <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, 'confirmed')} className="cursor-pointer">
                                <Check className="mr-2 h-4 w-4 text-green-500" /> Confirm
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, 'completed')} className="cursor-pointer">
                                <Check className="mr-2 h-4 w-4" /> Mark Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, 'cancelled')} className="cursor-pointer text-destructive">
                                <X className="mr-2 h-4 w-4" /> Cancel
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteBooking(booking.id)} className="cursor-pointer text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="styles" className="m-0">
            <div className="flex justify-end mb-4">
              <Dialog open={isStyleModalOpen} onOpenChange={setIsStyleModalOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-none" onClick={openNewStyleModal}>
                    <Plus className="mr-2 h-4 w-4" /> Add Style
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-none border-border sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="font-serif">{editingStyleId ? 'Edit Style' : 'New Style'}</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...styleForm}>
                    <form onSubmit={styleForm.handleSubmit(onStyleSubmit)} className="space-y-4 pt-4">
                      <FormField
                        control={styleForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Style Name</FormLabel>
                            <FormControl><Input className="rounded-none" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={styleForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Textarea className="rounded-none" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={styleForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price ($)</FormLabel>
                              <FormControl><Input type="number" className="rounded-none" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={styleForm.control}
                          name="durationMinutes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (mins)</FormLabel>
                              <FormControl><Input type="number" className="rounded-none" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={styleForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-none">
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-none">
                                <SelectItem value="fades">Fades</SelectItem>
                                <SelectItem value="cuts">Cuts</SelectItem>
                                <SelectItem value="designs">Designs</SelectItem>
                                <SelectItem value="beard">Beard</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={styleForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Style Image (Optional)</FormLabel>
                            <FormControl>
                              <StyleImageUploader
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full rounded-none" disabled={createStyle.isPending || updateStyle.isPending}>
                        {createStyle.isPending || updateStyle.isPending ? "Saving..." : "Save Style"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingStyles ? (
                <div className="col-span-full text-center py-12">Loading styles...</div>
              ) : styles?.map(style => {
                const imgSrc = style.imageUrl
                  ? style.imageUrl.startsWith("http") ? style.imageUrl : `/api/storage${style.imageUrl}`
                  : null;
                return (
                  <div key={style.id} className="bg-card border border-border flex flex-col overflow-hidden">
                    <div className="relative h-40 bg-muted overflow-hidden">
                      {imgSrc ? (
                        <img src={imgSrc} alt={style.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                      <button
                        onClick={() => openEditStyleModal(style)}
                        className="absolute inset-0 flex items-center justify-center bg-background/0 hover:bg-background/50 transition-colors group"
                        title="Edit style"
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border px-3 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                          <Upload className="h-3 w-3" /> Change Image
                        </span>
                      </button>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-serif font-bold text-lg">{style.name}</h3>
                          <Badge variant="outline" className="rounded-none uppercase text-[10px] mt-1">{style.category}</Badge>
                        </div>
                        <span className="font-mono text-primary font-bold">${style.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">{style.description}</p>
                      <div className="flex justify-between items-center pt-3 border-t border-border/50">
                        <span className="text-xs font-mono text-muted-foreground">{style.durationMinutes}m</span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-none" onClick={() => openEditStyleModal(style)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-none text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleDeleteStyle(style.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}