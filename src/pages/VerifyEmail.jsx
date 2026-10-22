import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import axiosInstance from "../api/axiosInstance";
import { LuLoaderCircle } from "react-icons/lu";

function VerifyEmail() {
  const [secondsUntilResend, setSecondsUntilResend] = useState(60);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    if (secondsUntilResend === 0) return undefined;

    const timeoutId = window.setTimeout(() => {
      setSecondsUntilResend((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [secondsUntilResend]);

  const countdownText = `${String(Math.floor(secondsUntilResend / 60)).padStart(2, "0")}:${String(secondsUntilResend % 60).padStart(2, "0")}`;

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!otp) {
      setFormError("OTP is required");
    } else if (otp.length !== 6) {
      setFormError("Please enter a valid 6-digit OTP");
    }
    setLoading(true);

    try {
      const res = await axiosInstance.post("/user/verify-otp", {
        email: localStorage.getItem("email"),
        otp,
      });

      if (res?.status === 200) {
        setMessage({
          type: "success",
          text: "OTP verified successfully",
        });
        localStorage.removeItem("email");
        setTimeout(() => {
          navigate("/login");
        }, 750);
      }
    } catch (err) {
      console.log(err);
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Otp verification failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const res = await axiosInstance.post("/user/sent-otp", {
        email: localStorage.getItem("email"),
      });

      if (res?.status === 200) {
        setMessage({
          type: "success",
          text: "An 6 digit code has been sent to your email.",
        });
        setSecondsUntilResend(60);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message || "Otp sent failed. Please try again.",
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#edf3ef] p-0 text-[#18392f] md:p-6 font-[Manrope,sans-serif]">
      <section className="auth-shell mx-auto grid min-h-screen w-full max-w-310 overflow-hidden bg-white md:min-h-[min(860px,calc(100vh-48px))] md:grid-cols-[0.92fr_1.08fr] md:rounded-[22px] md:shadow-[0_24px_80px_rgba(24,55,42,0.12)]">
        <aside className="relative hidden overflow-hidden bg-[#123d31] px-12 py-10 text-white md:flex md:flex-col">
          <Link
            to="/signup"
            className="flex w-fit items-center gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
              <img
                src={logo}
                alt="DailyRokar"
                className="h-9 w-9 object-contain"
              />
            </span>
            <span className="text-lg font-bold">DailyRokar</span>
          </Link>

          <div className="my-auto max-w-sm py-16">
            <p className="mb-4 text-xs font-bold uppercase text-[#b7d6a2]">
              Almost there
            </p>
            <h1 className="font-serif text-[42px] font-semibold leading-[1.12]">
              One quick check, then you’re in.
            </h1>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/70">
              Confirm your email to keep your DailyRokar workspace secure and
              ready to use.
            </p>

            <div className="mt-10 border-t border-white/15">
              <div className="flex items-center gap-3 border-b border-white/15 py-4 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c2e3a7] text-[#123d31]">
                  <FiCheck size={15} aria-hidden="true" />
                </span>
                <span className="text-white/70">Account details</span>
                <span className="ml-auto text-xs font-semibold text-[#c2e3a7]">
                  Done
                </span>
              </div>
              <div className="flex items-center gap-3 py-4 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#c2e3a7] text-xs font-bold text-[#c2e3a7]">
                  2
                </span>
                <span className="text-white">Email verification</span>
                <span className="ml-auto text-xs font-semibold text-[#c2e3a7]">
                  Now
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/60">
            <FiShield size={14} aria-hidden="true" />A quick security check for
            your account
          </div>
          <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-20 -right-8 h-56 w-56 rounded-full border border-white/10" />
        </aside>

        <div className="flex items-center justify-center px-6 py-10 sm:px-10 md:px-12 lg:px-16">
          <div className="w-full max-w-115">
            <div className="mb-10 flex items-center gap-3 md:hidden">
              <img
                src={logo}
                alt="DailyRokar"
                className="h-10 w-10 object-contain"
              />
              <span className="text-lg font-bold">DailyRokar</span>
            </div>

            <Link
              to="/signup"
              className="mb-8 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-[#64766d] hover:text-[#176044] focus:outline-none focus:ring-2 focus:ring-[#176044]/30"
            >
              <FiArrowLeft size={16} aria-hidden="true" />
              Back to details
            </Link>

            <div className="mb-8">
              <p className="mb-3 text-xs font-bold uppercase text-[#397354]">
                Step 2 of 2
              </p>
              <h2 className="font-serif text-3xl font-semibold tracking-normal text-[#18392f] sm:text-[34px]">
                Check your email
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#64766d]">
                Enter the verification code we sent to your inbox.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleVerifyOtp}>
              <label
                className="block text-sm font-semibold text-[#29463a]"
                htmlFor="otp"
              >
                Verification code
                <input
                  value={otp.replace(/\D/g, "").slice(0, 6)}
                  onChange={(e) => setOtp(e.target.value)}
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  className="mt-2 h-14.5 w-full rounded-lg border border-[#d7e1da] bg-white px-4 text-center text-xl font-semibold text-[#18392f] outline-none transition placeholder:text-sm placeholder:font-normal placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                />
                {formError && (
                  <span className="mt-1 block text-xs text-red-600">
                    {formError}
                  </span>
                )}
              </label>
              {message.text && (
                <div
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    message.type === "error"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-green-200 bg-green-50 text-green-700"
                  }`}
                >
                  {message.text}
                </div>
              )}
              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#176044] px-4 text-sm font-bold text-white transition hover:bg-[#124d36] cursor-pointer"
              >
                {loading ? (
                  <LuLoaderCircle className="animate-spin text-2xl" />
                ) : (
                  <>
                    Verify Email
                    <FiArrowRight
                      className="transition-transform group-hover:translate-x-1"
                      size={17}
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p aria-live="polite" className="text-sm text-[#687970]">
                {secondsUntilResend > 0
                  ? "You can request another code when the timer ends."
                  : "Didn't receive a code? Request another one."}
              </p>
              <button
                type="button"
                disabled={secondsUntilResend > 0}
                onClick={handleResendOtp}
                className="mt-2 inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold text-[#176044] transition hover:bg-[#e4f0e5] disabled:cursor-not-allowed disabled:text-[#98a79e] disabled:hover:bg-transparent"
                aria-label={
                  secondsUntilResend > 0
                    ? `Resend verification code in ${countdownText}`
                    : "Resend verification code"
                }
              >
                <FiRefreshCw size={15} aria-hidden="true" />
                {secondsUntilResend > 0
                  ? `Resend code in ${countdownText}`
                  : "Resend code"}
              </button>
            </div>

            <p className="mt-7 text-center text-sm text-[#687970]">
              Need to correct something?{" "}
              <Link
                to="/signup"
                className="font-bold text-[#176044] hover:underline"
              >
                Edit your details
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default VerifyEmail;
