import { useState } from "react";
import type { FormEvent } from "react";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";

const ALLOWED_EMAIL_DOMAINS = ["mcgill.ca", "mail.mcgill.ca"];

function isInstitutionalEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const [localPart, domainPart] = normalizedEmail.split("@");
  const localPartValid = /^[a-z0-9._%+-]+$/.test(localPart ?? "");
  const mcgillDomain = ALLOWED_EMAIL_DOMAINS.includes(domainPart ?? "");

  return localPartValid && mcgillDomain;
}

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showValidationError, setShowValidationError] = useState(false);
  const [invalidEmailError, setInvalidEmailError] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const hasEmptyField = Object.values(formData).some(
      (value) => value.trim() === "",
    );

    if (hasEmptyField) {
      setShowValidationError(true);
      setInvalidEmailError(false);
      return;
    }

    if (!isInstitutionalEmail(formData.email)) {
      setInvalidEmailError(true);
      setShowValidationError(false);
      return;
    }

    setShowValidationError(false);
    setInvalidEmailError(false);

    // include auth API call HERE

    navigate("/public/dashboard");
  }

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
          <form className="register-form" onSubmit={handleSubmit}>
            <h2 className="register-form-title">Register</h2>

            {showValidationError && (
              <div className="register-error-banner" role="alert">
                Error: Please fill out all fields before registering.
              </div>
            )}

            {invalidEmailError && (
              <div className="register-error-banner" role="alert">
                Error: Please use your McGill Email.
              </div>
            )}

            <div className="register-row">
              <input
                type="text"
                placeholder="First Name"
                className="register-half-width"
                value={formData.firstName}
                onChange={(event) => {
                  setFormData((prev) => ({
                    ...prev,
                    firstName: event.target.value,
                  }));
                  if (showValidationError) {
                    setShowValidationError(false);
                  }
                }}
              />
              <input
                type="text"
                placeholder="Last Name"
                className="register-half-width"
                value={formData.lastName}
                onChange={(event) => {
                  setFormData((prev) => ({
                    ...prev,
                    lastName: event.target.value,
                  }));
                  if (showValidationError) {
                    setShowValidationError(false);
                  }
                }}
              />
            </div>
            <input
              type="email"
              placeholder="McGill Email"
              className="register-full-width"
              value={formData.email}
              onChange={(event) => {
                setFormData((prev) => ({
                  ...prev,
                  email: event.target.value,
                }));
                if (showValidationError) {
                  setShowValidationError(false);
                }
                if (invalidEmailError) {
                  setInvalidEmailError(false);
                }
              }}
            />
            <input
              type="password"
              placeholder="Password"
              className="register-full-width"
              value={formData.password}
              onChange={(event) => {
                setFormData((prev) => ({
                  ...prev,
                  password: event.target.value,
                }));
                if (showValidationError) {
                  setShowValidationError(false);
                }
              }}
            />

            <Link to="/auth/login" className="already-have-account">
              Already have an account? Log in
            </Link>

            <button type="submit" className="register-submit-btn">
              Register
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Register;
