import { useMemo, useState } from "react";
import "./TreasureGame.css";

const SIZE = 10;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function keyOf(r, c) {
  return `${r},${c}`;
}

function randInt(max) {
  return Math.floor(Math.random() * max);
}

function distance(aR, aC, bR, bC) {
  const dr = aR - bR;
  const dc = aC - bC;
  return Math.sqrt(dr * dr + dc * dc);
}

function hintByDistance(d) {
  if (d === 0) return "КЛАД НАЙДЕН!";
  if (d <= 1.5) return "ОЧЕНЬ горячо";
  if (d <= 3) return "Горячо";
  if (d <= 5) return "Тепло";
  if (d <= 7) return "Холодно";
  return "Очень холодно";
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

export default function TreasureGame() {
  const [treasure, setTreasure] = useState({
    r: randInt(SIZE),
    c: randInt(SIZE),
  });

  const [opened, setOpened] = useState(new Set());
  const [attempts, setAttempts] = useState(0);
  const [lastClick, setLastClick] = useState(null);
  const [found, setFound] = useState(false);

  const hint = useMemo(() => {
    if (!lastClick) return null;
    return hintByDistance(
      distance(lastClick.r, lastClick.c, treasure.r, treasure.c)
    );
  }, [lastClick, treasure]);

  function newGame() {
    setTreasure({ r: randInt(SIZE), c: randInt(SIZE) });
    setOpened(new Set());
    setAttempts(0);
    setLastClick(null);
    setFound(false);
  }

  function onCellClick(r, c) {
    if (found) return;

    const k = keyOf(r, c);

    setOpened((prev) => {
      const next = new Set(prev);
      if (!next.has(k)) next.add(k);
      return next;
    });

    setAttempts((prev) => (opened.has(k) ? prev : prev + 1));
    setLastClick({ r, c });

    if (r === treasure.r && c === treasure.c) {
      setFound(true);
    }
  }

  function cellBg(r, c) {
    const k = keyOf(r, c);

    if (!opened.has(k)) return "#9e9437";
    if (found && r === treasure.r && c === treasure.c) return "#16a34a";

    const d = distance(r, c, treasure.r, treasure.c);
    const maxD = Math.sqrt((SIZE - 1) ** 2 + (SIZE - 1) ** 2);
    const t = 1 - clamp(d / maxD, 0, 1);

    const cold = { r: 37, g: 99, b: 235 };
    const hot = { r: 239, g: 68, b: 68 };

    const R = lerp(cold.r, hot.r, t);
    const G = lerp(cold.g, hot.g, t);
    const B = lerp(cold.b, hot.b, t);

    return `rgb(${R}, ${G}, ${B})`;
  }

  return (
    <div className="game">
      <h1 className="game-title">🪙 Найди клад</h1>

      <div className="game-toolbar">
        <button onClick={newGame}>Новая игра</button>
        <div>Попытки: {attempts}</div>
        <div>{hint || "Сделай первый клик"}</div>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
      >
        {Array.from({ length: SIZE * SIZE }).map((_, i) => {
          const r = Math.floor(i / SIZE);
          const c = i % SIZE;
          const isTreasure = r === treasure.r && c === treasure.c;

          return (
            <button
              key={keyOf(r, c)}
              onClick={() => onCellClick(r, c)}
              className={`cell ${found ? "disabled" : "active"}`}
              style={{ background: cellBg(r, c) }}
            >
              {found && isTreasure ? "🔥" : opened.has(keyOf(r, c)) ? "•" : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}
