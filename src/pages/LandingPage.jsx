import { FiArrowRight, FiTrendingUp } from "react-icons/fi";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { AuthContext } from "../context/AuthContext";
import { LuLoaderCircle } from "react-icons/lu";

const transactions = [
  {
    label: "Counter sales",
    category: "Sales",
    amount: "+ Rs 8,450",
    positive: true,
  },
  {
    label: "Vegetable supplier",
    category: "Stock purchase",
    amount: "- Rs 2,180",
    positive: false,
  },
  {
    label: "Evening sales",
    category: "Sales",
    amount: "+ Rs 5,720",
    positive: true,
  },
];

const landingFeatures = [
  {
    number: "01",
    title: "Track sales and expenses",
    description:
      "Record each sale or expense with a description, category, payment method, and amount.",
    tone: "border-[#397354]",
    numberTone: "text-[#397354]",
  },
  {
    number: "02",
    title: "Keep cash and online balances",
    description:
      "See separate cash and online Rokar balances. Sales add to the matching balance and expenses subtract from it.",
    tone: "border-[#d3a650]",
    numberTone: "text-[#9a6b1e]",
  },
  {
    number: "03",
    title: "Review any date range",
    description:
      "Use Today, Last 7 days, This month, or select a custom start and end date to review records.",
    tone: "border-[#70849a]",
    numberTone: "text-[#526b83]",
  },
  {
    number: "04",
    title: "Follow cash flow",
    description:
      "Compare sales and expenses across the last seven days with a simple daily chart.",
    tone: "border-[#397354]",
    numberTone: "text-[#397354]",
  },
  {
    number: "05",
    title: "Manage AEPS records",
    description:
      "Record AEPS transactions, review them by date range, and see your AEPS cash and online balances.",
    tone: "border-[#d3a650]",
    numberTone: "text-[#9a6b1e]",
  },
  {
    number: "06",
    title: "Protect your account",
    description:
      "Verify your email, manage your profile, and access the dashboard through your authenticated account.",
    tone: "border-[#70849a]",
    numberTone: "text-[#526b83]",
  },
];

