import express from "express";
import { requireAuth } from "../middlewares/clerkAuth.js";
import {
  addCredits,
  getWalletDetails,
} from "../controllers/wallet.controller.js";

const router = express.Router();

router.get("/get-wallet-details", requireAuth, getWalletDetails);
router.post("/add-credits", requireAuth, addCredits);

export default router;
