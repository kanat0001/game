import { useEffect, useMemo, useState } from "react";
import "./MazeGame.css";
import { HiArrowSmDown, HiArrowSmLeft, HiArrowSmRight, HiArrowSmUp } from "react-icons/hi";
import { Link } from "react-router-dom";
import { updateGameScore } from "../api";

// ✅ УРОВНИ
const levels = [
  {
    name: "Уровень 1",
    maze: [
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
    ],
  },
  {
    name: "Уровень 2",
    maze: [
      "####################",
      "#S                 #",
      "# ### ##### ### ####",
      "#   #   # #   #    #",
      "### # ### # ### ####",
      "#   # #   #   #    #",
      "# ### # ##### #### #",
      "#     #     #      #",
      "### ### ### ###### #",
      "#   #     #      # #",
      "# # ##### ###### # #",
      "# #     #      # # #",
      "# ##### ###### # # #",
      "#     #      # #   #",
      "####### #### # #####",
      "#       #    #     #",
      "# ##### ######### ##",
      "#     # #         E#",
      "####################",
    ],
  },
  {
    name: "Уровень 3",
    maze: [
      "####################",
      "#S        #        #",
      "# ####### # ###### #",
      "# #     # #      # #",
      "# # ### # #####  # #",
      "# # #   #     #### #",
      "# # # ####### #   ##",
      "#   # # #   # #    #",
      "##### # # # # ######",
      "#     #   # #      #",
      "### ### # # ###### #",
      "#   #   # #      # #",
      "# # # ### ###### # #",
      "# # #   #      #   #",
      "# # ### ###### #####",
      "# #     #    #     #",
      "# ####### ## # #####",
      "#            #    E#",
      "####################",
    ],
  },
  {
    name: "Уровень 4",
    maze: [
      "####################",
      "#S            #    #",
      "### ### ####### ## #",
      "#     #       #    #",
      "# ##### ##### # ####",
      "#     #   #   #    #",
      "# ### ### # ### ####",
      "# # #     #   #    #",
      "# # ####### ### ####",
      "# #       #   #    #",
      "# ####### # ### ## #",
      "#       # #     #  #",
      "####### # ##### # ##",
      "#     # #   #   #  #",
      "# ### # ### # ### ##",
      "# #   #   # #   #  #",
      "# # ##### # ### # ##",
      "# #       #     #E #",
      "####################",
    ],
  },
  {
    name: "Уровень 5",
    maze: [
      "####################",
      "#S  #      #       #",
      "# ### ### # ### ####",
      "#   #   # #   #    #",
      "### ### # ### ######",
      "#     # #   #      #",
      "##### # ### ###### #",
      "#   # #   #      # #",
      "# # # ### ###### # #",
      "# # #   #      # # #",
      "# # ### ###### # # #",
      "# #   #      # #   #",
      "# ### # ###### ### #",
      "#   # #        #   #",
      "### # ########## ###",
      "#   #            # #",
      "# ####### ###### # #",
      "#         #       E#",
      "####################",
    ],
  },
  {
    name: "Уровень 6",
    maze: [
      "####################",
      "#S #      #       ##",
      "# ### ####### ###  #",
      "#   #       #   #  #",
      "### # ##### # # ####",
      "#   # #   # # #    #",
      "# ### # # # # #### #",
      "#     # # # #    # #",
      "##### # # # #### # #",
      "#     # # #    # # #",
      "# ####### #### # # #",
      "#       #    # #   #",
      "####### #### # ### #",
      "#     #      #     #",
      "# ### ########### ##",
      "#   #         #    #",
      "# ####### ### # ####",
      "#         #   #   E#",
      "####################",
    ],
  },
];

const LS_USER = "user";

function findStart(maze) {
  for (let y = 0; y < maze.length; y++) {
    const x = maze[y].indexOf("S");
    if (x !== -1) return { x, y };
  }
  return { x: 1, y: 1 };
}

