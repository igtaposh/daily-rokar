import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

const termsSections = [
  {
    title: "Using DailyRokar",
    content:
      "DailyRokar helps you record and review business sales, expenses, balances, and related transactions. You are responsible for keeping your account credentials secure and for activity performed through your account.",
  },
  {
    title: "Your records and balances",
    content:
      "You are responsible for entering accurate transaction details and reviewing your records. Dashboard totals are based on the information recorded in the service and should be checked against your own business records before you rely on them for financial, tax, or accounting decisions.",
  },
  {
    title: "Acceptable use",
    content:
      "Use the service only for lawful purposes and do not attempt to disrupt, misuse, or gain unauthorized access to the service or another user’s account.",
  },
  {
    title: "Service availability",
    content:
      "We aim to keep DailyRokar available and reliable, but access may occasionally be interrupted for maintenance, updates, or circumstances outside our control. Keep any independent records you need for your business.",
  },
  {
    title: "Updates to these terms",
    content:
      "These terms may be updated as the service changes. Continued use of DailyRokar after updated terms are published means you accept the revised terms.",
  },
];

function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-[#f1f5f1] px-4 py-8 font-[Manrope,sans-serif] text-[#18392f] sm:px-6 sm:py-12">
      <article className="mx-auto max-w-3xl rounded-xl border border-[#dce6de] bg-white p-6 shadow-[0_20px_60px_rgba(24,57,47,0.08)] sm:p-10">
        <Link to="/" className="mb-8 flex w-fit items-center gap-2.5">
          <img src={logo} alt="DailyRokar" className="h-10 w-10" />
          <span className="font-bold">DailyRokar</span>
        </Link>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#397354]">
          Legal
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
          Terms &amp; Conditions
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#718078]">
          Please read these terms before using DailyRokar.
        </p>

        <div className="mt-8 space-y-7">
          {termsSections.map(({ title, content }) => (
            <section key={title} className="border-t border-[#e8eee8] pt-5">
              <h2 className="font-serif text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#64766d]">{content}</p>
            </section>
          ))}
        </div>

        <Link
          to="/"
          className="mt-9 inline-flex h-11 items-center rounded-md bg-[#176044] px-5 text-sm font-bold text-white transition hover:bg-[#124d36]"
        >
          Back to home
        </Link>
      </article>
    </main>
  );
}

export default TermsAndConditions;
