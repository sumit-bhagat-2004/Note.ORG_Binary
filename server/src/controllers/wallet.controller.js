import Wallet from "../models/wallet.models.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getWalletDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    return res.status(200).json({
      userId: wallet.userId,
      credits: wallet.credits,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching wallet details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addCredits = async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Wallet Credits" },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:5173/wallet?success=true",
      cancel_url: "http://localhost:5173/wallet?canceled=true",
      metadata: { userId, amount },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment failed" });
  }
};

// Create a payment intent (for client-side confirmation)
export const createPaymentIntent = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid credit amount" });
    }

    // Calculate price
    const unitPrice = 0.1; // $0.10 per credit
    const priceInCents = Math.round(amount * unitPrice * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceInCents,
      currency: "usd",
      metadata: {
        userId: userId,
        creditsAmount: amount.toString(),
      },
    });

    // Send client secret to frontend
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ message: "Error creating payment intent" });
  }
};

// Handle webhook from Stripe for payment confirmation
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const { userId, amount } = event.data.object.metadata;

      const wallet = await Wallet.findOneAndUpdate(
        { userId },
        { $inc: { credits: parseInt(amount) } },
        { new: true, upsert: true }
      );

      console.log("Wallet updated:", wallet);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
