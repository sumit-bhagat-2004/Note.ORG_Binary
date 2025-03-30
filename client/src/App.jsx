import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import UploadNotes from "./pages/UploadPage";
import WalletPage from "./pages/WalletPage";
import Notes from "./pages/Notes";
const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<UploadNotes />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/notes" element={<Notes />} />
      </Routes>
    </div>
  );
};

export default App;
