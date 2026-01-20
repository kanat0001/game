import { useMemo, useState } from "react";

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
    if (!opened.has(k)) return "#1f2937";

    if (found && r === treasure.r && c === treasure.c) return "#16a34a";

    const d = distance(r, c, treasure.r, treasure.c);
    const maxD = Math.sqrt((SIZE - 1) ** 2 + (SIZE - 1) ** 2);
    const t = 1 - clamp(d / maxD, 0, 1);

    const base = 60;
    const add = Math.floor(130 * t);

    return `rgb(${base + add}, ${base + add}, ${base})`;
  }

  return (
    <div style={{ maxWidth: 700, margin: "24px auto", padding: 16 }}>
      <h1>🪙 Найди клад</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <button onClick={newGame}>Новая игра</button>
        <div>Попытки: {attempts}</div>
        <div>{hint || "Сделай первый клик"}</div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
          gap: 6,
        }}
      >
        {Array.from({ length: SIZE * SIZE }).map((_, i) => {
          const r = Math.floor(i / SIZE);
          const c = i % SIZE;
          const isTreasure = r === treasure.r && c === treasure.c;

          return (
            <button
              key={keyOf(r, c)}
              onClick={() => onCellClick(r, c)}
              style={{
                aspectRatio: "1 / 1",
                borderRadius: 8,
                background: cellBg(r, c),
                color: "#111",
                fontSize: 18,
                cursor: found ? "default" : "pointer",
              }}
            >
              {found && isTreasure ? "🔥" : opened.has(keyOf(r, c)) ? "•" : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}
