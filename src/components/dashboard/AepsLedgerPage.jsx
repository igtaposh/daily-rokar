import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiTrash2,
} from "react-icons/fi";
import { LuLoaderCircle } from "react-icons/lu";
import AepsTransactionsList from "./AepsTransactionsList";
import formatDateTime from "./formatDateTime";

const fieldClassName =
  "mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none transition focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10";

function AepsEntryForm({
  entryForm,
  setEntryForm,
  formError,
  message,
  loading,
  onSubmit,
}) {
  const updateEntry = (event) => {
    const { name, value } = event.target;
    setEntryForm((current) => ({ ...current, [name]: value }));
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-[#e8eee8] bg-[#f9fbf9] p-4"
    >
      <label
        className="block text-xs font-semibold text-[#52685d]"
        htmlFor="aepsCustomerName"
      >
        Customer name
        <input
          id="aepsCustomerName"
          name="name"
          value={entryForm.name}
          onChange={updateEntry}
          placeholder="Customer name"
          className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none placeholder:text-[#98a79e] transition focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
        />
        {formError.name && (
          <span className="mt-1 block text-xs text-red-600">
            {formError.name}
          </span>
        )}
      </label>

      <label
        className="block text-xs font-semibold text-[#52685d]"
        htmlFor="aepsAdharNumber"
      >
        Aadhar number
        <input
          id="aepsAdharNumber"
          name="adharNumber"
          value={entryForm.adharNumber}
          onChange={updateEntry}
          placeholder="9834-7366-1887"
          className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none placeholder:text-[#98a79e] transition focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
        />
        {formError.adharNumber && (
          <span className="mt-1 block text-xs text-red-600">
            {formError.adharNumber}
          </span>
        )}
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label
          className="block text-xs font-semibold text-[#52685d]"
          htmlFor="aepsType"
        >
          Transaction
          <select
            id="aepsType"
            name="type"
            value={
              entryForm.type.charAt(0).toUpperCase() +
              entryForm.type.slice(1).toLowerCase()
            }
            onChange={updateEntry}
            className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-xs font-normal text-[#18392f] outline-none transition focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
          >
            <option value="Withdrawal">Withdrawal</option>
            <option value="Deposit">Deposit</option>
          </select>
        </label>

        <label
          className="block text-xs font-semibold text-[#52685d]"
          htmlFor="aepsAmount"
        >
          Amount
          <input
            id="aepsAmount"
            name="amount"
            type="number"
            inputMode="numeric"
            value={entryForm.amount}
            onChange={updateEntry}
            placeholder="0"
            className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none placeholder:text-[#98a79e] transition focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
          />
          {formError.amount && (
            <span className="mt-1 block text-xs text-red-600">
              {formError.amount}
            </span>
          )}
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-sm font-bold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <LuLoaderCircle className="animate-spin text-2xl" />
        ) : (
          "Save AEPS transaction"
        )}
      </button>
      {message.text && (
        <div
          role="status"
          className={`rounded-lg border px-3 py-2 text-sm ${
            message.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}
    </form>
  );
}

function CashManagementForm({
  form,
  setForm,
  formError,
  message,
  loading,
  onSubmit,
}) {
  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  return (
    <section className="rounded-2xl border border-[#dce6de] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.04)] sm:p-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-[#18392f]">
          Cash-in / cash-out
        </h2>
        <p className="mt-1 text-sm text-[#718078]">
          Record cash movement and update your AEPS balance.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <label
          className="block text-xs font-semibold text-[#52685d]"
          htmlFor="cashTransactionName"
        >
          Name
          <input
            id="cashTransactionName"
            name="name"
            value={form.name}
            onChange={updateForm}
            placeholder="Customer or transaction name"
            className={fieldClassName}
          />
          {formError.name && (
            <span className="mt-1 block text-xs text-red-600">
              {formError.name}
            </span>
          )}
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label
            className="block text-xs font-semibold text-[#52685d]"
            htmlFor="cashTransactionType"
          >
            Type
            <select
              id="cashTransactionType"
              name="type"
              value={form.type}
              onChange={updateForm}
              className={fieldClassName}
            >
              <option value="cash-in">Cash-in</option>
              <option value="cash-out">Cash-out</option>
            </select>
          </label>

          <label
            className="block text-xs font-semibold text-[#52685d]"
            htmlFor="cashTransactionMethod"
          >
            Method
            <select
              id="cashTransactionMethod"
              name="method"
              value={form.method}
              onChange={updateForm}
              className={fieldClassName}
            >
              <option value="cash">Cash</option>
              <option value="online">Online</option>
            </select>
          </label>
        </div>

        <label
          className="block text-xs font-semibold text-[#52685d]"
          htmlFor="cashTransactionAmount"
        >
          Amount
          <input
            id="cashTransactionAmount"
            name="amount"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={updateForm}
            placeholder="0"
            className={fieldClassName}
          />
          {formError.amount && (
            <span className="mt-1 block text-xs text-red-600">
              {formError.amount}
            </span>
          )}
        </label>

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#176044] text-sm font-bold text-white shadow-sm transition hover:bg-[#124d37] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <LuLoaderCircle className="animate-spin text-2xl" />
          ) : (
            "Save cash transaction"
          )}
        </button>

        {message.text && (
          <div
            role="status"
            className={`rounded-lg border px-3 py-2 text-sm ${
              message.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </section>
  );
}

function RecentCashTransactions({
  transactions,
  deletingTransactionKey,
  setDeleteConfirmation,
  formatMoney,
}) {
  const recentTransactions = transactions.slice(0, 5);

  return (
    <section className="rounded-2xl border border-[#e2e9e3] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.045)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#18392f]">
            Recent cash transactions
          </h2>
          <p className="mt-1 text-sm text-[#718078]">
            Latest cash-in and cash-out entries.
          </p>
        </div>
        <span className="w-fit rounded-full bg-[#edf3ef] px-3 py-1 text-xs font-semibold text-[#397354]">
          Cash ledger
        </span>
      </div>

      <div className="mt-4">
        {recentTransactions.length ? (
          recentTransactions.map((transaction) => {
            const isCashIn = transaction.type === "cash-in";

            return (
              <div
                key={transaction._id}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-t border-[#e8eee8] py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                      isCashIn
                        ? "bg-[#e4f0e5] text-[#176044]"
                        : "bg-[#f8e9e4] text-[#a05c48]"
                    }`}
                  >
                    {isCashIn ? (
                      <FiArrowDownRight size={17} aria-hidden="true" />
                    ) : (
                      <FiArrowUpRight size={17} aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#29463a]">
                      {transaction.name}
                    </p>
                    <p className="mt-0.5 text-xs capitalize text-[#839188]">
                      {transaction.type} · {transaction.method} ·{" "}
                      {formatDateTime(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-right text-sm font-bold ${
                    isCashIn ? "text-[#176044]" : "text-[#a05c48]"
                  }`}
                >
                  {isCashIn ? "+" : "-"}
                  {formatMoney(transaction.amount)}
                </span>
                <button
                  type="button"
                  aria-label={`Delete ${transaction.type} transaction`}
                  title="Delete cash transaction"
                  disabled={Boolean(deletingTransactionKey)}
                  onClick={() =>
                    setDeleteConfirmation({ kind: "cms", transaction })
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-md text-[#a05c48] transition hover:bg-[#f8e9e4] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingTransactionKey === `cms:${transaction._id}` ? (
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
            );
          })
        ) : (
          <p className="border-t border-[#e8eee8] py-8 text-center text-sm text-[#839188]">
            No cash transactions yet.
          </p>
        )}
      </div>
    </section>
  );
}

export default function AepsLedgerPage({
  transactions,
  cashTransactions,
  period,
  user,
  entryForm,
  setEntryForm,
  formError,
  message,
  loading,
  onSubmitEntry,
  cashForm,
  setCashForm,
  cashFormError,
  cashMessage,
  cashLoading,
  onSubmitCash,
  deletingTransactionKey,
  setDeleteConfirmation,
  formatMoney,
}) {
  const cashBalance = Number(user?.aeps || 0);
  const onlineBalance = Number(user?.aepsOnline || 0);
  const balances = [
    { label: "Total AEPS", amount: cashBalance + onlineBalance },
    { label: "AEPS Cash", amount: cashBalance },
    { label: "AEPS Online", amount: onlineBalance },
  ];

  return (
    <div className="space-y-5">
      <section
        aria-label="AEPS balances"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        {balances.map(({ label, amount }, index) => (
          <article
            key={label}
            className={`rounded-2xl border border-[#e2e9e3] p-4 shadow-[0_6px_22px_rgba(24,57,47,0.045)] sm:p-5 ${
              index === 0 ? "bg-[#e4f0e5]" : "bg-white"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#718078]">
              {label}
            </p>
            <p className="mt-3 text-2xl font-bold tracking-tight text-[#18392f]">
              {formatMoney(amount)}
            </p>
          </article>
        ))}
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-[#e2e9e3] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.045)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#18392f]">
                Record AEPS transaction
              </h2>
              <p className="mt-1 text-sm text-[#718078]">
                Add a withdrawal or deposit to your AEPS ledger.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <AepsEntryForm
              entryForm={entryForm}
              setEntryForm={setEntryForm}
              formError={formError}
              message={message}
              loading={loading}
              onSubmit={onSubmitEntry}
            />
          </div>
        </section>

        <CashManagementForm
          form={cashForm}
          setForm={setCashForm}
          formError={cashFormError}
          message={cashMessage}
          loading={cashLoading}
          onSubmit={onSubmitCash}
        />
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <AepsTransactionsList
          transactions={transactions}
          period={period}
          deletingTransactionKey={deletingTransactionKey}
          setDeleteConfirmation={setDeleteConfirmation}
          formatDateTime={formatDateTime}
          formatMoney={formatMoney}
        />
        <RecentCashTransactions
          transactions={cashTransactions}
          deletingTransactionKey={deletingTransactionKey}
          setDeleteConfirmation={setDeleteConfirmation}
          formatMoney={formatMoney}
        />
      </div>
    </div>
  );
}
