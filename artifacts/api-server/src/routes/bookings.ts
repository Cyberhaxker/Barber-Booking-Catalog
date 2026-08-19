import { Router } from "express";
import { db, bookingsTable, stylesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListBookingsQueryParams,
  CreateBookingBody,
  GetBookingParams,
  UpdateBookingParams,
  UpdateBookingBody,
  DeleteBookingParams,
  GetAvailableSlotsQueryParams,
} from "@workspace/api-zod";
import { sendBookingConfirmation, sendAdminNotification } from "../lib/email";

const router = Router();

const ALL_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

router.get("/available-slots", async (req, res) => {
  const parsed = GetAvailableSlotsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "date query param is required" });
    return;
  }
  const { date } = parsed.data;
  const bookings = await db
    .select({ bookingTime: bookingsTable.bookingTime })
    .from(bookingsTable)
    .where(and(eq(bookingsTable.bookingDate, date), eq(bookingsTable.status, "confirmed")));
  const taken = new Set(bookings.map((b) => b.bookingTime));
  const available = ALL_SLOTS.filter((slot) => !taken.has(slot));
  res.json(available);
});

router.get("/", async (req, res) => {
  const parsed = ListBookingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { date, status } = parsed.data;
  let query = db.select().from(bookingsTable);
  const conditions = [];
  if (date) conditions.push(eq(bookingsTable.bookingDate, date));
  if (status) conditions.push(eq(bookingsTable.status, status));
  const bookings = conditions.length
    ? await query.where(and(...conditions)).orderBy(bookingsTable.bookingDate, bookingsTable.bookingTime)
    : await query.orderBy(bookingsTable.bookingDate, bookingsTable.bookingTime);
  res.json(bookings.map((b) => ({ ...b, createdAt: b.createdAt.toISOString() })));
});

router.post("/", async (req, res) => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { clientName, clientPhone, clientEmail, styleId, bookingDate, bookingTime, notes } = parsed.data;

  const [style] = await db.select().from(stylesTable).where(eq(stylesTable.id, styleId));
  if (!style) {
    res.status(400).json({ error: "Style not found" });
    return;
  }

  const [booking] = await db
    .insert(bookingsTable)
    .values({
      clientName,
      clientPhone,
      clientEmail,
      styleId,
      styleName: style.name,
      bookingDate,
      bookingTime,
      status: "pending",
      notes: notes ?? null,
    })
    .returning();

  const emailData = {
    clientName: booking.clientName,
    clientEmail: booking.clientEmail,
    clientPhone: booking.clientPhone,
    styleName: booking.styleName,
    bookingDate: booking.bookingDate,
    bookingTime: booking.bookingTime,
    bookingId: booking.id,
    notes: booking.notes,
  };
  void sendBookingConfirmation(emailData);
  void sendAdminNotification(emailData);

  res.status(201).json({ ...booking, createdAt: booking.createdAt.toISOString() });
});

router.get("/:id", async (req, res) => {
  const parsed = GetBookingParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, parsed.data.id));
  if (!booking) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ...booking, createdAt: booking.createdAt.toISOString() });
});

router.patch("/:id", async (req, res) => {
  const paramsParsed = UpdateBookingParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateBookingBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }
  const updates: Record<string, unknown> = {};
  const b = bodyParsed.data;
  if (b.status !== undefined) updates.status = b.status;
  if (b.bookingDate !== undefined) updates.bookingDate = b.bookingDate;
  if (b.bookingTime !== undefined) updates.bookingTime = b.bookingTime;
  if (b.notes !== undefined) updates.notes = b.notes;

  const [booking] = await db
    .update(bookingsTable)
    .set(updates)
    .where(eq(bookingsTable.id, paramsParsed.data.id))
    .returning();
  if (!booking) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ...booking, createdAt: booking.createdAt.toISOString() });
});

router.delete("/:id", async (req, res) => {
  const parsed = DeleteBookingParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(bookingsTable).where(eq(bookingsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
