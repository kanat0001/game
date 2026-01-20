import { useMemo, useState } from "react";

const BASE_DIFFERENCES = [
  { x: 51.8, y: 36, r: 5 },
  { x: 48.7, y: 24.7, r: 5 },
  { x: 53.7, y: 28.8, r: 5 },
  { x: 64.2, y: 56, r: 5 },
  { x: 79.8, y: 60.4, r: 5 },
  { x: 48.3, y: 70.6, r: 5 },
  { x: 60.9, y: 39.8, r: 5 },
  { x: 47, y: 41.3, r: 5 },
  { x: 46.2, y: 52.8, r: 5 },
];
const BASE_DIFFERENCES2 = [
  { x: 88.5, y: 18.5, r: 7 },
  { x: 73.6, y: 44.4, r: 7 },
  { x: 91, y: 76.6, r: 7 },
  { x: 29.6, y: 37.1, r: 7 }
];
const BASE_DIFFERENCES3 = [
  { x: 55.7, y: 27.6, r: 6 },
  { x: 39.3, y: 64.5, r: 6 },
  { x: 51.8, y: 58.4, r: 6 },
  { x: 51.6, y: 44.8, r: 6 },
  { x: 75, y: 60.2, r: 6 }
];

// 4 уровня с теми же данными (разные названия, картинки те же)
const LEVELS = [
  {
    id: "lvl1",
    title: "Уровень 1",
    leftImg: "/left-cat.png",
    // если файл реально называется "right-cat (2).png" — нужны %20
    rightImg: "/right-cat%20(2).png",
    differences: BASE_DIFFERENCES,
  },
  {
    id: "lvl2",
    title: "Уровень 2",
    leftImg: "/left-boy.png",
    rightImg: "/right-boy.png",
    differences: BASE_DIFFERENCES2,
  },
  {
    id: "lvl3",
    title: "Уровень 3",
    leftImg: "/left-tigrenok1.png",
    rightImg: "/right-tigrenok1.png",
    differences: BASE_DIFFERENCES3,
  },

];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function dist2D(x1, y1, x2, y2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

function getPercentXY(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  return { x: clamp(x, 0, 100), y: clamp(y, 0, 100) };
}

export default function DifferencesGame() {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = LEVELS[levelIndex];

  const [found, setFound] = useState([]);
  const [message, setMessage] = useState("Кликай по отличиям 🙂");

  const allFound =
    level.differences.length > 0 && found.length === level.differences.length;

  const progressText = useMemo(
    () => `${found.length} / ${level.differences.length}`,
    [found.length, level.differences.length]
  );

  const isLastLevel = levelIndex === LEVELS.length - 1;

  function resetLevel() {
    setFound([]);
    setMessage("Кликай по отличиям 🙂");
  }

  function goLevel(nextIndex) {
    setLevelIndex(nextIndex);
    setFound([]);
    setMessage("Кликай по отличиям 🙂");
  }

  function nextLevel() {
    if (!allFound) return;
    if (isLastLevel) return;
    goLevel(levelIndex + 1);
  }

  function onImageClick(e) {
    if (allFound) return;

    const { x, y } = getPercentXY(e);

    let hit = false;

    level.differences.forEach((d, i) => {
      if (found.includes(i)) return;
      if (dist2D(x, y, d.x, d.y) <= d.r) {
        hit = true;
        setFound((prev) => [...prev, i]);
      }
    });

    setMessage(hit ? "Нашёл! ✅" : "Мимо ❌");
  }

  return (
    <div style={{ maxWidth: 980, margin: "24px auto", padding: 16 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>🧩 Найди различия — {level.title}</h1>

        <div style={{ marginLeft: "auto", fontWeight: 700 }}>
          Найдено: {progressText}
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        {/* Кнопки уровней (можешь убрать, если хочешь только next) */}
        {LEVELS.map((l, i) => (
          <button
            key={l.id}
            onClick={() => goLevel(i)}
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              cursor: "pointer",
              background: i === levelIndex ? "#111827" : "white",
              color: i === levelIndex ? "white" : "#111827",
            }}
          >
            {l.title}
          </button>
        ))}

        <button
          onClick={nextLevel}
          disabled={!allFound || isLastLevel}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            cursor: !allFound || isLastLevel ? "not-allowed" : "pointer",
            background: !allFound || isLastLevel ? "#f3f4f6" : "#111827",
            color: !allFound || isLastLevel ? "#9ca3af" : "white",
          }}
        >
          Следующий уровень →
        </button>

        <div style={{ display: "flex", alignItems: "center", color: "#6b7280" }}>
          {allFound
            ? isLastLevel
              ? "🎉 Все уровни пройдены!"
              : "🎉 Уровень пройден! Жми «Следующий уровень»"
            : message}
        </div>
      </div>

      {/* Images */}
      <div style={{ display: "flex", gap: 16 }}>
        {[{ src: level.leftImg, label: "Левая" }, { src: level.rightImg, label: "Правая" }].map(
          (img) => (
            <div key={img.label} style={{ width: "50%" }}>
              <div style={{ marginBottom: 8, color: "#6b7280", fontSize: 13 }}>
                {level.title} — {img.label}
              </div>

              <div style={{ position: "relative", borderRadius: 14, overflow: "hidden" }}>
                <img
                  src={img.src}
                  alt={img.label}
                  onClick={onImageClick}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    cursor: allFound ? "default" : "crosshair",
                    userSelect: "none",
                  }}
                  draggable={false}
                />

                {/* circles: показываем ТОЛЬКО найденные */}
                {found.map((idx) => {
                  const d = level.differences[idx];
                  return (
                    <div
                      key={`${img.label}-${idx}`}
                      style={{
                        position: "absolute",
                        left: `${d.x}%`,
                        top: `${d.y}%`,
                        width: `${d.r * 2}%`,
                        height: `${d.r * 2}%`,
                        border: "2px solid #22c55e",
                        borderRadius: "50%",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                        boxShadow: "0 0 0 2px rgba(0,0,0,0.12)",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )
        )}
      </div>

      <div style={{ marginTop: 14, color: "#6b7280", fontSize: 13 }}>
        Подсказка: лучше, когда обе картинки одного размера и без обрезки.
      </div>
    </div>
  );
}
