import { Router } from "express";

const router = Router();

router.post("/login", async (req, res): Promise<void> => {
  const { password } = req.body as { password?: string };
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  (req.session as { isAdmin?: boolean }).isAdmin = true;
  res.json({ authenticated: true });
});

router.post("/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json({ authenticated: false });
  });
});

router.get("/me", async (req, res): Promise<void> => {
  const isAdmin = (req.session as { isAdmin?: boolean }).isAdmin === true;
  res.json({ authenticated: isAdmin });
});

export default router;
