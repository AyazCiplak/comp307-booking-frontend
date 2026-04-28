// Programmed by Rhea Talwar — wired to real API by Ayaz Ciplak
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { apiRegister } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

// Shared Tailwind class string for all text inputs in this form.
const INPUT_CLS =
  "py-[15px] px-4 border-[3px] border-dark-grey rounded-xl text-[1.05rem] " +
  "outline-none bg-transparent placeholder:text-dark-grey " +
  "focus:border-steel-blue transition-colors duration-200 box-border";

// Same as INPUT_CLS but for <select> elements.
const SELECT_CLS = INPUT_CLS + " cursor-pointer";

const ALLOWED_EMAIL_DOMAINS = ["mcgill.ca", "mail.mcgill.ca"];

function isInstitutionalEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const [localPart, domainPart] = normalizedEmail.split("@");
  const localPartValid = /^[a-z0-9._%+-]+$/.test(localPart ?? "");
  const mcgillDomain = ALLOWED_EMAIL_DOMAINS.includes(domainPart ?? "");
  return localPartValid && mcgillDomain;
}

const DEPARTMENTS = [
  "School of Computer Science",
  "Department of Mathematics and Statistics",
  "Department of Physics",
  "Department of Chemistry",
  "Department of Biology",
  "Department of Economics",
  "Faculty of Engineering",
  "Faculty of Arts",
  "Faculty of Law",
  "Faculty of Medicine and Health Sciences",
  "Other",
] as const;

