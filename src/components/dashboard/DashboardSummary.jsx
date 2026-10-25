export default function DashboardSummary({ balanceCards, metricCards, formatMoney }) {
  return (
    <>
      <section
        aria-label="Account balances"
        className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        {balanceCards.map(({ label, amount, tone, cardTone }) => (
          <article
            key={label}
            className={`group relative overflow-hidden rounded-2xl border border-[#e2e9e3] p-4 shadow-[0_6px_22px_rgba(24,57,47,0.045)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(24,57,47,0.08)] sm:p-5 ${cardTone}`}
          >
            <span className="absolute right-0 top-0 h-16 w-16 -translate-y-1/3 translate-x-1/3 rounded-full bg-[#397354]/[0.06] transition group-hover:scale-125" />
            <p className="relative text-xs font-bold uppercase tracking-[0.12em] text-[#718078]">
              {label}
            </p>
            <p
              className={`relative mt-3 text-[1.55rem] font-bold tracking-tight sm:text-[1.7rem] ${tone}`}
            >
              {formatMoney(amount)}
            </p>
          </article>
        ))}
      </section>

      <section
        aria-label="Sales and expense summary"
        className="grid gap-4 md:grid-cols-2"
      >
        {metricCards.map(
          ({ id, label, amount, detail, payments, icon: Icon, tone }) => (
            <article
              id={id}
              key={id}
              className="rounded-2xl border border-[#e2e9e3] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.045)] transition hover:shadow-[0_12px_28px_rgba(24,57,47,0.08)] sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#64766d]">{label}</p>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}
                >
                  <Icon size={17} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight text-[#18392f] sm:text-[1.75rem]">
                {formatMoney(amount)}
              </p>
              <p className="mt-1 text-xs text-[#839188]">{detail}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#e8eee8] pt-3">
                {payments.map(({ payment, amount: paymentAmount }) => (
                  <div key={payment}>
                    <p className="text-xs font-medium text-[#839188]">
                      {payment}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#29463a]">
                      {formatMoney(paymentAmount)}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ),
        )}
      </section>
    </>
  );
}
