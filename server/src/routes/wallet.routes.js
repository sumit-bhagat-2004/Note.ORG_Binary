import express from "express";
import { requireAuth } from "../middlewares/clerkAuth.js";
import {
  addCredits,
  createPaymentIntent,
  getWalletDetails,
  handleStripeWebhook,
} from "../controllers/wallet.controller.js";

const router = express.Router();

router.get("/get-wallet-details", requireAuth, getWalletDetails);
router.post("/add-credits", requireAuth, addCredits);
router.post("/create-payment-intent", requireAuth, createPaymentIntent);
router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

export default router;
