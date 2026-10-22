import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f1f5f1] px-5 py-12 font-[Manrope,sans-serif] text-[#18392f]">
      <section className="w-full max-w-lg rounded-xl border border-[#dce6de] bg-white p-7 text-center shadow-[0_20px_60px_rgba(24,57,47,0.08)] sm:p-10">
        <Link to="/" className="mx-auto mb-8 flex w-fit items-center gap-2.5">
          <img src={logo} alt="DailyRokar" className="h-10 w-10" />
          <span className="font-bold">DailyRokar</span>
        </Link>
        <p className="font-serif text-7xl font-bold text-[#c2e3a7]">404</p>
        <h1 className="mt-4 font-serif text-3xl font-semibold">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#718078]">
          We couldn’t find the page you’re looking for. It may have moved or the
          address may be incorrect.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex h-11 items-center gap-2 rounded-md bg-[#176044] px-5 text-sm font-bold text-white transition hover:bg-[#124d36]"
        >
          <FiArrowLeft size={16} aria-hidden="true" />
          Back to home
        </Link>
      </section>
    </main>
  );
}

export default NotFoundPage;
