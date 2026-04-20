import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";

// Shared Tailwind class string for all text inputs in this form.
// Defined once here so every <input> stays visually consistent.
const INPUT_CLS =
  "py-[15px] px-4 border-[3px] border-dark-grey rounded-xl text-[1.05rem] " +
  "outline-none bg-transparent placeholder:text-dark-grey " +
  "focus:border-steel-blue transition-colors duration-200 box-border";

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

    // TODO: replace with real auth API call when backend is connected
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-start justify-start px-7 pt-[18px] pb-10 box-border font-[Helvetica,sans-serif]">
      <main className="w-full max-w-[1240px] text-left">

        {/* Header — logo + app name */}
        <div className="flex items-center justify-start gap-[18px]">
          <img src="/logo.png" alt="BookSoCS Logo" className="w-[190px] h-auto max-sm:w-[120px]" />
          <h1 className="text-dark-red text-[2.5rem] leading-[0.95] m-0 font-extrabold text-left max-sm:text-[2.8rem]">
            Book SoCS
          </h1>
        </div>

        {/* Form shell */}
        <section className="mt-[50px] w-full flex justify-center max-sm:mt-8">
          <form
            className="w-[min(450px,100%)] flex flex-col gap-5"
            onSubmit={handleSubmit}
          >
            {/* Visually hidden heading for screen readers */}
            <h2 className="sr-only">Register</h2>

            {/* Error banners */}
            {showValidationError && (
              <div
                className="bg-[#e9b9b6] text-[#3a1f1f] rounded-2xl px-[22px] py-[18px] text-[1.05rem] leading-[1.3]"
                role="alert"
              >
                Error: Please fill out all fields before registering.
              </div>
            )}
            {invalidEmailError && (
              <div
                className="bg-[#e9b9b6] text-[#3a1f1f] rounded-2xl px-[22px] py-[18px] text-[1.05rem] leading-[1.3]"
                role="alert"
              >
                Error: Please use your McGill Email.
              </div>
            )}

            {/* First + Last name row */}
            <div className="flex gap-[15px] max-sm:flex-col max-sm:gap-5">
              <input
                type="text"
                placeholder="First Name"
                className={`${INPUT_CLS} flex-1 min-w-0 max-sm:w-full`}
                value={formData.firstName}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, firstName: e.target.value }));
                  if (showValidationError) setShowValidationError(false);
                }}
              />
              <input
                type="text"
                placeholder="Last Name"
                className={`${INPUT_CLS} flex-1 min-w-0 max-sm:w-full`}
                value={formData.lastName}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }));
                  if (showValidationError) setShowValidationError(false);
                }}
              />
            </div>

            {/* Email */}
            <input
              type="email"
              placeholder="McGill Email"
              className={`${INPUT_CLS} w-full`}
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                if (showValidationError) setShowValidationError(false);
                if (invalidEmailError) setInvalidEmailError(false);
              }}
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              className={`${INPUT_CLS} w-full`}
              value={formData.password}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, password: e.target.value }));
                if (showValidationError) setShowValidationError(false);
              }}
            />

            {/* Already have an account */}
            <Link
              to="/auth/login"
              className="inline-block mt-3 text-steel-blue no-underline text-[0.95rem] hover:underline"
            >
              Already have an account? Log in
            </Link>

            {/* Submit */}
            <Button type="submit" size="xl" className="self-center hover:underline max-sm:w-full max-sm:max-w-[280px] max-sm:text-[1.4rem]">
              Register
            </Button>

          </form>
        </section>

      </main>
    </div>
  );
}

export default Register;
