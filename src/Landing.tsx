import logo from "../public/logo.png";
import { Link } from "react-router-dom";
import "./Landing.css";

function Landing() {
  return (
    <div className="container">
      <main className="card">
        {/* title and logo */}
        <div className="header">
          <h1 className="title">
            Book
            <br />
            SoCS
          </h1>
          <div className="illustration">
            <img src={logo} alt="BookSoCS Logo" className="logo" />
          </div>
        </div>

        {/* description */}
        <p className="description">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis blandit
          est eu maximus porttitor. Morbi convallis blandit velit a faucibus.
          Sed turpis libero, pellentesque quis interdum eu, eleifend eget arcu.
          Nunc diam leo, gravida vel finibus ac, porta vel libero. Cras porta
          cursus felis, ut iaculis eros placerat eu. Donec non tempus est.
          Nullam in aliquet ipsum. Donec porttitor tellus nisl, non posuere est
          elementum vitae.
        </p>

        {/* action buttons */}
        <div className="button-group">
          <Link to="/auth/login" className="btn">
            Log In
          </Link>
          <Link to="/auth/register" className="btn">
            Register
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Landing;
