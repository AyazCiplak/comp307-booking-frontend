import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";

// Public pages
import Landing from "./pages/public/Landing.tsx";
import Register from "./pages/auth/Register.tsx";
import Login from "./pages/auth/Login.tsx";

// Authenticated layout (wraps all private pages with the Navbar)
import AuthLayout from "./pages/shared/AuthLayout.tsx";

// Shared authenticated pages (users + owners)
import Dashboard from "./pages/shared/Dashboard.tsx";
import BrowseOwners from "./pages/shared/BrowseOwners.tsx";
import OwnerAppointments from "./pages/shared/OwnerAppointments.tsx";
import RequestAppointment from "./pages/shared/RequestAppointment.tsx";
import GroupBooking from "./pages/shared/GroupBooking.tsx";

// Owner-only pages
import CreateSlot from "./pages/shared/owner/CreateSlot.tsx";

// Temporary component showcase — remove before final submission
import Temp from "./pages/public/temp/Temp.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes — no navbar */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/login" element={<Login />} />

          {/* Authenticated routes — Navbar rendered automatically via AuthLayout */}
          <Route element={<AuthLayout />}>
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Browse & booking flow */}
            <Route path="/browse" element={<BrowseOwners />} />
            <Route path="/browse/:ownerUsername" element={<OwnerAppointments />} />
            <Route path="/browse/:ownerUsername/request" element={<RequestAppointment />} />

            {/* Group meeting invite links (Type 2) */}
            <Route path="/invite/:sequenceId" element={<GroupBooking />} />

            {/* Owner-only pages */}
            <Route path="/owner/create-slot" element={<CreateSlot />} />
          </Route>

          {/* Temporary component showcase — remove before final submission */}
          <Route path="/public/temp" element={<Temp />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
