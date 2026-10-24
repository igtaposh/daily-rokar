export default function CashFlowChart({
  weeklySummary,
  maxChartValue,
  formatMoney,
}) {
  const weeklySales = weeklySummary.reduce((total, day) => total + day.sales, 0);
  const weeklyExpenses = weeklySummary.reduce(
    (total, day) => total + day.expenses,
    0,
  );

  return (
    <article
      id="cashflow"
      className="rounded-2xl border border-[#dce6de] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.04)] sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-semibold text-[#18392f]">
            Cash flow
          </h2>
          <p className="mt-1 text-sm text-[#718078]">
            Sales and expenses over the last seven days
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-[#64766d]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#397354]" />
            Sales
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#d9a293]" />
            Expenses
          </span>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-7 gap-2 sm:gap-4">
        {weeklySummary.map((day) => (
          <div key={day.dateKey} className="min-w-0 text-center">
            <div className="flex h-36 items-end justify-center gap-1 border-b border-[#e8eee8] sm:gap-1.5">
              <div
                title={`Sales ${formatMoney(day.sales)}`}
                aria-label={`${day.label}: sales ${formatMoney(day.sales)}`}
                className="w-2.5 rounded-t-md bg-[#397354] shadow-[0_2px_6px_rgba(57,115,84,0.18)] sm:w-4"
                style={{
                  height: `${Math.max(day.sales ? 5 : 0, (day.sales / maxChartValue) * 112)}px`,
                }}
              />
              <div
                title={`Expenses ${formatMoney(day.expenses)}`}
                aria-label={`${day.label}: expenses ${formatMoney(day.expenses)}`}
                className="w-2.5 rounded-t-md bg-[#d9a293] shadow-[0_2px_6px_rgba(217,162,147,0.18)] sm:w-4"
                style={{
                  height: `${Math.max(day.expenses ? 5 : 0, (day.expenses / maxChartValue) * 112)}px`,
                }}
              />
            </div>
            <p className="mt-2 text-xs font-medium text-[#718078]">
              {day.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap justify-between gap-3 border-t border-[#e8eee8] pt-4 text-sm">
        <p className="text-[#64766d]">
          7-day sales{" "}
          <span className="ml-1 font-bold text-[#397354]">
            {formatMoney(weeklySales)}
          </span>
        </p>
        <p className="text-[#64766d]">
          7-day expenses{" "}
          <span className="ml-1 font-bold text-[#a05c48]">
            {formatMoney(weeklyExpenses)}
          </span>
        </p>
      </div>
    </article>
  );
}
