import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

const WalletPage = () => {
  const { user, isLoaded } = useUser();
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creditsToAdd, setCreditsToAdd] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchWalletDetails = async () => {
      if (!isLoaded || !user) return;

      try {
        setLoading(true);
        const response = await axios.get("/api/wallet/get-wallet-details");
        setWalletData(response.data);
        setError("");
      } catch (err) {
        setError("Failed to load wallet details. Please try again later.");
        console.error("Error fetching wallet details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletDetails();
  }, [user, isLoaded]);

  const handleAddCredits = async () => {
    if (!isLoaded || !user) return;
    if (creditsToAdd <= 0) {
      setError("Please enter a valid amount of credits.");
      return;
    }

    try {
      setIsProcessing(true);
      setError("");
      setSuccessMessage("");

      const response = await axios.post("/api/wallet/add-credits", {
        amount: creditsToAdd,
      });

      setWalletData(response.data);
      setSuccessMessage(
        `Successfully added ${creditsToAdd} credits to your wallet!`
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (err) {
      setError("Failed to add credits. Please try again later.");
      console.error("Error adding credits:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 text-yellow-700 max-w-md">
          <p>You must be signed in to view your wallet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wallet</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Wallet Card */}
            <div className="col-span-1 md:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-blue-600 p-6 text-white">
                  <h2 className="text-xl font-semibold">Current Balance</h2>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-4xl font-bold">
                      {walletData?.credits || 0}
                    </span>
                    <span className="ml-2 text-xl">credits</span>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200">
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-600">User ID</span>
                    <span className="font-medium">
                      {walletData?.userId || user.id}
                    </span>
                  </div>
                  {walletData?.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wallet Created</span>
                      <span className="font-medium">
                        {formatDate(walletData.createdAt)}
                      </span>
                    </div>
                  )}
                  {walletData?.updatedAt && (
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="font-medium">
                        {formatDate(walletData.updatedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction History Placeholder */}
              <div className="bg-white rounded-lg shadow-md mt-6 p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Recent Transactions
                </h2>
                <div className="text-gray-500 text-center py-8">
                  <p>Transaction history will appear here.</p>
                </div>
              </div>
            </div>

            {/* Add Credits Card */}
            <div className="col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold">Add Credits</h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    Enter the amount of credits you want to add:
                  </p>

                  {/* Credit Input */}
                  <div className="mb-4">
                    <label
                      htmlFor="credits"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Credits
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        name="credits"
                        id="credits"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full p-3 border border-gray-300 rounded-md"
                        placeholder="100"
                        min="1"
                        value={creditsToAdd}
                        onChange={(e) =>
                          setCreditsToAdd(parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                  </div>

                  {/* Success Message */}
                  {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 p-3 mb-4">
                      <p className="text-green-700 text-sm">{successMessage}</p>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 p-3 mb-4">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Purchase Button */}
                  <button
                    onClick={handleAddCredits}
                    disabled={isProcessing || creditsToAdd <= 0}
                    className={`w-full py-3 px-4 rounded-md bg-blue-600 text-white font-medium transition-colors 
                      ${
                        isProcessing || creditsToAdd <= 0
                          ? "opacity-70 cursor-not-allowed"
                          : "hover:bg-blue-700"
                      }`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      `Add ${creditsToAdd} Credits`
                    )}
                  </button>

                  <p className="mt-4 text-xs text-gray-500 text-center">
                    Credits will be added instantly to your account.
                    <br />
                    Payment is processed securely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
