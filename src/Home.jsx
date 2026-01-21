import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { createOrGetUser } from "./api";
import "./Home.css";

const LS_DEVICE_ID = "deviceId";
const LS_USER = "user";

function getOrCreateDeviceId() {
  let id = localStorage.getItem(LS_DEVICE_ID);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(LS_DEVICE_ID, id);
  }
  return id;
}

export default function Home() {
  const [user, setUser] = useState(null);

  // имя для регистрации
  const [name, setName] = useState("");

  // состояния UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // при старте: если уже есть user в localStorage — сразу показываем игры
  useEffect(() => {
    const saved = localStorage.getItem(LS_USER);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }
  }, []);

  async function handleRegister() {
    const trimmed = name.trim();

    if (trimmed.length < 2) {
      setError("Имя должно быть минимум 2 символа");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const id = getOrCreateDeviceId();
      const u = await createOrGetUser({ id, name: trimmed });

      setUser(u);
      localStorage.setItem(LS_USER, JSON.stringify(u));
    } catch (e) {
      setError(e?.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  }

  function handleResetLocal() {
    // сброс “регистрации” только на этом устройстве
    localStorage.removeItem(LS_USER);
    // deviceId обычно оставляют, но если хочешь “нового пользователя” — раскомментируй:
    // localStorage.removeItem(LS_DEVICE_ID);

    setUser(null);
    setName("");
    setError("");
  }

  // 1) если юзер НЕ зарегистрирован — показываем форму
  if (!user) {
    return (
      <div
        className="wrapper"
        style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}
      >
        <div className="title">
          <h1>Игры для детей</h1>
          <p>Сначала введи имя — и можно играть</p>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Твоё имя"
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ccc",
                width: 260,
              }}
            />

            <button onClick={handleRegister} disabled={loading}>
              {loading ? "..." : "Войти"}
            </button>
          </div>

          {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
        </div>
      </div>
    );
  }

  // 2) если юзер ЕСТЬ — показываем твой Home как был
  return (
    <div
      className="wrapper"
      style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}
    >
      <div className="title">
        <h1>Игры для детей</h1>
        <p>
          Играй, думай и проходи приключения — <b>{user.name}</b>
        </p>

        <div className="games">
          <Link to="/treasure">
            <button>Найди клад</button>
          </Link>

          <Link to="/differences">
            <button>Найди различия</button>
          </Link>

          <Link to="/maze">
            <button>Лабиринт</button>
          </Link>

          <button onClick={handleResetLocal} style={{ marginLeft: 12 }}>
            Сбросить имя
          </button>
        </div>
      </div>

      <div className="wrapper-card">
        <Link to="/treasure" className="cardStyle card1"></Link>

        <Link to="/differences" className="cardStyle card2"></Link>

        <Link to="/maze" className="cardStyle card3"></Link>
      </div>
    </div>
  );
}
