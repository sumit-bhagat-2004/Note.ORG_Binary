import React from "react";
import { SignInButton, useUser, UserButton } from "@clerk/clerk-react";

const Navbar = () => {
  const { isSignedIn } = useUser();

  return (
    <nav className="bg-blue-600 p-4 flex justify-between items-center shadow-lg">
      <h1 className="text-white text-2xl font-bold">Note.ORG</h1>

      <div className="flex items-center gap-4">
        {isSignedIn ? (
          <>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg shadow-md hover:bg-gray-200">
              Upload Note
            </button>
            <UserButton />
          </>
        ) : (
          <SignInButton>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg shadow-md hover:bg-gray-200">
              Login
            </button>
          </SignInButton>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
