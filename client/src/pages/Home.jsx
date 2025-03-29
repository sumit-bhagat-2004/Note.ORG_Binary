import React from "react";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import homeImg from "../assets/homeImg.webp";

const Home = () => {
  const { isSignedIn } = useUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-6">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-5xl font-extrabold text-blue-800 drop-shadow-lg"
      >
        Welcome to Note.ORG
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="text-gray-700 mt-4 text-lg text-center max-w-lg"
      >
        Upload your handwritten notes, analyze them, and earn points!
      </motion.p>

      <motion.img
        src={homeImg}
        alt="Notes Illustration"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="mt-6 rounded-xl shadow-lg w-[500px] h-auto"
      />

      {/* Sign-in Status */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="mt-8 text-xl text-blue-700 font-medium"
      >
        {isSignedIn
          ? "You're signed in!"
          : "Please sign in to upload your notes."}
      </motion.div>
    </div>
  );
};

export default Home;
