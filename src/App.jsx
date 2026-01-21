import "./App.css";
import Home from "./Home";
import TreasureGame from "./components/foundClad";
import MazeGame from "./components/labirint";
import DifferencesGame from "./components/findDiff";
import { Routes, Route } from "react-router-dom";
import Leaderboard from "./components/leaderBoards";


export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/treasure" element={<TreasureGame />} />
        <Route path="/differences" element={<DifferencesGame />} />
        <Route path="/maze" element={<MazeGame />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

      </Routes>

  );
}
