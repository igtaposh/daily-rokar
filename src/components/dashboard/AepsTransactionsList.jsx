import { FiCreditCard, FiTrash2 } from "react-icons/fi";
import { LuLoaderCircle } from "react-icons/lu";

export default function AepsTransactionsList({
  transactions,
  period,
  deletingTransactionKey,
  setDeleteConfirmation,
  formatDateTime,
  formatMoney,
}) {
  return (
    <section
      id="aeps-transactions"
      className="rounded-2xl border border-[#e2e9e3] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.045)] sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#18392f]">
            Recent AEPS transactions
          </h2>
          <p className="mt-1 text-sm text-[#718078]">
            AEPS transactions recorded for {period.toLowerCase()}.
          </p>
        </div>
        <span className="w-fit rounded-full bg-[#edf3ef] px-3 py-1 text-xs font-semibold text-[#397354]">
          AEPS
        </span>
      </div>

      <div className="mt-4">
        {transactions.length ? (
          transactions.map((transaction) => (
            <div
              key={transaction._id}
              className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-t border-[#e8eee8] py-4 transition-colors hover:bg-[#fbfdfb] sm:grid-cols-[minmax(0,1.6fr)_1fr_0.8fr_auto_auto] sm:gap-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#e9eef5] text-[#526b83]">
                  <FiCreditCard size={17} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#29463a]">
                    {transaction.name}
                  </p>
                  <p className="mt-0.5 text-xs capitalize text-[#839188]">
                    AEPS {transaction.type}
                  </p>
                  {transaction.adharNumber && (
                    <span className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-md border border-[#d8e5f0] bg-[#f0f6fb] px-2 py-1 text-[11px] font-semibold text-[#385d7a]">
                      <span className="shrink-0 uppercase tracking-wide text-[#6a8297]">
                        Aadhaar
                      </span>
                      <span className="truncate font-bold tracking-[0.04em]">
                        {transaction.adharNumber}
                      </span>
                    </span>
                  )}
                  <p className="mt-1 text-[11px] text-[#718078] sm:hidden">
                    {formatDateTime(transaction.createdAt)}
                  </p>
                </div>
              </div>
              <span className="hidden text-sm text-[#64766d] sm:block">
                AEPS
              </span>
              <span className="hidden text-xs text-[#718078] sm:block">
                {formatDateTime(transaction.createdAt)}
              </span>
              <span className="text-right text-sm font-bold text-[#526b83]">
                {formatMoney(transaction.amount)}
              </span>
              <button
                type="button"
                aria-label={`Delete AEPS ${transaction.type} transaction`}
                title="Delete AEPS transaction"
                disabled={Boolean(deletingTransactionKey)}
                onClick={() =>
                  setDeleteConfirmation({ kind: "aeps", transaction })
                }
                className="flex h-9 w-9 items-center justify-center rounded-md text-[#a05c48] transition hover:bg-[#f8e9e4] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingTransactionKey === `aeps:${transaction._id}` ? (
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
            No AEPS transactions for this period.
          </p>
        )}
      </div>
    </section>
  );
}
