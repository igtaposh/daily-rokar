import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiTrash2,
} from "react-icons/fi";
import { LuLoaderCircle } from "react-icons/lu";

const transactionFilters = [
  { label: "All", value: "all" },
  { label: "Sales", value: "sale" },
  { label: "Expenses", value: "expense" },
];

export default function TransactionsSection({
  records,
  period,
  transactionFilter,
  setTransactionFilter,
  deletingTransactionKey,
  setDeleteConfirmation,
  formatDateTime,
  formatMoney,
}) {
  const filteredRecords = records.filter((record) => {
    if (transactionFilter == "sale") return record.type == "sale";
    if (transactionFilter == "expense") return record.type == "expense";
    return true;
  });

  return (
      <section
        id="transactions"
        className="mt-5 rounded-2xl border border-[#e2e9e3] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.045)] sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#18392f]">
              Recent transactions
            </h2>
            <p className="mt-1 text-sm text-[#718078]">
              Sales and expenses recorded for {period.toLowerCase()}.
            </p>
          </div>
          <div
            className="inline-flex w-fit rounded-xl border border-[#d7e1da] bg-[#f7faf8] p-1"
            aria-label="Filter transactions"
          >
            {transactionFilters.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                aria-pressed={transactionFilter === value}
                onClick={() => setTransactionFilter(value)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${transactionFilter === value ? "bg-white text-[#176044] shadow-sm" : "text-[#718078] hover:text-[#176044]"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {records.length ? (
            filteredRecords.map((transaction) => (
              <div
                key={transaction._id}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-t border-[#edf0ed] py-4 transition-colors hover:bg-[#fbfdfb] sm:grid-cols-[minmax(0,1.6fr)_1fr_0.8fr_auto_auto] sm:gap-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${transaction.type === "sale" ? "bg-[#e4f0e5] text-[#397354]" : "bg-[#f8e9e4] text-[#a05c48]"}`}
                  >
                    {transaction.type === "sale" ? (
                      <FiArrowDownRight size={17} aria-hidden="true" />
                    ) : (
                      <FiArrowUpRight size={17} aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#29463a]">
                      {transaction.description}
                    </p>
                    <p className="mt-0.5 hidden text-xs text-[#839188] sm:block">
                      {transaction.category}
                    </p>
                    <p className="mt-1 text-[11px] text-[#718078] sm:hidden">
                      {formatDateTime(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <span className="hidden text-sm text-[#64766d] sm:block">
                  {transaction.payment}
                </span>
                <span className="hidden text-xs text-[#718078] sm:block">
                  {formatDateTime(transaction.createdAt)}
                </span>
                <span
                  className={`text-right text-sm font-bold ${transaction.type === "sale" ? "text-[#397354]" : "text-[#a05c48]"}`}
                >
                  {transaction.type === "sale" ? "+" : "−"}
                  {formatMoney(transaction.amount)}
                </span>
                <button
                  type="button"
                  aria-label={`Delete ${transaction.type} record`}
                  title="Delete record"
                  disabled={Boolean(deletingTransactionKey)}
                  onClick={() =>
                    setDeleteConfirmation({ kind: "record", transaction })
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-md text-[#a05c48] transition hover:bg-[#f8e9e4] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingTransactionKey ===
                  `record:${transaction._id}` ? (
                    <LuLoaderCircle
                      className="animate-spin"
                      size={17}
                      aria-hidden="true"
                    />
                  ) : (
                    <FiTrash2 size={16} aria-hidden="true" />
                  )}
                </button>
              </div>
            ))
          ) : (
            <p className="border-t border-[#e8eee8] py-8 text-center text-sm text-[#839188]">
              No transactions for this period.
            </p>
          )}
        </div>
      </section>
  );
}
