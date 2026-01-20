import "./App.css";
import Home from "./Home";
import TreasureGame from "./components/foundClad";
import MazeGame from "./components/labirint";
import DifferencesGame from "./components/findDiff";
import DifferencesGame2 from "./components/findDiff2";
import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/treasure" element={<TreasureGame />} />
        <Route path="/differences" element={<DifferencesGame />} />
        <Route path="/maze" element={<MazeGame />} />
        {/* <Route path="/differences2" element={<DifferencesGame2 />} /> */}
      </Routes>

  );
}
