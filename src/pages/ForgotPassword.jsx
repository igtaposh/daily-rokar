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
import { LuLoaderCircle } from "react-icons/lu";
import axiosInstance from "../api/axiosInstance";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [secondsUntilResend, setSecondsUntilResend] = useState(60);
  const [loading, setLoading] = useState(false);
  const [userForm, setUserForm] = useState({
    email: "",
    otp: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });
  const [formError, setFormError] = useState({});

  useEffect(() => {
    if (step !== "verify" || secondsUntilResend === 0) return undefined;

    const timeoutId = window.setTimeout(() => {
      setSecondsUntilResend((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [secondsUntilResend, step]);

  const countdownText = `${String(Math.floor(secondsUntilResend / 60)).padStart(2, "0")}:${String(secondsUntilResend % 60).padStart(2, "0")}`;

  const stepTitle = {
    email: "Reset your password",
    verify: "Verify your email",
    password: "Choose a new password",
    complete: "Reset flow complete",
  }[step];

  const validateForm = () => {
    const errors = {};

    if (step === "email") {
      const email = userForm.email.trim();

      if (!email) {
        errors.email = "Email address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Enter a valid email address";
      }
    }

    if (step === "verify") {
      const otp = userForm.otp?.trim().replace(/\D/g, "").slice(0, 6);
      if (!otp) {
        errors.otp = "OTP is required";
      } else if (otp.length !== 6) {
        errors.otp = "Please enter a valid 6-digit OTP";
      }
    }

    if (step === "password") {
      if (!userForm.newPassword?.trim()) {
        errors.newPassword = "Please enter a password";
      } else if (userForm.newPassword.length < 8) {
        errors.newPassword = "Password must be at least 8 characters long";
      }

      if (!userForm.confirmPassword?.trim()) {
        errors.confirmPassword = "Please confirm your password";
      } else if (userForm.newPassword !== userForm.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setUserForm((prev) => ({ ...prev, [name]: value }));

    if (formError[name]) {
      setFormError((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSentOtp = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post("/user/sent-otp", {
        email: userForm.email,
      });

      if (res?.status === 200) {
        setMessage({
          type: "success",
          text: "An 6 digit code has been sent to your email.",
        });

        setTimeout(() => {
          setStep("verify");
        }, 750);
      }
    } catch (err) {
      console.log(err);
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message || "Otp sent failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validateForm()) {
      return;
    }
    setLoading(true);

    try {
      const res = await axiosInstance.post("/user/verify-otp", {
        email: userForm.email,
        otp: userForm.otp,
      });

      if (res?.status === 200) {
        setMessage({
          type: "success",
          text: "OTP verified successfully",
        });

        setTimeout(() => {
          setStep("password");
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
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validateForm()) {
      return;
    }
    setLoading(true);

    try {
      const res = await axiosInstance.patch("/user/update-password", {
        email: userForm.email,
        password: userForm.confirmPassword,
      });

      if (res?.status === 200) {
        setMessage({
          type: "success",
          text: "Password changed.",
        });

        setTimeout(() => {
          setStep("complete");
        }, 750);
      }
    } catch (err) {
      console.log(err);
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Changing password failed. Please try again.",
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
        email: userForm.email,
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
    <main className="min-h-screen bg-[#edf3ef] p-0 text-[#18392f] font-[Manrope,sans-serif] md:p-6">
      <section className="auth-shell mx-auto grid min-h-screen w-full max-w-310 overflow-hidden bg-white md:min-h-[min(860px,calc(100vh-48px))] md:grid-cols-[0.92fr_1.08fr] md:rounded-[22px] md:shadow-[0_24px_80px_rgba(24,55,42,0.12)]">
        <aside className="relative hidden overflow-hidden bg-[#123d31] px-12 py-10 text-white md:flex md:flex-col">
          <Link
            to="/"
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
              Account recovery
            </p>
            <h1 className="font-serif text-[42px] font-semibold leading-[1.12]">
              Back to running your shop.
            </h1>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/70">
              Verify your email address before choosing a new password.
            </p>
            <div className="mt-10 border-t border-white/15">
              <div className="flex items-center gap-3 border-b border-white/15 py-4 text-sm">
                {step == "verify" ||
                step == "password" ||
                step == "complete" ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c2e3a7] text-[#123d31]">
                    <FiCheck size={15} aria-hidden="true" />
                  </span>
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#c2e3a7] text-xs font-bold text-[#c2e3a7]">
                    1
                  </span>
                )}
                <span className="text-white/90">Confirm your email</span>
              </div>
              <div className="flex items-center gap-3 border-b border-white/15 py-4 text-sm">
                {step == "password" || step == "complete" ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c2e3a7] text-[#123d31]">
                    <FiCheck size={15} aria-hidden="true" />
                  </span>
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#c2e3a7] text-xs font-bold text-[#c2e3a7]">
                    2
                  </span>
                )}
                <span className="text-white/90">Verify your email</span>
              </div>
              <div className="flex items-center gap-3 border-b border-white/15 py-4 text-sm">
                {step != "complete" ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#c2e3a7] text-xs font-bold text-[#c2e3a7]">
                    3
                  </span>
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c2e3a7] text-[#123d31]">
                    <FiCheck size={15} aria-hidden="true" />
                  </span>
                )}
                <span className="text-white/90">Set a new password</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/60">
            <FiShield size={14} aria-hidden="true" />
            Account recovery flow
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
              to="/login"
              className="mb-8 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-[#64766d] hover:text-[#176044] focus:outline-none focus:ring-2 focus:ring-[#176044]/30"
            >
              <FiArrowLeft size={16} aria-hidden="true" /> Back to sign in
            </Link>

            <div className="mb-7">
              <p className="mb-3 text-xs font-bold uppercase text-[#397354]">
                Account recovery
              </p>
              <h2 className="font-serif text-3xl font-semibold text-[#18392f] sm:text-[34px]">
                {stepTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#64766d]">
                {step === "email" &&
                  "Enter the email address connected to your account."}
                {step === "verify" &&
                  `Enter the verification code for ${userForm.email}.`}
                {step === "password" && "Your email is verified."}
                {step === "complete" && "Your recovery steps are complete."}
              </p>
            </div>

            {step === "email" && (
              <form onSubmit={handleSentOtp} className="space-y-4">
                <label
                  className="block text-sm font-semibold text-[#29463a]"
                  htmlFor="email"
                >
                  Email Id
                  <input
                    value={userForm.email}
                    onChange={handleInputChange}
                    id="email"
                    name="email"
                    type="text"
                    autoComplete="email"
                    placeholder="Enter your email id"
                    className=" mt-2 h-12 w-full rounded-lg border border-[#d7e1da] bg-white px-3.5 text-sm font-normal text-[#18392f] outline-none transition placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                  />
                  {formError.email && (
                    <span className="mt-1 block text-xs text-red-600">
                      {formError.email}
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
                  disabled={loading}
                  className="cursor-pointer group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#176044] px-4 text-sm font-bold text-white transition hover:bg-[#124d36] focus:outline-none focus:ring-4 focus:ring-[#176044]/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <LuLoaderCircle className="animate-spin text-2xl" />
                  ) : (
                    <>
                      Continue to Verification
                      <FiArrowRight
                        className="transition-transform group-hover:translate-x-1"
                        size={17}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>
              </form>
            )}

            {step === "verify" && (
              <>
                <form onSubmit={handleVerifyOtp} className="mt-4 space-y-4">
                  <label
                    className="block text-sm font-semibold text-[#29463a]"
                    htmlFor="otp"
                  >
                    Email verification code
                    <input
                      value={userForm.otp.replace(/\D/g, "").slice(0, 6)}
                      onChange={handleInputChange}
                      id="otp"
                      name="otp"
                      inputMode="numeric"
                      type="text"
                      autoComplete="one-time-code"
                      maxLength={6}
                      className="mt-2 h-14.5 w-full rounded-lg border border-[#d7e1da] px-4 text-center text-xl font-semibold text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    {formError.otp && (
                      <span className="mt-1 block text-xs text-red-600">
                        {formError.otp}
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
                <div className="mt-5 text-center">
                  <p aria-live="polite" className="text-sm text-[#687970]">
                    {secondsUntilResend > 0
                      ? "You can request another code when the timer ends."
                      : "Didn't receive a code? Request another one."}
                  </p>
                  <button
                    type="button"
                    disabled={secondsUntilResend > 0}
                    onClick={handleResendOtp}
                    aria-label={
                      secondsUntilResend > 0
                        ? `Resend verification code in ${countdownText}`
                        : "Resend verification code"
                    }
                    className="mt-2 inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold text-[#176044] transition hover:bg-[#e4f0e5] disabled:cursor-not-allowed disabled:text-[#98a79e] disabled:hover:bg-transparent"
                  >
                    <FiRefreshCw size={15} aria-hidden="true" />
                    {secondsUntilResend > 0
                      ? `Resend code in ${countdownText}`
                      : "Resend code"}
                  </button>
                </div>
              </>
            )}

            {step === "password" && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <label
                  className="block text-sm font-semibold text-[#29463a]"
                  htmlFor="newPassword"
                >
                  New password
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={userForm.newPassword}
                    onChange={handleInputChange}
                    className="mt-2 h-12 w-full rounded-lg border border-[#d7e1da] px-3.5 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                  />
                  {formError.newPassword && (
                    <span className="mt-1 block text-xs text-red-600">
                      {formError.newPassword}
                    </span>
                  )}
                </label>
                <label
                  className="block text-sm font-semibold text-[#29463a]"
                  htmlFor="confirmPassword"
                >
                  Confirm new password
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={userForm.confirmPassword}
                    onChange={handleInputChange}
                    className="mt-2 h-12 w-full rounded-lg border border-[#d7e1da] px-3.5 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                  />
                  {formError.confirmPassword && (
                    <span className="mt-1 block text-xs text-red-600">
                      {formError.confirmPassword}
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
                <p className="text-xs leading-5 text-[#839188]">
                  Tip: Use password that don't contains your information.
                </p>
                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#176044] px-4 text-sm font-bold text-white transition hover:bg-[#124d36] cursor-pointer"
                >
                  {loading ? (
                    <LuLoaderCircle className="animate-spin text-2xl" />
                  ) : (
                    <>
                      Submit
                      <FiArrowRight
                        className="transition-transform group-hover:translate-x-1"
                        size={17}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>
              </form>
            )}

            {step === "complete" && (
              <div className="py-4 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e4f0e5] text-[#397354]">
                  <FiCheck size={23} aria-hidden="true" />
                </span>
                <p className="mt-4 font-semibold text-[#29463a]">
                  Password changed successfully
                </p>
                <p className="mt-2 text-sm leading-6 text-[#718078]">
                  Your password was changed. Please ensure to not to share with
                  anyone except your own whom you trust a little bit.
                </p>
                <Link
                  to="/login"
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-[#176044] px-5 text-sm font-bold text-white hover:bg-[#124d36]"
                >
                  Return to sign in
                </Link>
              </div>
            )}

            {step !== "complete" && (
              <p className="mt-7 text-center text-sm text-[#687970]">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="font-bold text-[#176044] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;
