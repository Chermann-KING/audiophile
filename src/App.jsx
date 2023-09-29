import { Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import Headphones from "./pages/headphones/Headphones";
import Speakers from "./pages/speakers/Speakers";
import Earphones from "./pages/earphones/Earphones";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/headphones" element={<Headphones />} />
      <Route path="/speakers" element={<Speakers />} />
      <Route path="/earphones" element={<Earphones />} />
    </Routes>
  );
}

export default App;
