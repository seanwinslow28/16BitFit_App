import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Pong from "./pages/Pong";
import Game2048 from "./pages/Game2048";
import Snake from "./pages/Snake";
import Minesweeper from "./pages/Minesweeper";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pong" element={<Pong />} />
        <Route path="/2048" element={<Game2048 />} />
        <Route path="/snake" element={<Snake />} />
        <Route path="/minesweeper" element={<Minesweeper />} />
      </Routes>
    </div>
  );
}

export default App;
