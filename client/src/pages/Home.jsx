import React from "react";
import { SignInButton, useUser } from "@clerk/clerk-react";

const Home = () => {
  const isSignedIn = useUser();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-6">
      <h1 className="text-4xl font-bold text-blue-600">Welcome to Note.ORG</h1>
      <p className="text-gray-600 mt-4 text-lg">
        Upload your handwritten notes, analyze them, and earn points!
      </p>

      {isSignedIn ? (
        <button className="bg-blue-600 text-white px-6 py-3 mt-6 rounded-lg shadow-md hover:bg-blue-700">
          Upload Note
        </button>
      ) : (
        <SignInButton>
          <button className="bg-blue-600 text-white px-6 py-3 mt-6 rounded-lg shadow-md hover:bg-blue-700">
            Get Started
          </button>
        </SignInButton>
      )}
    </div>
  );
};

export default Home;