const TITLES = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Teaching Assistant",
  "Lecturer",
  "Other",
] as const;

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Owner-only fields (shown when email domain is @mcgill.ca)
  const [department, setDepartment] = useState("");
  const [customDepartment, setCustomDepartment] = useState("");
  const [title, setTitle] = useState("");
  const [customTitle, setCustomTitle] = useState("");

  const [showValidationError, setShowValidationError] = useState(false);
  const [invalidEmailError, setInvalidEmailError] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // True when the typed email is an owner email (@mcgill.ca, not @mail.mcgill.ca)
  const emailDomain = formData.email.split("@")[1]?.toLowerCase() ?? "";
  const isOwnerEmail = emailDomain === "mcgill.ca";

  function clearErrors() {
    setShowValidationError(false);
    setInvalidEmailError(false);
    setApiError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Check core fields
    const hasEmptyCore = Object.values(formData).some((v) => v.trim() === "");

    // Check owner-specific fields only when relevant
    const hasEmptyOwnerField = isOwnerEmail && (
      !department ||
      (department === "Other" && !customDepartment.trim()) ||
      !title ||
      (title === "Other" && !customTitle.trim())
    );

    if (hasEmptyCore || hasEmptyOwnerField) {
      setShowValidationError(true);
      setInvalidEmailError(false);
      setApiError(null);
      return;
    }

    if (!isInstitutionalEmail(formData.email)) {
      setInvalidEmailError(true);
      setShowValidationError(false);
      setApiError(null);
      return;
    }

    clearErrors();

    // Resolve final dept / title values (handle the "Other" free-text case)
    const finalDept = isOwnerEmail ? (department === "Other" ? customDepartment.trim() : department) : "";
    const finalTitle = isOwnerEmail ? (title === "Other" ? customTitle.trim() : title) : "";

    setIsLoading(true);
    try {
      // POST /api/account/register -> LoggedInResponse (includes accessToken)
      // Note: firstName / lastName are derived server-side from the email address.
      const data = await apiRegister(formData.email, formData.password, finalDept, finalTitle);
      login(data); // stores user + token in AuthContext + localStorage
      navigate("/dashboard");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-start px-7 pt-[18px] pb-10 box-border font-[Helvetica,sans-serif]">
      <main className="w-full max-w-[1240px] text-left">
        {/* Header — logo + app name */}
        <div className="flex items-center justify-start gap-[18px]">
          <img
            src="/logo.png"
            alt="BookSoCS Logo"
            className="w-[190px] h-auto max-sm:w-[120px]"
          />
          <h1 className="text-dark-red text-[2.5rem] leading-[0.95] m-0 font-extrabold text-left max-sm:text-[2.8rem]">
            Book SoCS
          </h1>
        </div>

        {/* Title */}
        <h1 className="text-[1.8rem] text-dark-red mt-4 max-sm:text-[1.6rem] justify-center align-center flex">
          Make an account
        </h1>

        {/* Form shell */}
        <section className="mt-[50px] w-full flex justify-center max-sm:mt-8">
          <form
            className="w-[min(450px,100%)] flex flex-col gap-5"
            onSubmit={handleSubmit}
          >
            <h2 className="sr-only">Register</h2>

            {/* Case: Client-side: empty fields */}
            {showValidationError && (
              <div
                className="bg-[#e9b9b6] text-[#3a1f1f] rounded-2xl px-[22px] py-[18px] text-[1.05rem] leading-[1.3]"
                role="alert"
              >
                Error: Please fill out all fields before registering.
              </div>
            )}
            {/* Case: Client-side: bad email domain */}
            {invalidEmailError && (
              <div
                className="bg-[#e9b9b6] text-[#3a1f1f] rounded-2xl px-[22px] py-[18px] text-[1.05rem] leading-[1.3]"
                role="alert"
              >
                Error: Please use your McGill Email.
              </div>
            )}
            {/* Case: API / server error (email taken, etc.) */}
            {apiError && (
              <div
                className="bg-[#e9b9b6] text-[#3a1f1f] rounded-2xl px-[22px] py-[18px] text-[1.05rem] leading-[1.3]"
                role="alert"
              >
                {apiError}
              </div>
            )}

            {/* Email */}
            <input
              type="email"
              placeholder="McGill Email"
              className={`${INPUT_CLS} w-full`}
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                clearErrors();
                // Reset owner fields if the user switches away from @mcgill.ca
                if (e.target.value.split("@")[1]?.toLowerCase() !== "mcgill.ca") {
                  setDepartment("");
                  setCustomDepartment("");
                  setTitle("");
                  setCustomTitle("");
                }
              }}
            />

            {/* ── Owner-only fields (revealed when @mcgill.ca email is typed) ── */}
            {isOwnerEmail && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-dark-grey text-[0.9rem] font-semibold pl-1">
                    Department
                  </label>
                  <select
                    className={`${SELECT_CLS} w-full`}
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      setCustomDepartment("");
                      clearErrors();
                    }}
                  >
                    <option value="" disabled>Select your department…</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>

                  {department === "Other" && (
                    <input
                      type="text"
                      placeholder="Enter your department"
                      className={`${INPUT_CLS} w-full mt-2`}
                      value={customDepartment}
                      onChange={(e) => {
                        setCustomDepartment(e.target.value);
                        clearErrors();
                      }}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-dark-grey text-[0.9rem] font-semibold pl-1">
                    Title
                  </label>
                  <select
                    className={`${SELECT_CLS} w-full`}
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setCustomTitle("");
                      clearErrors();
                    }}
                  >
                    <option value="" disabled>Select your title…</option>
                    {TITLES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  {title === "Other" && (
                    <input
                      type="text"
                      placeholder="Enter your title"
                      className={`${INPUT_CLS} w-full mt-2`}
                      value={customTitle}
                      onChange={(e) => {
                        setCustomTitle(e.target.value);
                        clearErrors();
                      }}
                    />
                  )}
                </div>
              </>
            )}

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              className={`${INPUT_CLS} w-full`}
              value={formData.password}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, password: e.target.value }));
                clearErrors();
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
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="self-center hover:underline max-sm:w-full max-sm:max-w-[280px] max-sm:text-[1.4rem]"
            >
              {isLoading ? "Creating account…" : "Register"}
            </Button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Register;
