import { useEffect, useState } from "react"; 
// ВСЕ строки ОДИНАКОВОЙ длины (10)
const maze = [
  "####################",
  "#S                 #",
  "### ### ##### ### ##",
  "#     #   #   #    #",
  "# ##### ### ### ####",
  "#   #       #      #",
  "## ### ##### #######",
  "#    #   #   #     #",
  "######## # ### ### #",
  "#      # #   #   # #",
  "# ###### ### ### # #",
  "# #          #   # #",
  "# # ######## # ### #",
  "# #        # #     #",
  "# ######## # #######",
  "#       #  #       #",
  "####### #### ##### #",
  "#            #     #",
  "##############E#####",
];

export default function MazeGame() {
  const [pos, setPos] = useState({ x: 1, y: 1 });
  const [won, setWon] = useState(false);

  const height = maze.length;
  const width = maze[0].length;

  useEffect(() => {
    function onKey(e) {
      if (won) return;

      // НЕ зависит от языка клавиатуры
      const moves = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        KeyW: [0, -1],
        KeyS: [0, 1],
        KeyA: [-1, 0],
        KeyD: [1, 0],
      };

      if (!moves[e.code]) return;

      const [dx, dy] = moves[e.code];
      const nx = pos.x + dx;
      const ny = pos.y + dy;

      // ⛔ ЗАЩИТА ОТ ВЫХОДА ЗА ГРАНИЦЫ
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;

      const cell = maze[ny][nx];
      if (cell === "#") return;

      setPos({ x: nx, y: ny });

      if (cell === "E") {
        setWon(true);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pos, won, width, height]);

  return (
    <div style={{ maxWidth: 420, margin: "24px auto" }}>
      <h1>🧱 Лабиринт</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${width}, 1fr)`,
          gap: 0,
        }}
      >
        {maze.map((row, y) =>
          row.split("").map((cell, x) => {
            const isPlayer = pos.x === x && pos.y === y;

            let bg = "#e5e7eb";
            if (cell === "#") bg = "#22c55e";
            if (cell === "E") bg = "#212ab1";

            return (
              <div
                key={`${x}-${y}`}
                style={{
                  aspectRatio: "1",
                  background: isPlayer ? "#ef4444" : bg,
                }}
              />
            );
          })
        )}
      </div>

      {won && <h2 style={{ marginTop: 16 }}>🎉 Ты вышел из лабиринта!</h2>}
      <p>Управление: WASD или стрелки</p>
    </div>
  );
}
