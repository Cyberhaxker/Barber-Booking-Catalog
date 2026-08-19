import { Router } from "express";
import { db, bookingsTable, stylesTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const [totalBookingsRow] = await db.select({ count: count() }).from(bookingsTable);
  const [pendingRow] = await db
    .select({ count: count() })
    .from(bookingsTable)
    .where(eq(bookingsTable.status, "pending"));
  const [confirmedRow] = await db
    .select({ count: count() })
    .from(bookingsTable)
    .where(eq(bookingsTable.status, "confirmed"));
  const [todayRow] = await db
    .select({ count: count() })
    .from(bookingsTable)
    .where(eq(bookingsTable.bookingDate, today));
  const [totalStylesRow] = await db.select({ count: count() }).from(stylesTable);

  const popularResult = await db
    .select({ styleName: bookingsTable.styleName, cnt: count() })
    .from(bookingsTable)
    .groupBy(bookingsTable.styleName)
    .orderBy(sql`count(*) desc`)
    .limit(1);

  res.json({
    totalBookings: totalBookingsRow.count,
    pendingBookings: pendingRow.count,
    confirmedBookings: confirmedRow.count,
    todayBookings: todayRow.count,
    totalStyles: totalStylesRow.count,
    popularStyle: popularResult[0]?.styleName ?? null,
  });
});

export default router;
