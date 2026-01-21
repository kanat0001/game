import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getUsers } from "../api";
import "./leaderBoards.css";

function totalScore(scores) {
  return (scores?.labyrinth ?? 0) + (scores?.treasure ?? 0) + (scores?.find_different ?? 0);
}

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // простая пагинация (т.к. limit max 1000)
  const [limit] = useState(1000);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const list = await getUsers({ skip: 0, limit });
        if (!cancelled) setUsers(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Не удалось загрузить лидеров");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  const rows = useMemo(() => {
    return users
      .map((u) => ({
        id: u.id,
        name: u.name,
        total: totalScore(u.scores),
        scores: u.scores,
      }))
      .sort((a, b) => b.total - a.total);
  }, [users]);

  return (
    <div className="lbWrap">
      <div className="lbTop">
        <h1>Таблица лидеров</h1>
        <Link to="/"><button>Домой</button></Link>
      </div>

      {loading && <p>Загрузка...</p>}
      {error && <p className="lbError">{error}</p>}

      {!loading && !error && (
        <div className="lbTable">
          <div className="lbHead">
            <div>#</div>
            <div>Имя</div>
            <div>Всего</div>
            <div>Лабиринт</div>
            <div>Клад</div>
            <div>Различия</div>
          </div>

          {rows.map((r, idx) => (
            <div className="lbRow" key={r.id}>
              <div>{idx + 1}</div>
              <div className="lbName" title={r.id}>{r.name}</div>
              <div className="lbTotal">{r.total}</div>
              <div>{r.scores?.labyrinth ?? 0}</div>
              <div>{r.scores?.treasure ?? 0}</div>
              <div>{r.scores?.find_different ?? 0}</div>
            </div>
          ))}

          {rows.length === 0 && <p>Пока нет игроков</p>}
        </div>
      )}
    </div>
  );
}
