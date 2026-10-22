import { FiArrowRight, FiCheck, FiShield } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { useContext, useState } from "react";
import axiosInstance, { setAuthToken } from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";
import { LuLoaderCircle } from "react-icons/lu";

function Login() {
  const navigate = useNavigate();
  const { setUser, setToken } = useContext(AuthContext);
  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });
  const [formError, setFormError] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const errors = {};
    if (!userForm.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) {
      errors.email = "Enter a valid email address";
    }
    if (!userForm.password.trim()) {
      errors.password = "Please enter a valid password.";
    } else if (userForm.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post("/user/login", {
        email: userForm.email,
        password: userForm.password,
      });

      if (res?.status === 200) {
        setUser(res.data.user);
        setToken(res.data.token);
        setAuthToken(res.data.token);
        console.log(res);

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        setMessage({
          type: "success",
          text: "Logged in successfully! Redirecting to dashboard...",
        });

        navigate("/dashboard");
      }
    } catch (err) {
      console.log(err);
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Login failed. Please try again.",
      });
    } finally {
      setLoading(false);
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
              Back to your business
            </p>
            <h1 className="font-serif text-[42px] font-semibold leading-[1.12]">
              A clearer view of the day starts here.
            </h1>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/70">
              Sign in to pick up where you left off and keep your shop moving.
            </p>
            <div className="mt-10 border-t border-white/15">
              <div className="flex items-center gap-3 border-b border-white/15 py-4 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c2e3a7] text-[#123d31]">
                  <FiCheck size={15} aria-hidden="true" />
                </span>
                <span className="text-white/90">
                  Sales and expenses in one place
                </span>
              </div>
              <div className="flex items-center gap-3 py-4 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c2e3a7] text-[#123d31]">
                  <FiCheck size={15} aria-hidden="true" />
                </span>
                <span className="text-white/90">
                  Your daily balance at a glance
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
          <div className="w-full max-w-105">
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
                Welcome back
              </p>
              <h2 className="font-serif text-3xl font-semibold text-[#18392f] sm:text-[34px]">
                Sign in to DailyRokar
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#64766d]">
                Enter your account details to continue.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
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
                  className="mt-2 h-12 w-full rounded-lg border border-[#d7e1da] bg-white px-3.5 text-sm font-normal text-[#18392f] outline-none transition placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                />
                {formError.email && (
                  <span className="mt-1 block text-xs text-red-600">
                    {formError.email}
                  </span>
                )}
              </label>

              <label
                className="block text-sm font-semibold text-[#29463a]"
                htmlFor="password"
              >
                Password
                <input
                  value={userForm.password}
                  onChange={handleInputChange}
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="mt-2 h-12 w-full rounded-lg border border-[#d7e1da] bg-white px-3.5 text-sm font-normal text-[#18392f] outline-none transition placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                />
                {formError.password && (
                  <span className="mt-1 block text-xs text-red-600">
                    {formError.password}
                  </span>
                )}
              </label>

              <div className="-mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-[#176044] hover:underline"
                >
                  Forgot password?
                </Link>
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
                className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#176044] px-4 text-sm font-bold text-white transition hover:bg-[#124d36] focus:outline-none focus:ring-4 focus:ring-[#176044]/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Sign in
                <FiArrowRight
                  className="transition-transform group-hover:translate-x-1"
                  size={17}
                  aria-hidden="true"
                />
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[#687970]">
              New to DailyRokar?{" "}
              <Link
                to="/signup"
                className="font-bold text-[#176044] hover:underline"
              >
                Create an account
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

export default Login;
