import React, { useState } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { useUser } from "@clerk/clerk-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Wallet = () => {
  const [amount, setAmount] = useState("");
  const { user } = useUser();

  const handleAddCredits = async () => {
    if (!amount || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:8000/api/wallet/add-credits",
        {
          userId: user.id,
          amount,
        }
      );

      window.location.href = data.url; // Redirect to Stripe Checkout
    } catch (error) {
      console.error(error);
      alert("Payment failed!");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-800 text-white rounded-lg">
      <h1 className="text-2xl font-bold">Wallet</h1>

      <div className="mt-4">
        <label className="block">Enter Amount (USD)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
        />
      </div>

      <button
        onClick={handleAddCredits}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Add Credits
      </button>
    </div>
  );
};

export default Wallet;
