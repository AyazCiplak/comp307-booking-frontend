import "./Register.css";

function Register() {
  return (
    <div className="container">
      <main className="card">
        {/* title and logo */}
        <div className="header">
          <h1 className="title">Book SoCS</h1>
          <div className="illustration">
            <img src="/logo.png" alt="BookSoCS Logo" className="logo" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;
