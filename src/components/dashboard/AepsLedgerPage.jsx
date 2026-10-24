import { FiPlus } from "react-icons/fi";
import { LuLoaderCircle } from "react-icons/lu";
import AepsTransactionsList from "./AepsTransactionsList";

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

export default function AepsLedgerPage({
  transactions,
  period,
  user,
  entryForm,
  setEntryForm,
  formError,
  message,
  loading,
  isEntryFormOpen,
  onOpenEntry,
  onCloseEntry,
  onSubmitEntry,
  deletingTransactionKey,
  setDeleteConfirmation,
  formatDate,
  formatMoney,
  formatRelativeDate,
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
            className={`rounded-2xl border border-[#dce6de] p-4 shadow-[0_6px_22px_rgba(24,57,47,0.04)] sm:p-5 ${
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

      <section className="rounded-2xl border border-[#dce6de] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.04)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#18392f]">
              Record AEPS transaction
            </h2>
            <p className="mt-1 text-sm text-[#718078]">
              Add a withdrawal or deposit to your AEPS ledger.
            </p>
          </div>
          {!isEntryFormOpen && (
            <button
              type="button"
              onClick={onOpenEntry}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-bold text-white transition hover:bg-zinc-800"
            >
              <FiPlus size={16} aria-hidden="true" />
              Add transaction
            </button>
          )}
          {isEntryFormOpen && (
            <button
              type="button"
              onClick={onCloseEntry}
              className="h-9 rounded-xl px-3 text-sm font-semibold text-[#718078] transition hover:bg-[#edf3ef]"
            >
              Cancel
            </button>
          )}
        </div>
        {isEntryFormOpen && (
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
        )}
      </section>

      <AepsTransactionsList
        transactions={transactions}
        period={period}
        deletingTransactionKey={deletingTransactionKey}
        setDeleteConfirmation={setDeleteConfirmation}
        formatDate={formatDate}
        formatMoney={formatMoney}
        formatRelativeDate={formatRelativeDate}
      />
    </div>
  );
}