function LandingPage() {
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  const [sessionError, setSessionError] = useState(false);
  const formattedToday = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const handleAuthLink = async (e, destination) => {
    setSessionError(true);
    if (!token || !user) {
      navigate(destination);
    } else {
      navigate("/dashboard");
    }

    e.preventDefault();
  };

  return (
    <main className="min-h-screen bg-[#f1f5f1] text-[#18392f] font-[Manrope,sans-serif]">
      <header className="border-b border-[#dce6de] bg-white">
        <nav className="mx-auto flex h-18 max-w-310 items-center justify-between px-5 sm:px-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[#176044]/30"
          >
            <img
              src={logo}
              alt="DailyRokar"
              className="h-10 w-10 object-contain"
            />
            <span className="text-lg font-bold">DailyRokar</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-[#52685d] md:flex">
            <a className="transition hover:text-[#176044]" href="#overview">
              Overview
            </a>
            <a className="transition hover:text-[#176044]" href="#features">
              Features
            </a>
            <a className="transition hover:text-[#176044]" href="#how-it-works">
              How it works
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              onClick={(e) => handleAuthLink(e, "/login")}
              className="hidden text-sm font-semibold text-[#315b46] hover:text-[#176044] sm:inline"
            >
              Sign
            </Link>
            <Link
              to="/signup"
              onClick={(e) => handleAuthLink(e, "/signup")}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#176044] px-4 text-sm font-bold text-white transition hover:bg-[#124d36]"
            >
              Get Started
              <FiArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </nav>
      </header>

      <section
        id="overview"
        className="relative overflow-hidden bg-[#123d31] text-white"
      >
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] border-l border-white/10 lg:block" />
        <div className="mx-auto grid max-w-310 gap-12 px-5 pb-14 pt-16 sm:px-8 sm:pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:pb-20 lg:pt-24">
          <div className="relative z-10 max-w-130">
            <p className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#c2e3a7]">
              <span className="h-2 w-2 rounded-full bg-[#e9b65e]" />
              Your shop, in good order
            </p>
            <h1 className="font-serif text-[44px] font-semibold leading-[1.08] sm:text-[54px]">
              DailyRokar
            </h1>
            <p className="mt-4 max-w-112.5 font-serif text-[26px] leading-tight text-white/90 sm:text-[30px]">
              Know where every rupee goes.
            </p>
            <p className="mt-5 max-w-107.5 text-sm leading-6 text-white/70 sm:text-base">
              Keep sales, expenses, and your daily balance together, so running
              your shop feels a little clearer.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/signup"
                onClick={(e) => handleAuthLink(e, "/signup")}
                className="inline-flex h-12 items-center gap-2 rounded-md bg-[#c2e3a7] px-5 text-sm font-bold text-[#123d31] transition hover:bg-white"
              >
                Create your account
                <FiArrowRight size={17} aria-hidden="true" />
              </Link>
              <a
                href="#features"
                className="inline-flex h-12 items-center rounded-md border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore features
              </a>
            </div>
          </div>

          <div className="relative z-10 overflow-hidden rounded-lg border border-white/15 bg-[#f8faf7] text-[#18392f] shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between border-b border-[#e1e9e2] px-5 py-4 sm:px-7">
              <div className="flex items-center gap-3">
                <img src={logo} alt="" className="h-9 w-9 object-contain" />
                <div>
                  <p className="text-sm font-bold">Today at your shop</p>
                  <p className="mt-0.5 text-xs text-[#718078]">
                    {formattedToday}
                  </p>
                </div>
              </div>
              <span className="hidden items-center gap-1.5 text-xs font-semibold text-[#397354] sm:flex">
                <FiTrendingUp size={14} aria-hidden="true" />
                Daily overview
              </span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-[#e1e9e2] border-b border-[#e1e9e2]">
              <div className="px-5 py-5 sm:px-7">
                <p className="text-xs font-medium text-[#718078]">
                  Total sales
                </p>
                <p className="mt-2 text-[25px] font-bold text-[#18392f] sm:text-[30px]">
                  Rs 14,170
                </p>
              </div>
              <div className="px-5 py-5 sm:px-7">
                <p className="text-xs font-medium text-[#718078]">Expenses</p>
                <p className="mt-2 text-[25px] font-bold text-[#18392f] sm:text-[30px]">
                  Rs 2,180
                </p>
              </div>
            </div>
            <div className="px-5 py-4 sm:px-7">
              <div className="mb-2 grid grid-cols-[1fr_auto] text-[11px] font-bold uppercase text-[#839188]">
                <span>Sample entries</span>
                <span>Amount</span>
              </div>
              {transactions.map((transaction) => (
                <div
                  key={transaction.label}
                  className="grid grid-cols-[1fr_auto] items-center border-t border-[#e8eee8] py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{transaction.label}</p>
                    <p className="mt-0.5 text-xs text-[#839188]">
                      {transaction.category}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${transaction.positive ? "text-[#397354]" : "text-[#9a6840]"}`}
                  >
                    {transaction.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto grid max-w-310 gap-x-8 gap-y-10 px-5 py-14 sm:px-8 md:grid-cols-2 md:py-16 xl:grid-cols-3"
      >
        {landingFeatures.map(
          ({ number, title, description, tone, numberTone }, index) => (
            <article
              key={number}
              id={index === 2 ? "how-it-works" : undefined}
              className={`border-t-2 pt-4 ${tone}`}
            >
              <p className={`text-xs font-bold ${numberTone}`}>{number}</p>
              <h2 className="mt-3 font-serif text-xl font-semibold">{title}</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#64766d]">
                {description}
              </p>
            </article>
          ),
        )}
      </section>

      <footer className="border-t border-[#dce6de] bg-white">
        <div className="mx-auto flex max-w-310 flex-col gap-4 px-5 py-6 text-sm text-[#687970] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>DailyRokar</span>
          <div className="flex items-center gap-5">
            <Link
              to="/login"
              onClick={(e) => handleAuthLink(e, "/login")}
              className="hover:text-[#176044]"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              onClick={(e) => handleAuthLink(e, "/signup")}
              className="font-semibold text-[#176044] hover:underline"
            >
              Create account
            </Link>
            <Link to="/terms" className="hover:text-[#176044]">
              Terms
            </Link>
          </div>
        </div>
      </footer>
      {sessionError && (
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

export default LandingPage;
