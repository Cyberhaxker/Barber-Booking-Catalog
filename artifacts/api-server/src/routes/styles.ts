import { Router } from "express";
import { db, stylesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateStyleBody,
  UpdateStyleParams,
  UpdateStyleBody,
  DeleteStyleParams,
  GetStyleParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const styles = await db.select().from(stylesTable).orderBy(stylesTable.createdAt);
  const mapped = styles.map((s) => ({
    ...s,
    price: Number(s.price),
    createdAt: s.createdAt.toISOString(),
  }));
  res.json(mapped);
});

router.post("/", async (req, res) => {
  const parsed = CreateStyleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, description, price, durationMinutes, imageUrl, category, isActive } = parsed.data;
  const [style] = await db
    .insert(stylesTable)
    .values({
      name,
      description,
      price: String(price),
      durationMinutes,
      imageUrl: imageUrl ?? null,
      category,
      isActive: isActive ?? true,
    })
    .returning();
  res.status(201).json({ ...style, price: Number(style.price), createdAt: style.createdAt.toISOString() });
});

router.get("/:id", async (req, res) => {
  const parsed = GetStyleParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [style] = await db.select().from(stylesTable).where(eq(stylesTable.id, parsed.data.id));
  if (!style) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ...style, price: Number(style.price), createdAt: style.createdAt.toISOString() });
});

router.patch("/:id", async (req, res) => {
  const paramsParsed = UpdateStyleParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateStyleBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }
  const updates: Record<string, unknown> = {};
  const b = bodyParsed.data;
  if (b.name !== undefined) updates.name = b.name;
  if (b.description !== undefined) updates.description = b.description;
  if (b.price !== undefined) updates.price = String(b.price);
  if (b.durationMinutes !== undefined) updates.durationMinutes = b.durationMinutes;
  if (b.imageUrl !== undefined) updates.imageUrl = b.imageUrl;
  if (b.category !== undefined) updates.category = b.category;
  if (b.isActive !== undefined) updates.isActive = b.isActive;

  const [style] = await db
    .update(stylesTable)
    .set(updates)
    .where(eq(stylesTable.id, paramsParsed.data.id))
    .returning();
  if (!style) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ...style, price: Number(style.price), createdAt: style.createdAt.toISOString() });
});

router.delete("/:id", async (req, res) => {
  const parsed = DeleteStyleParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(stylesTable).where(eq(stylesTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
