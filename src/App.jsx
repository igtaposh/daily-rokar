import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import "./App.css";
import LandingPage from "./pages/LandingPage.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import TermsAndConditions from "./pages/TermsAndConditions.jsx";
import UnauthorizedPage from "./pages/UnauthorizedPage.jsx";
import { AuthContext } from "./context/AuthContext.jsx";

export default function App() {
  const { user, token } = useContext(AuthContext);
  const isAuthenticated = Boolean(user && token);
  const userName = user?.name?.trim() || "a user";
  const whatsappMessage = `Hello DailyRokar, I'm ${userName}, I just want to know something`;
  const whatsappUrl = `https://wa.me/919593197988?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Navigate to="/unauthorized" replace />
            )
          }
        />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Get help on WhatsApp"
        title="Get help on WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(18,61,49,0.25)] transition hover:scale-105 hover:bg-[#1fb958] focus:outline-none focus:ring-4 focus:ring-[#25D366]/30 sm:bottom-7 sm:right-7"
      >
        <FiMessageCircle size={26} aria-hidden="true" />
      </a>
    </>
  );
}
