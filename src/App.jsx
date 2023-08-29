import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import Headphones from "./pages/headphones/Headphones";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/headphones" element={<Headphones />} />
    </Routes>
  );
}

export default App;
