import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";

export const requireAuth = ClerkExpressWithAuth((req, res, next) => {
  if (!req.auth?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.userId = req.auth.userId;
  next();
});
