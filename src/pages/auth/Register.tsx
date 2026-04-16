import "./Register.css";

function Register() {
  return (
    <div className="container">
      <main className="card">
        {/* title and logo */}
        <div className="header">
          <div className="illustration">
            <img src="/logo.png" alt="BookSoCS Logo" className="logo" />
          </div>
          <h1 className="title">Book SoCS</h1>
        </div>

        {/* registration form */}
        <div className="form">
          <div className="row">
            <input
              type="text"
              placeholder="First Name"
              className="half-width"
            />
            <input type="text" placeholder="Last Name" className="half-width" />
          </div>
          <input
            type="email"
            placeholder="McGill Email"
            className="full-width"
          />
          <input
            type="password"
            placeholder="Password"
            className="full-width"
          />
        </div>
      </main>
    </div>
  );
}

export default Register;