function getUserFromLS() {
  const raw = localStorage.getItem(LS_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function MazeGame() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [won, setWon] = useState(false);

  // очки и статусы сохранения
  const [points, setPoints] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // при входе в игру — читаем очки из localStorage
  useEffect(() => {
    const u = getUserFromLS();
    const current = u?.scores?.labyrinth ?? 0;
    setPoints(current);
  }, []);

  const maze = levels[levelIndex].maze;
  const startPos = useMemo(() => findStart(maze), [maze]);
  const [pos, setPos] = useState(startPos);

  const height = maze.length;
  const width = maze[0].length;

  // при смене уровня — сброс
  useEffect(() => {
    setPos(startPos);
    setWon(false);
    setSaveError("");
    setSaving(false);
  }, [startPos]);

  function restartLevel() {
    setPos(startPos);
    setWon(false);
    setSaveError("");
  }

  function prevLevel() {
    setLevelIndex((i) => Math.max(0, i - 1));
  }

  function nextLevel() {
    setLevelIndex((i) => Math.min(levels.length - 1, i + 1));
  }

  async function awardPointForLevel() {
    const u = getUserFromLS();
    if (!u) return;

    const current = u?.scores?.labyrinth ?? 0;
    const next = current + 1;

    // ✅ сразу обновим UI и localStorage (оптимистично)
    setPoints(next);
    const updatedLocalUser = {
      ...u,
      scores: { ...u.scores, labyrinth: next },
    };
    localStorage.setItem(LS_USER, JSON.stringify(updatedLocalUser));

    setSaving(true);
    setSaveError("");

    try {
      const updatedFromServer = await updateGameScore({
        userId: u.id,
        gameName: "labyrinth",
        score: next,
      });

      // что вернул сервер — сохраняем
      localStorage.setItem(LS_USER, JSON.stringify(updatedFromServer));

      // и на всякий случай синхронизируем points с ответом сервера
      const serverPoints = updatedFromServer?.scores?.labyrinth ?? next;
      setPoints(serverPoints);
    } catch (e) {
      setSaveError(e?.message || "Не удалось сохранить очко");
    } finally {
      setSaving(false);
    }
  }

  // ✅ Единая функция движения (клавиатура + кнопки)
  function move(dx, dy) {
    if (won) return;

    const nx = pos.x + dx;
    const ny = pos.y + dy;

    if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;

    const cell = maze[ny][nx];
    if (cell === "#") return;

    setPos({ x: nx, y: ny });

    if (cell === "E") {
      setWon(true);
      if (navigator.vibrate) navigator.vibrate(120);

      // ✅ +1 очко за прохождение уровня
      awardPointForLevel();
    }
  }

  // клавиатура
  useEffect(() => {
    function onKey(e) {
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
      move(dx, dy);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pos, won, maze, width, height]);

  return (
    <div className="maze-game">
      <h1 className="maze-title">Лабиринт</h1>

      <div>
        <Link to="/">
          <button style={{ marginBottom: 20 }}>Домой</button>
        </Link>
      </div>

      <div className="level-panel">
        <button onClick={prevLevel} disabled={levelIndex === 0}>
          <HiArrowSmLeft color="white" size={20} />
        </button>

        <div className="level-name">
          {levels[levelIndex].name} ({levelIndex + 1}/{levels.length})
          <div style={{ marginTop: 6, fontSize: 14, opacity: 0.9 }}>
            Очки: <b>{points}</b>
          </div>
        </div>

        <button onClick={nextLevel} disabled={levelIndex === levels.length - 1}>
          <HiArrowSmRight color="white" size={20} />
        </button>

        <button onClick={restartLevel}>начать заново</button>
      </div>

      <div
        className="maze-grid"
        style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}
      >
        {maze.map((row, y) =>
          row.split("").map((cell, x) => {
            const isPlayer = pos.x === x && pos.y === y;

            let className = "maze-cell";
            if (cell === "#") className += " maze-wall";
            if (cell === "E") className += " maze-exit";
            if (isPlayer) className += " maze-player";

            return <div key={`${x}-${y}`} className={className} />;
          })
        )}
      </div>

      <div className="mobile-controls">
        <div className="cell1" />
        <button className="cell1 btn" onClick={() => move(0, -1)}>
          <HiArrowSmUp color="white" />
        </button>
        <div className="cell1" />

        <button className="cell1 btn" onClick={() => move(-1, 0)}>
          <HiArrowSmLeft color="white" />
        </button>
        <div className="cell1 center-space" />
        <button className="cell1 btn" onClick={() => move(1, 0)}>
          <HiArrowSmRight color="white" />
        </button>

        <div className="cell1" />
        <button className="cell1 btn" onClick={() => move(0, 1)}>
          <HiArrowSmDown color="white" />
        </button>
        <div className="cell1" />
      </div>

      {won && (
        <div className="win-overlay">
          <div className="win-modal">
            <h2>🎉 Уровень пройден!</h2>
            <p>Молодец! Хочешь продолжить?</p>

            {saving && <p>Сохраняю очко...</p>}
            {saveError && <p style={{ color: "red" }}>{saveError}</p>}

            <div className="win-actions">
              <button onClick={restartLevel}>🔁 Повторить</button>
              <button onClick={nextLevel} disabled={levelIndex === levels.length - 1}>
                ➡️ Следующий
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
