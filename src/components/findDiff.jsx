import { useMemo, useState } from "react";
import "./DifferencesGame.css";

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
  { x: 29.6, y: 37.1, r: 7 },
  { x: 46.2, y: 67.2, r: 7 }
];

const BASE_DIFFERENCES3 = [
  { x: 55.7, y: 27.6, r: 6 },
  { x: 39.3, y: 64.5, r: 6 },
  { x: 51.8, y: 58.4, r: 6 },
  { x: 51.6, y: 44.8, r: 6 },
  { x: 75, y: 60.2, r: 6 },
];

const LEVELS = [
  {
    id: "lvl1",
    title: "Уровень 1",
    leftImg: "/left-cat.png",
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

  function restartLevel() {
    setFound([]);
    setMessage("Кликай по отличиям 🙂");
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

  const nextDisabled = !allFound || isLastLevel;

  return (
    <div className="diff-game">
      {/* Header */}
      <div className="diff-header">
        <h1 className="diff-title">🧩 Найди различия — {level.title}</h1>
        <div className="diff-progress">Найдено: {progressText}</div>
      </div>

      {/* Controls */}
      <div className="diff-controls">
        {LEVELS.map((l, i) => (
          <button
            key={l.id}
            onClick={() => goLevel(i)}
            className={`diff-level-btn ${i === levelIndex ? "active" : ""}`}
          >
            {l.title}
          </button>
        ))}

        <button
          onClick={nextLevel}
          disabled={nextDisabled}
          className={`diff-next-btn ${nextDisabled ? "disabled" : ""}`}
        >
          Следующий уровень →
        </button>

        <div className="diff-message">
          {allFound
            ? isLastLevel
              ? "🎉 Все уровни пройдены!"
              : "🎉 Уровень пройден! Жми «Следующий уровень»"
            : message}
        </div>
      </div>

      {/* Images */}
      <div className="diff-images">
        {[
          { src: level.leftImg, label: "Левая" },
          { src: level.rightImg, label: "Правая" },
        ].map((img) => (
          <div key={img.label} className="diff-col">
            <div className="diff-col-title">
              {level.title} — {img.label}
            </div>

            <div className="diff-image-wrap">
              <img
                src={img.src}
                alt={img.label}
                onClick={onImageClick}
                className={`diff-image ${allFound ? "done" : "playable"}`}
                draggable={false}
              />

              {/* circles: показываем ТОЛЬКО найденные */}
              {found.map((idx) => {
                const d = level.differences[idx];
                return (
                  <div
                    key={`${img.label}-${idx}`}
                    className="diff-circle"
                    style={{
                      left: `${d.x}%`,
                      top: `${d.y}%`,
                      width: `${d.r * 2}%`,
                      height: `${d.r * 2}%`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Оверлей после прохождения уровня */}
      {allFound && (
        <div className="diff-win-overlay">
          <div className="diff-win-modal">
            <div className="diff-win-emoji">🎉✨🧩</div>

            <h2 className="diff-win-title">
              {isLastLevel ? "Ты прошёл все уровни!" : "Уровень пройден!"}
            </h2>

            <p className="diff-win-text">
              {isLastLevel
                ? "Супер! Ты нашёл все отличия во всех картинках 🏆"
                : "Круто! Хочешь перейти дальше или сыграть ещё раз?"}
            </p>

            <div className="diff-win-actions">
              <button className="diff-win-btn diff-win-btn-repeat" onClick={restartLevel}>
                🔁 Ещё раз
              </button>

              <button
                className={`diff-win-btn diff-win-btn-next ${
                  isLastLevel ? "disabled" : ""
                }`}
                onClick={nextLevel}
                disabled={isLastLevel}
              >
                🚀 Дальше
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
