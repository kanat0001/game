import { useEffect, useMemo, useState } from "react";
import "./TreasureGame.css";
import { Link } from "react-router-dom";
import { GiOpenTreasureChest, GiCrossMark } from "react-icons/gi";
import { awardPoint } from "../score";

const SIZE = 10;
const MAX_ATTEMPTS = 15;

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
  const [lost, setLost] = useState(false);

  // очки и статусы сохранения
  const [points, setPoints] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // при входе в игру — читаем очки из localStorage
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    setPoints(u?.scores?.treasure ?? 0);
  }, []);

  // как ты просил — оставляем won (для оверлея)
  const won = found;

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
    setLost(false);

    // сбрасываем статусы сохранения (очки НЕ трогаем)
    setSaving(false);
    setSaveError("");
  }

  // названия как в твоём оверлее
  function restartLevel() {
    newGame();
  }

  // Уровней пока нет — просто новая игра (оставляем для совместимости)
  function nextLevel() {
    newGame();
  }
  const levelIndex = 0;
  const levels = [0];

  function onCellClick(r, c) {
    if (found || lost) return;

    const k = keyOf(r, c);

    // Если клетка уже открыта — не считаем попытку
    if (opened.has(k)) {
      setLastClick({ r, c });
      return;
    }

    // Открываем клетку
    setOpened((prev) => {
      const next = new Set(prev);
      next.add(k);
      return next;
    });

    // Считаем попытку (только если клик по новой клетке)
    setAttempts((prev) => {
      const nextAttempts = prev + 1;

      // Если это не клад, и попытки закончились — проигрыш
      const isTreasureNow = r === treasure.r && c === treasure.c;
      if (!isTreasureNow && nextAttempts >= MAX_ATTEMPTS) {
        setLost(true);
      }

      return nextAttempts;
    });

    setLastClick({ r, c });

    // Победа
    if (r === treasure.r && c === treasure.c) {
      setFound(true);
      setLost(false);

      // +1 очко за победу (treasure)
      awardPoint("treasure", {
        onLocalUpdate: (_, next) => setPoints(next),
        onSavingChange: setSaving,
        onError: setSaveError,
      });
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

  const blocked = found || lost;

  return (
    <div className="game">
      <h1 className="game-title">🪙 Найди клад</h1>

      <div>
        <Link to="/">
          <button style={{ marginBottom: 20 }}>Домой</button>
        </Link>
      </div>

      <div className="game-toolbar">
        <button onClick={newGame}>Новая игра</button>

        <div>
          Попытки: {attempts}/{MAX_ATTEMPTS}
        </div>

        <div>
          Очки: <b>{points}</b>
        </div>

        <div>{lost ? "Попытки закончились 😢" : hint || "Сделай первый клик"}</div>
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
              className={`cell ${blocked ? "disabled" : "active"}`}
              style={{ background: cellBg(r, c) }}
            >
              {found && isTreasure ? (
                <GiOpenTreasureChest size={22} />
              ) : opened.has(keyOf(r, c)) ? (
                <GiCrossMark size={22} color="white" />
              ) : (
                ""
              )}
            </button>
          );
        })}
      </div>

      {/* Сообщение о прохождении уровня (оверлей) */}
      {won && (
        <div className="win-overlay">
          <div className="win-modal">
            <h2>🎉 Уровень пройден!</h2>
            <p>Молодец! Хочешь сыграть еще раз?</p>

            {saving && <p>Сохраняю очко...</p>}
            {saveError && <p style={{ color: "red" }}>{saveError}</p>}

            <div className="win-actions">
              <button onClick={restartLevel}>Повторить</button>
            </div>
          </div>
        </div>
      )}

      {/* Сообщение о проигрыше (оверлей) */}
      {lost && (
        <div className="lose-overlay">
          <div className="lose-modal">
            <h2>😢 Ты проиграл</h2>
            <p>Попытки закончились. Сыграем ещё раз?</p>

            <div className="lose-actions">
              <button onClick={newGame}> Играть заново</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
