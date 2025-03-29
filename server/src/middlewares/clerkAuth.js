import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";

const clerkAuth = ClerkExpressWithAuth();

export default protect = (req, res, next) => {
  clerkAuth(req, res, () => {
    if (!req.auth.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  });
};
