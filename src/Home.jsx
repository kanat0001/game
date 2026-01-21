import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { GiTrophyCup } from "react-icons/gi";
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

function calcTotal(scores) {
  if (!scores) return 0;
  return (scores.labyrinth ?? 0) + (scores.treasure ?? 0) + (scores.find_different ?? 0);
}

export default function Home() {
  const [user, setUser] = useState(null);

  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LS_USER);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setIsProfileOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const totalPoints = useMemo(() => calcTotal(user?.scores), [user]);

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
    localStorage.removeItem(LS_USER);

    setUser(null);
    setName("");
    setError("");
    setIsProfileOpen(false);
  }

  // 1) если юзер НЕ зарегистрирован — показываем форму
  if (!user) {
    return (
      <div className="wrapper" style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
        <div className="title">
          <h1>Игры для детей</h1>
          <p>Сначала введи имя — и можно играть</p>

          <div  className="input" style={{ display: "flex", gap: 12, alignItems: "center",}}>
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

  // 2) если юзер ЕСТЬ — показываем игры + кнопку профиля
  return (
    <div className="wrapper" style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
      <div className="home-topbar">
        <button className="profileBtn" onClick={() => setIsProfileOpen(true)}>
          Профиль
        </button>
      </div>

      <div className="title">
        <h1>Игры для детей</h1>
        <p>
          Играй, думай и проходи приключения — <b>{user.name}</b>
        </p>

        <div className="games">
          <Link  to="/treasure">
            <button className="games-button">Найди клад</button>
          </Link>

          <Link to="/differences">
            <button className="games-button" > Найди различия</button>
          </Link>

          <Link to="/maze">
            <button className="games-button" > Лабиринт</button>
          </Link>

          <Link to="/leaderboard">
            <button><GiTrophyCup color="white" className="icon"  /></button>
          </Link>
        </div>
      </div>

      <div className="wrapper-card">
        <Link to="/treasure" className="cardStyle card1"></Link>
        <Link to="/differences" className="cardStyle card2"></Link>
        <Link to="/maze" className="cardStyle card3"></Link>
      </div>

      <div
        className={`profileOverlay ${isProfileOpen ? "open" : ""}`}
        onClick={() => setIsProfileOpen(false)}
      />

      <aside className={`profileDrawer ${isProfileOpen ? "open" : ""}`} aria-hidden={!isProfileOpen}>
        <div className="profileHeader">
          <h3>Профиль</h3>
          <button className="profileClose" onClick={() => setIsProfileOpen(false)} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <div className="profileBody">
          <div className="profileCard">
            <div className="profileLabel">Имя</div>
            <div className="profileValue">{user.name}</div>
          </div>

          <div className="profileCard">
            <div className="profileLabel">Очки (всего)</div>
            <div className="profileValue">{totalPoints}</div>
          </div>

          <div className="profileCard">
            <div className="profileLabel">По играм</div>
            <div className="profileScores">
              <div className="scoreRow">
                <span>Лабиринт</span>
                <b>{user.scores?.labyrinth ?? 0}</b>
              </div>
              <div className="scoreRow">
                <span>Клад</span>
                <b>{user.scores?.treasure ?? 0}</b>
              </div>
              <div className="scoreRow">
                <span>Различия</span>
                <b>{user.scores?.find_different ?? 0}</b>
              </div>
            </div>
          </div>
          <Link to="/leaderboard">
            <button><GiTrophyCup color="white" className="icon"  /></button>
          </Link>

          <button className="resetBtn" onClick={handleResetLocal}>
            Сбросить имя
          </button>

        </div>
      </aside>
    </div>
  );
}
