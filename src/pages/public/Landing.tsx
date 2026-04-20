import { Link } from "react-router-dom";

/**
 * Public landing page — the first page all users see.
 * Styled with Tailwind utility classes; no separate CSS file needed.
 * Logo is served from /public/logo.png via Vite's public folder.
 */
function Landing() {
  // Shared Tailwind classes for the two nav link "buttons".
  // We use <Link> here (not the Button component) because these are
  // navigation anchors, not action triggers — semantically different.
  const linkBtnCls =
    "bg-steel-blue text-white inline-flex items-center justify-center " +
    "px-[60px] py-[15px] rounded-lg text-xl min-w-[200px] no-underline " +
    "hover:opacity-90 transition-opacity duration-200";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-8">
      <main className="w-full max-w-[980px] text-center">

        {/* Title + logo */}
        <div className="flex items-center justify-center gap-7 mb-6 max-sm:flex-col max-sm:gap-5">
          <h1 className="text-dark-red text-[5rem] leading-[0.9] m-0 font-extrabold text-left max-sm:text-center max-sm:text-[3.5rem]">
            Book
            <br />
            SoCS
          </h1>
          <div className="illustration">
            <img src="/logo.png" alt="BookSoCS Logo" className="w-80 h-auto" />
          </div>
        </div>

        {/* Description */}
        <p className="text-base leading-relaxed mb-9">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis blandit
          est eu maximus porttitor. Morbi convallis blandit velit a faucibus.
          Sed turpis libero, pellentesque quis interdum eu, eleifend eget arcu.
          Nunc diam leo, gravida vel finibus ac, porta vel libero. Cras porta
          cursus felis, ut iaculis eros placerat eu. Donec non tempus est.
          Nullam in aliquet ipsum. Donec porttitor tellus nisl, non posuere est
          elementum vitae.
        </p>

        {/* Action buttons */}
        <div className="flex gap-[150px] justify-center max-sm:flex-col max-sm:gap-5 max-sm:items-center">
          <Link to="/auth/login" className={linkBtnCls}>
            Log In
          </Link>
          <Link to="/auth/register" className={linkBtnCls}>
            Register
          </Link>
        </div>

      </main>
    </div>
  );
}

export default Landing;
