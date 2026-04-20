import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import Landing from "./Landing.tsx";
import Register from "./pages/auth/Register.tsx";
import Dashboard from "./pages/public/dashboard/Dashboard.tsx";
import Temp from "./pages/public/temp/Temp.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/public/dashboard" element={<Dashboard />} />
        
        {/* Temporary page, to illustrate reusable components. */}
        <Route path="/public/temp" element={<Temp />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
