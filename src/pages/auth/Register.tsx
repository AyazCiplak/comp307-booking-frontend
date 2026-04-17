import "./Register.css";

function Register() {
  return (
    <div className="register-page">
      <main className="register-layout">
        {/* title and logo */}
        <div className="register-header">
          <div className="register-illustration">
            <img
              src="/logo.png"
              alt="BookSoCS Logo"
              className="register-logo"
            />
          </div>
          <h1 className="register-title">Book SoCS</h1>
        </div>

        {/* registration form */}
        <section className="register-form-shell">
          <div className="register-form">
            <h2 className="register-form-title">Register</h2>
            <div className="register-row">
              <input
                type="text"
                placeholder="First Name"
                className="register-half-width"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="register-half-width"
              />
            </div>
            <input
              type="email"
              placeholder="McGill Email"
              className="register-full-width"
            />
            <input
              type="password"
              placeholder="Password"
              className="register-full-width"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default Register;
