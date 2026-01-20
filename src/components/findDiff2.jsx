import { useMemo, useState } from "react";

/**
 * 1) Положи картинки в /public:
 *    - /left-cat.png
 *    - /right-cat.png
 *
 * 2) Включи "Режим разметки", кликай по отличиям.
 *    Внизу появится готовый массив differences — скопируй его и вставь в INITIAL_DIFFERENCES.
 */

const IMG_LEFT = "left-tigrenok1.png";
const IMG_RIGHT = "/right-tigrenok1.png";

// СЮДА потом вставишь свои реальные точки (которые насобираешь в режиме разметки)
const INITIAL_DIFFERENCES = [

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
  const [differences, setDifferences] = useState(INITIAL_DIFFERENCES);
  const [found, setFound] = useState([]); // индексы найденных отличий
  const [editMode, setEditMode] = useState(true); // разметка/игра
  const [radius, setRadius] = useState(6); // радиус зоны в процентах
  const [lastClick, setLastClick] = useState(null);

  const allFound = differences.length > 0 && found.length === differences.length;

  const exportText = useMemo(() => {
    const pretty = differences
      .map((d) => `  { x: ${d.x}, y: ${d.y}, r: ${d.r} }`)
      .join(",\n");
    return `const differences = [\n${pretty}\n];`;
  }, [differences]);

  function resetGame() {
    setFound([]);
    setLastClick(null);
  }

  function clearAllPoints() {
    setDifferences([]);
    resetGame();
  }

  function removeLastPoint() {
    setDifferences((prev) => prev.slice(0, -1));
    resetGame();
  }

  function onImageClick(e) {
    const { x, y } = getPercentXY(e);
    setLastClick({ x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) });

    if (editMode) {
      // РежИМ РАЗМЕТКИ: добавляем новую точку
      setDifferences((prev) => [
        ...prev,
        { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)), r: radius },
      ]);
      return;
    }

    // РЕЖИМ ИГРЫ: проверяем попадание
    differences.forEach((d, i) => {
      if (found.includes(i)) return;
      const dxy = dist2D(x, y, d.x, d.y);
      if (dxy <= d.r) {
        setFound((prev) => [...prev, i]);
      }
    });
  }

  function Circle({ d, isFound, index }) {
    // В разметке показываем все точки, в игре — только найденные (чтобы не спойлерить)
    const visible = editMode ? true : isFound;
    if (!visible) return null;

    return (
      <div
        title={`#${index} x:${d.x} y:${d.y} r:${d.r}`}
        style={{
          position: "absolute",
          left: `${d.x}%`,
          top: `${d.y}%`,
          width: `${d.r * 2}%`,
          height: `${d.r * 2}%`,
          border: `2px solid ${editMode ? "#ef4444" : "#22c55e"}`,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          boxShadow: "0 0 0 2px rgba(0,0,0,0.1)",
        }}
      />
    );
  }

  return (
    <div style={{ maxWidth: 980, margin: "24px auto", padding: 16 }}>
      <h1 style={{ margin: 0 }}>🧩 Найди различия</h1>
      <p style={{ marginTop: 8, color: "#6b7280" }}>
        {editMode
          ? "Режим разметки: кликай по отличиям — точки добавятся и появится готовый массив."
          : "Режим игры: кликай по отличиям. Круг появится только если попал."}
      </p>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          margin: "12px 0 16px",
        }}
      >
        <button
          onClick={() => {
            setEditMode((v) => !v);
            resetGame();
          }}
          style={btn}
        >
          {editMode ? "Перейти в игру" : "Перейти в разметку"}
        </button>

        <button onClick={resetGame} style={btn}>
          Сбросить найденное
        </button>

        <button onClick={removeLastPoint} style={btn}>
          Удалить последнюю точку
        </button>

        <button onClick={clearAllPoints} style={btn}>
          Очистить точки
        </button>

        <div style={{ marginLeft: 8 }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Радиус:
            <input
              type="range"
              min="3"
              max="12"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
            />
            <b>{radius}</b>
          </label>
        </div>

        <div style={{ marginLeft: "auto", fontWeight: 700 }}>
          {editMode ? (
            <span>
              Точек: {differences.length}
              {lastClick ? (
                <span style={{ marginLeft: 10, fontWeight: 500, color: "#6b7280" }}>
                  последний клик: {lastClick.x}% / {lastClick.y}%
                </span>
              ) : null}
            </span>
          ) : (
            <span>
              Найдено: {found.length} / {differences.length}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        {[{ src: IMG_LEFT, label: "Левая" }, { src: IMG_RIGHT, label: "Правая" }].map(
          (img) => (
            <div key={img.label} style={{ width: "50%" }}>
              <div style={{ marginBottom: 8, color: "#6b7280", fontSize: 13 }}>
                {img.label} картинка
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
                    cursor: "crosshair",
                    userSelect: "none",
                  }}
                  draggable={false}
                />

                {differences.map((d, i) => (
                  <Circle key={i} d={d} isFound={found.includes(i)} index={i} />
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {!editMode && allFound && (
        <h2 style={{ marginTop: 18 }}>🎉 Все отличия найдены!</h2>
      )}

      {editMode && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            Готовый массив differences (скопируй и вставь):
          </div>
          <pre
            style={{
              background: "#0b1020",
              color: "#e5e7eb",
              padding: 12,
              borderRadius: 12,
              overflowX: "auto",
              fontSize: 13,
              lineHeight: 1.4,
            }}
          >
            {exportText}
          </pre>

          <div style={{ color: "#6b7280", marginTop: 8, fontSize: 13 }}>
            Совет: делай радиус 6–9, чтобы игроку было не слишком больно попадать.
          </div>
        </div>
      )}
    </div>
  );
}

const btn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "white",
  cursor: "pointer",
};
