import { Link } from "react-router-dom";
import './Home.css'


export default function Home() {
  return (
    <div className="wrapper" style={{ maxWidth: 1400, margin: "0 auto", padding: 24 } }>

      <div className="title">
        <h1>Игры для детей</h1>
        <p>Играй, думай и проходи приключения</p>

        <div class="games">
          <Link to="/treasure" >
           <button>Найди клад</button>
        </Link>

         <Link to="/differences" >
            <button>Найди различия</button>
        </Link>

        <Link to="/maze" >
            <button>Лабиринт</button>
        </Link>
        
        
        
  </div>

      </div>
      

      <div className="wrapper-card">
        <Link to="/treasure" className="cardStyle card1">
           

        </Link>

        <Link to="/differences" className="cardStyle card2">
          
        </Link>

        <Link to="/maze" className="cardStyle card3">
            
        </Link>
        {/* <Link to="/differences2" className="cardStyle card3">
            DIFF 2
        </Link> */}
      </div>
    </div>
  );
}

