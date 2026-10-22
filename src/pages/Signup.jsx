import { FiArrowRight, FiCheck, FiShield } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

import logo from "../assets/logo.svg";
import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { LuLoaderCircle } from "react-icons/lu";

function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userForm, setUserForm] = useState({
    email: "",
    shopName: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });
  const [formError, setFormError] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!userForm.name) {
      errors.name = "Name is required";
    } else if (
      userForm.name.trim().length < 3 ||
      userForm.name.trim().length > 20
    ) {
      errors.name = "Name must be between 3 and 20 characters long";
    }
    if (!userForm.shopName) {
      errors.shopName = "Shop name is required";
    } else if (
      userForm.shopName.trim().length < 3 ||
      userForm.shopName.trim().length > 30
    ) {
      errors.shopName = "Shop name must be between 3 and 30 characters long";
    }

    const email = userForm.email.trim();
    if (!email) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter a valid email address";
    }

    if (!userForm.password.trim()) {
      errors.password = "Please enter a password";
    } else if (userForm.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    if (!userForm.confirmPassword?.trim()) {
      errors.confirmPassword = "Please confirm your password";
    } else if (userForm.password !== userForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
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
  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post("/user/sign-up", {
        email: userForm.email,
        name: userForm.name,
        shopName: userForm.shopName,
        password: userForm.password,
      });

      if (res?.status === 201) {
        setMessage({
          type: "success",
          text: "Account created successfully. Please verify your email.",
        });

        localStorage.setItem("email", userForm.email);
        await axiosInstance.post("/user/sent-otp", {
          email: userForm.email,
        });
        navigate("/verify-email");
      }
    } catch (err) {
      console.log(err);
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Account creation failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#edf3ef] p-0 text-[#18392f] md:p-6 font-[Manrope,sans-serif]">
      <section className="auth-shell mx-auto grid min-h-screen w-full max-w-310 overflow-hidden bg-white md:min-h-[min(860px,calc(100vh-48px))] md:grid-cols-[0.92fr_1.08fr] md:rounded-[22px] md:shadow-[0_24px_80px_rgba(24,55,42,0.12)]">
        <aside className="relative hidden overflow-hidden bg-[#123d31] px-12 py-10 text-white md:flex md:flex-col">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
              <img
                src={logo}
                alt="DailyRokar"
                className="h-9 w-9 object-contain"
              />
            </span>
            <span className="text-lg font-bold">DailyRokar</span>
          </div>

          <div className="my-auto max-w-sm py-16">
            <p className="mb-4 text-xs font-bold uppercase text-[#b7d6a2]">
              A clearer day starts here
            </p>
            <h1 className="font-serif text-[42px] font-semibold leading-[1.12]">
              Your shop’s books, in good order.
            </h1>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/70">
              Keep daily sales, expenses, and balances together from the very
              first entry.
            </p>

            <div className="mt-10 border-t border-white/15">
              <div className="flex items-center gap-3 border-b border-white/15 py-4 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#c2e3a7] text-xs font-bold text-[#c2e3a7]">
                  1
                </span>
                <span className="text-white/70">Account details</span>
                <span className="ml-auto text-xs font-semibold text-[#c2e3a7]">
                  Now
                </span>
              </div>
              <div className="flex items-center gap-3 py-4 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#c2e3a7] text-xs font-bold text-[#c2e3a7]">
                  2
                </span>
                <span className="text-white">Email verification</span>
                <span className="ml-auto text-xs font-semibold text-[#c2e3a7]">
                  Pending
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/60">
            <FiShield size={14} aria-hidden="true" />
            Your business details stay private
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

            <div className="mb-8">
              <p className="mb-3 text-xs font-bold uppercase text-[#397354]">
                Create your workspace
              </p>
              <h2 className="font-serif text-3xl font-semibold tracking-normal text-[#18392f] sm:text-[34px]">
                Start with the basics
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#64766d]">
                Set up your shop account in a few quick steps.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSignup}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label
                  className="block text-sm font-semibold text-[#29463a]"
                  htmlFor="shopName"
                >
                  Shop name
                  <input
                    id="shopName"
                    name="shopName"
                    value={userForm.shopName}
                    onChange={handleInputChange}
                    type="text"
                    autoComplete="organization"
                    placeholder="e.g. Green Market"
                    className="mt-2 h-12 w-full rounded-lg border border-[#d7e1da] bg-white px-3.5 text-sm font-normal text-[#18392f] outline-none transition placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                  />
                  {formError.shopName && (
                    <span className="mt-1 block text-xs text-red-600">
                      {formError.shopName}
                    </span>
                  )}
                </label>
                <label
                  className="block text-sm font-semibold text-[#29463a]"
                  htmlFor="fullName"
                >
                  Your name
                  <input
                    id="name"
                    name="name"
                    value={userForm.name}
                    onChange={handleInputChange}
                    type="text"
                    autoComplete="name"
                    placeholder="Full name"
                    className="mt-2 h-12 w-full rounded-lg border border-[#d7e1da] bg-white px-3.5 text-sm font-normal text-[#18392f] outline-none transition placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                  />
                  {formError.name && (
                    <span className="mt-1 block text-xs text-red-600">
                      {formError.name}
                    </span>
                  )}
                </label>
              </div>

              <label
                className="block text-sm font-semibold text-[#29463a]"
                htmlFor="email"
              >
                Email address
                <input
                  value={userForm.email}
                  onChange={handleInputChange}
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="mt-2 h-12 w-full rounded-lg border border-[#d7e1da] bg-white px-3.5 text-sm font-normal text-[#18392f] outline-none transition placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                />
                {formError.email && (
                  <span className="mt-1 block text-xs text-red-600">
                    {formError.email}
                  </span>
                )}
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label
                  className="block text-sm font-semibold text-[#29463a]"
                  htmlFor="signupPassword"
                >
                  Password
                  <input
                    id="password"
                    name="password"
                    value={userForm.password}
                    onChange={handleInputChange}
                    type="password"
                    autoComplete="new-password"
                    placeholder="Create a password"
                    className="mt-2 h-12 w-full rounded-lg border border-[#d7e1da] bg-white px-3.5 text-sm font-normal text-[#18392f] outline-none transition placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                  />
                  {formError.password && (
                    <span className="mt-1 block text-xs text-red-600">
                      {formError.password}
                    </span>
                  )}
                </label>
                <label
                  className="block text-sm font-semibold text-[#29463a]"
                  htmlFor="confirmPassword"
                >
                  Confirm password
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    value={userForm.confirmPassword}
                    onChange={handleInputChange}
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    className="mt-2 h-12 w-full rounded-lg border border-[#d7e1da] bg-white px-3.5 text-sm font-normal text-[#18392f] outline-none transition placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                  />
                  {formError.confirmPassword && (
                    <span className="mt-1 block text-xs text-red-600">
                      {formError.confirmPassword}
                    </span>
                  )}
                </label>
              </div>

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
                Create Account
                <FiArrowRight
                  className="transition-transform group-hover:translate-x-1"
                  size={17}
                  aria-hidden="true"
                />
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[#687970]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-[#176044] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10291f]/55 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="profileDialogTitle"
            className="w-full flex justify-center items-center max-w-115 rounded-lgsm:p-7"
          >
            <LuLoaderCircle className="animate-spin text-3xl" />
          </section>
        </div>
      )}
    </main>
  );
}

export default Signup;
