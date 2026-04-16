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
      </main>
    </div>
  );
}

export default Register;
