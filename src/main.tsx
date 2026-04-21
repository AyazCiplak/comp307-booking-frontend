import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import Landing from "./pages/public/Landing.tsx";
import Register from "./pages/auth/Register.tsx";
import AuthLayout from "./pages/shared/AuthLayout.tsx";
import Dashboard from "./pages/shared/Dashboard.tsx";
import Temp from "./pages/public/temp/Temp.tsx";
import Login from "./pages/auth/Login.tsx";
import CreateSlot from "./pages/shared/owner/CreateSlot.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      {" "}
      {/* Makes auth state available */}
      <BrowserRouter>
        <Routes>
          {/* Public routes — no navbar */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/login" element={<Login />} />

          {/* Authenticated routes — Navbar rendered automatically via AuthLayout */}
          <Route element={<AuthLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/owner/create-slot" element={<CreateSlot />} />
            {/* Future owner-only pages (e.g. /owner/create-slot) will go here */}
          </Route>

          {/* Temporary component showcase — remove before final submission */}
          <Route path="/public/temp" element={<Temp />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
