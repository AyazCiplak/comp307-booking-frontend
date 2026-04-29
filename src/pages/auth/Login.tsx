// Programmed by Rhea Talwar and Ayaz Ciplak
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { useState, type FormEvent } from "react";
import { apiLogin } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

const INPUT_CLS =
  "py-[15px] px-4 border-[3px] border-dark-grey rounded-xl text-[1.05rem] " +
  "outline-none bg-transparent placeholder:text-dark-grey " +
  "focus:border-steel-blue transition-colors duration-200 box-border";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });

  const [showValidationError, setShowValidationError] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const queryParams = new URLSearchParams(window.location.search);
  const redirectTo = queryParams.get("redirect") ?? "/dashboard";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Client-side: make sure both fields are filled before hitting the network.
    const hasEmptyField = Object.values(formData).some((v) => v.trim() === "");
    if (hasEmptyField) {
      setShowValidationError(true);
      setApiError(null);
      return;
    }
    setShowValidationError(false);
    setApiError(null);

    setIsLoading(true);
    try {
      // POST /api/account/login -> LoggedInResponse (email, firstName, lastName, owner, accessToken ...)
      const data = await apiLogin(formData.email, formData.password);
      login(data); // stores user + token in AuthContext + localStorage
      sessionStorage.removeItem("postLoginRedirect"); // clear the redirect path after using it once
      navigate(redirectTo, { replace: true }); // navigate to the intended page after login, default to dashboard
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-start px-7 pt-4.5 pb-10 box-border font-[Helvetica,sans-serif]">
      <main className="w-full max-w-310 text-left">
        {/* Header — logo + app name */}
        <div className="flex items-center justify-start gap-4.5">
          <img
            src="/logo.png"
            alt="BookSoCS Logo"
            className="w-47.5 h-auto max-sm:w-30"
          />
          <h1 className="text-dark-red text-[2.5rem] leading-[0.95] m-0 font-extrabold text-left max-sm:text-[2.8rem]">
            Book SoCS
          </h1>
        </div>

        {/* Title */}
        <h1 className="text-[1.8rem] text-dark-red mt-4 max-sm:text-[1.6rem] justify-center align-center flex">
          Log In
        </h1>

        {/* Form shell */}
        <section className="mt-12.5 w-full flex justify-center max-sm:mt-8">
          <form
            className="w-[min(450px,100%)] flex flex-col gap-5"
            onSubmit={handleSubmit}
          >
            <h2 className="sr-only">Log in</h2>

            {/* Case: Client-side validation error */}
            {showValidationError && (
              <div
                className="bg-[#e9b9b6] text-[#3a1f1f] rounded-2xl px-[22px] py-[18px] text-[1.05rem] leading-[1.3]"
                role="alert"
              >
                Error: Please fill out all fields before logging in.
              </div>
            )}

            {/* Case: API / server error (wrong password, account not found, etc.) */}
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
                if (showValidationError) setShowValidationError(false);
                if (apiError) setApiError(null);
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
                if (apiError) setApiError(null);
              }}
            />

            {/* Case: No account yet */}
            <Link
              to={`/auth/register?redirect=${encodeURIComponent(redirectTo)}`}
              className="inline-block mt-3 text-steel-blue no-underline text-[0.95rem] hover:underline"
            >
              Don't have an account? Register here.
            </Link>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="self-center hover:underline max-sm:w-full max-sm:max-w-[280px] max-sm:text-[1.4rem]"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Login;
