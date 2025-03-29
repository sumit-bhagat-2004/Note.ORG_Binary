import Wallet from "../models/wallet.models.js";

export const getWalletDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    return res.status(200).json({
      credits: wallet.credits,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
