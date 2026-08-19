import { Router, type IRouter } from "express";
import healthRouter from "./health";
import stylesRouter from "./styles";
import bookingsRouter from "./bookings";
import summaryRouter from "./summary";
import authRouter from "./auth";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/storage", storageRouter);
router.use("/styles", stylesRouter);
router.use("/bookings", bookingsRouter);
router.use("/summary", summaryRouter);

export default router;
