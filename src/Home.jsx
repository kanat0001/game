import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Игры для детей</h1>
      <p>Выбери игру</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          marginTop: 40,
        }}
      >
        <Link to="/treasure" style={cardStyle}>
          Найди клад
        </Link>

        <Link to="/differences" style={cardStyle}>
          Найди различия
        </Link>

        <Link to="/maze" style={cardStyle}>
            Лабиринт
        </Link>
        {/* <Link to="/differences2" style={cardStyle}>
        найди отличие 2
        </Link> */}
      </div>
    </div>
  );
}

const cardStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 160,
  borderRadius: 16,
  background: "#111827",
  color: "white",
  fontSize: 20,
  textDecoration: "none",
};
