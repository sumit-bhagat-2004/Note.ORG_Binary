import React from "react";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import homeImg from "../assets/homeImg.webp";

const Home = () => {
  const { isSignedIn } = useUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#a1c4fd] to-[#c2e9fb] p-6">
      {/* Animated Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white/30 backdrop-blur-md shadow-xl rounded-3xl p-8 max-w-3xl text-center"
      >
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-extrabold text-blue-900 drop-shadow-lg"
        >
          Welcome to Note.ORG 📖
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-gray-800 mt-4 text-lg md:text-xl font-medium"
        >
          Upload your handwritten notes, analyze them, and earn points!
        </motion.p>

        {/* Image Animation */}
        <motion.img
          src={homeImg}
          alt="Notes Illustration"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-6 rounded-xl shadow-lg w-[90%] max-w-[450px] mx-auto"
        />

        {/* Sign-in Status */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-8 text-lg md:text-xl text-blue-800 font-semibold"
        >
          {isSignedIn ? (
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg shadow-sm">
              ✅ You're signed in!
            </span>
          ) : (
            <span className="bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-sm">
              ❌ Please sign in to upload your notes.
            </span>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
