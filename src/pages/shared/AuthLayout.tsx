import { Outlet } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";

// Default layout integrating navbar into "authenticated"-state pages
function AuthLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet /> {/* ← whatever child page is active renders here */}
      </main>
    </>
  );
}

export default AuthLayout;