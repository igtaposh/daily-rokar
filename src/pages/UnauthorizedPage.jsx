import { FiLock } from "react-icons/fi";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f1f5f1] px-5 py-12 font-[Manrope,sans-serif] text-[#18392f]">
      <section className="w-full max-w-lg rounded-xl border border-[#dce6de] bg-white p-7 text-center shadow-[0_20px_60px_rgba(24,57,47,0.08)] sm:p-10">
        <Link to="/" className="mx-auto mb-8 flex w-fit items-center gap-2.5">
          <img src={logo} alt="DailyRokar" className="h-10 w-10" />
          <span className="font-bold">DailyRokar</span>
        </Link>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f8e9e4] text-[#a05c48]">
          <FiLock size={24} aria-hidden="true" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#a05c48]">
          Sign in required
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">
          You’re not authorized
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#718078]">
          Sign in to your DailyRokar account to access the dashboard.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/login"
            className="inline-flex h-11 items-center rounded-md bg-[#176044] px-5 text-sm font-bold text-white transition hover:bg-[#124d36]"
          >
            Sign in
          </Link>
          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-md border border-[#d7e1da] px-5 text-sm font-semibold text-[#52685d] transition hover:border-[#397354] hover:text-[#176044]"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default UnauthorizedPage;
