import { useEffect, useMemo, useState } from "react";
import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiPlus,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import { LuLoaderCircle } from "react-icons/lu";
import axiosInstance from "../../api/axiosInstance";
import Popup from "./Popup";
import formatDateTime from "./formatDateTime";

const initialForm = {
  customerName: "",
  description: "",
  type: "credit",
  payment: "Cash",
  amount: "",
};

const getTransactionTime = (transaction) => {
  const timestamp = new Date(
    transaction.createdAt || transaction.date || 0,
  ).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getCustomerName = (customer) =>
  customer.customerName || customer.name || "Unnamed customer";

const getTransactions = (customer, type) => {
  const transactions =
    type === "credit"
      ? customer.creditTransaction
      : customer.paymentTransaction;

  return Array.isArray(transactions) ? transactions : [];
};

const getTransactionDescription = (transaction) =>
  transaction.description || (transaction.type === "credit" ? "Credit" : "Payment");

const getTransactionId = (transaction) =>
  transaction._id || transaction.id || "";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function LedgerTransaction({
  customer,
  transaction,
  type,
  onDelete,
  isDeleting,
  isBusy,
}) {
  const isCredit = type === "credit";

  return (
    <article
      className={`flex items-start gap-3 border-b border-[#e8eee8] py-4 last:border-b-0 ${
        isCredit ? "flex-row-reverse text-right" : ""
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isCredit
            ? "bg-[#f8e9e4] text-[#a04436]"
            : "bg-[#e4f0e5] text-[#176044]"
        }`}
      >
        {isCredit ? (
          <FiArrowDownLeft size={17} aria-hidden="true" />
        ) : (
          <FiArrowUpRight size={17} aria-hidden="true" />
        )}
      </span>
      <div className={`min-w-0 flex-1 ${isCredit ? "text-right" : ""}`}>
        <p className="break-words text-sm font-semibold text-[#29463a]">
          {getTransactionDescription(transaction)}
        </p>
        <p className="mt-1 text-xs text-[#718078]">
          {formatDateTime(transaction.createdAt || transaction.date)}
          {!isCredit && transaction.payment ? ` · ${transaction.payment}` : ""}
        </p>
        <p
          className={`mt-1 text-sm font-bold ${
            isCredit ? "text-[#a04436]" : "text-[#176044]"
          }`}
        >
          {isCredit ? "+" : "−"}
          {formatMoney(transaction.amount)}
        </p>
      </div>
      <button
        type="button"
        aria-label={`Delete ${isCredit ? "credit" : "payment"} transaction`}
        title="Delete transaction"
        disabled={isBusy}
        onClick={() => onDelete(customer, transaction, type)}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#a05c48] transition hover:bg-[#f8e9e4] disabled:cursor-not-allowed disabled:opacity-50 ${
          isCredit ? "order-first" : ""
        }`}
      >
        {isDeleting ? (
          <LuLoaderCircle className="animate-spin" size={16} aria-hidden="true" />
        ) : (
          <FiTrash2 size={15} aria-hidden="true" />
        )}
      </button>
    </article>
  );
}

function CustomerDetailsPopup({
  customer,
  onClose,
  onDelete,
  deletingTransactionKey,
  error,
  onDismissError,
}) {
  const credits = getTransactions(customer, "credit");
  const payments = getTransactions(customer, "payment");

  return (
    <Popup
      labelledBy="customerLedgerTitle"
      className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[#e8eee8] bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.2)] sm:p-7"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#397354]">
            Customer ledger
          </p>
          <h2
            id="customerLedgerTitle"
            className="mt-2 truncate text-xl font-bold tracking-tight text-[#18392f]"
          >
            {getCustomerName(customer)}
          </h2>
          <p className="mt-1 text-sm text-[#718078]">
            Outstanding credit:{" "}
            <span className="font-bold text-[#a04436]">
              {formatMoney(customer.creditAmount)}
            </span>
          </p>
        </div>
        <button
          type="button"
          aria-label="Close customer ledger"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[#718078] transition hover:bg-[#edf3ef]"
        >
          <FiX size={18} aria-hidden="true" />
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={onDismissError}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-red-100"
          >
            <FiX size={15} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-[#dce9df] bg-[#f8fbf8] p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e4f0e5] text-[#176044]">
              <FiArrowUpRight size={16} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#176044]">Payments</h3>
              <p className="text-xs text-[#718078]">Cash / online received</p>
            </div>
          </div>
          {payments.length ? (
            payments.map((transaction, index) => {
              const transactionId = getTransactionId(transaction);
              const deleteKey = `${customer._id}:${transactionId}`;
              return (
                <LedgerTransaction
                  key={transactionId || `payment-${index}`}
                  customer={customer}
                  transaction={transaction}
                  type="payment"
                  onDelete={onDelete}
                  isDeleting={deletingTransactionKey === deleteKey}
                  isBusy={Boolean(deletingTransactionKey)}
                />
              );
            })
          ) : (
            <p className="py-6 text-center text-sm text-[#839188]">
              No payments recorded.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-[#f0deda] bg-[#fdf9f8] p-4">
          <div className="mb-2 flex items-center justify-end gap-2">
            <div className="text-right">
              <h3 className="text-sm font-bold text-[#a04436]">Credits</h3>
              <p className="text-xs text-[#718078]">Amount owed</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f8e9e4] text-[#a04436]">
              <FiArrowDownLeft size={16} aria-hidden="true" />
            </span>
          </div>
          {credits.length ? (
            credits.map((transaction, index) => {
              const transactionId = getTransactionId(transaction);
              const deleteKey = `${customer._id}:${transactionId}`;
              return (
                <LedgerTransaction
                  key={transactionId || `credit-${index}`}
                  customer={customer}
                  transaction={transaction}
                  type="credit"
                  onDelete={onDelete}
                  isDeleting={deletingTransactionKey === deleteKey}
                  isBusy={Boolean(deletingTransactionKey)}
                />
              );
            })
          ) : (
            <p className="py-6 text-center text-sm text-[#839188]">
              No credits recorded.
            </p>
          )}
        </section>
      </div>
    </Popup>
  );
}

export default function CustomerLedgerPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingTransactionKey, setDeletingTransactionKey] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;
    const loadCustomers = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await axiosInstance.get("/customer/all");
        if (isCurrentRequest) {
          if (!Array.isArray(response.data?.customers)) {
            throw new Error("Unexpected customer list response.");
          }
          setCustomers(response.data.customers);
        }
      } catch (requestError) {
        if (isCurrentRequest) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Unable to load customer ledgers. Please try again.",
          );
        }
      } finally {
        if (isCurrentRequest) setIsLoading(false);
      }
    };
    loadCustomers();

    return () => {
      isCurrentRequest = false;
    };
  }, [refresh]);

  const recentTransactions = useMemo(
    () =>
      customers
        .flatMap((customer) => [
          ...getTransactions(customer, "credit").map((transaction) => ({
            customer,
            transaction,
            type: "credit",
          })),
          ...getTransactions(customer, "payment").map((transaction) => ({
            customer,
            transaction,
            type: "payment",
          })),
        ])
        .sort(
          (left, right) =>
            getTransactionTime(right.transaction) -
            getTransactionTime(left.transaction),
        )
        .slice(0, 10),
    [customers],
  );

  const totalOutstanding = customers.reduce(
    (total, customer) => total + Number(customer.creditAmount || 0),
    0,
  );

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleTypeChange = (event) => {
    const type = event.target.value;
    setForm((current) => ({
      ...current,
      type,
      payment: type === "payment" ? current.payment || "Cash" : "",
    }));
  };

  const handleCreateTransaction = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const customerName = form.customerName.trim();
    const description = form.description.trim();
    const amount = Number(form.amount);
    if (customerName.length < 2) {
      setError("Enter a customer name with at least 2 characters.");
      return;
    }
    if (description.length < 2) {
      setError("Enter a description with at least 2 characters.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    setIsSaving(true);
    try {
      await axiosInstance.post("/customer/create", {
        customerName,
        description,
        type: form.type,
        ...(form.type === "payment" ? { payment: form.payment } : {}),
        amount,
      });
      setForm(initialForm);
      setIsFormOpen(false);
      setMessage("Customer ledger transaction added.");
      setRefresh((current) => current + 1);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to add this customer transaction. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTransaction = async (customer, transaction, type) => {
    const transactionId = getTransactionId(transaction);
    if (!customer._id || !transactionId) {
      setError("This transaction is missing an ID and cannot be deleted.");
      return;
    }

    const deletionKey = `${customer._id}:${transactionId}`;
    setDeletingTransactionKey(deletionKey);
    setError("");
    try {
      await axiosInstance.delete(
        `/customer/transaction/${encodeURIComponent(customer._id)}/${encodeURIComponent(transactionId)}`,
        { data: { type } },
      );
      setSelectedCustomer((current) =>
        current?._id === customer._id ? null : current,
      );
      setRefresh((current) => current + 1);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete this ledger transaction. Please try again.",
      );
    } finally {
      setDeletingTransactionKey("");
    }
  };

  const customerOptions = customers.map((customer) => (
    <button
      key={customer._id}
      type="button"
      onClick={() => {
        setError("");
        setSelectedCustomer(customer);
      }}
      className="flex w-full items-center gap-3 rounded-xl border border-[#e8eee8] bg-white p-4 text-left transition hover:border-[#a9c59e] hover:bg-[#f8fbf8]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e4f0e5] text-[#176044]">
        <FiUser size={18} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-[#29463a]">
          {getCustomerName(customer)}
        </span>
        <span className="mt-1 block text-xs text-[#718078]">
          {getTransactions(customer, "credit").length} credits ·{" "}
          {getTransactions(customer, "payment").length} payments
        </span>
      </span>
      <span className="text-right">
        <span className="block text-[10px] font-bold uppercase text-[#839188]">
          Owed
        </span>
        <span className="mt-1 block text-sm font-bold text-[#a04436]">
          {formatMoney(customer.creditAmount)}
        </span>
      </span>
    </button>
  ));

  return (
    <div className="space-y-5">
      <section
        aria-label="Customer ledger summary"
        className="grid gap-3 sm:grid-cols-2"
      >
        <article className="rounded-2xl border border-[#dce6de] bg-[#e4f0e5] p-5 shadow-[0_6px_22px_rgba(24,57,47,0.04)]">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#718078]">
            Customers
          </p>
          <p className="mt-3 text-2xl font-bold text-[#18392f]">
            {customers.length}
          </p>
        </article>
        <article className="rounded-2xl border border-[#f0deda] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.04)]">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#718078]">
            Total outstanding credit
          </p>
          <p className="mt-3 text-2xl font-bold text-[#a04436]">
            {formatMoney(totalOutstanding)}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-[#dce6de] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.04)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#18392f]">
              Add customer ledger entry
            </h2>
            <p className="mt-1 text-sm text-[#718078]">
              Record credit or a cash/online payment.
            </p>
          </div>
          {!isFormOpen && (
            <button
              type="button"
              onClick={() => {
                setError("");
                setMessage("");
                setIsFormOpen(true);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#176044] px-4 text-sm font-bold text-white transition hover:bg-[#124d36]"
            >
              <FiPlus size={16} aria-hidden="true" />
              Add entry
            </button>
          )}
          {isFormOpen && (
            <button
              type="button"
              aria-label="Close customer entry form"
              onClick={() => setIsFormOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#718078] transition hover:bg-[#edf3ef]"
            >
              <FiX size={17} aria-hidden="true" />
            </button>
          )}
        </div>

        {isFormOpen && (
          <form
            onSubmit={handleCreateTransaction}
            className="mt-5 grid gap-4 rounded-2xl border border-[#e8eee8] bg-[#f9fbf9] p-4 sm:grid-cols-2"
          >
            <label
              className="block text-xs font-semibold text-[#52685d]"
              htmlFor="customerName"
            >
              Customer name
              <input
                id="customerName"
                name="customerName"
                value={form.customerName}
                onChange={updateForm}
                autoComplete="off"
                placeholder="Customer name"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
              />
            </label>

            <label
              className="block text-xs font-semibold text-[#52685d]"
              htmlFor="customerEntryType"
            >
              Entry type
              <select
                id="customerEntryType"
                name="type"
                value={form.type}
                onChange={handleTypeChange}
                className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
              >
                <option value="credit">Credit</option>
                <option value="payment">Payment</option>
              </select>
            </label>

            <label
              className="block text-xs font-semibold text-[#52685d]"
              htmlFor="customerDescription"
            >
              Description
              <input
                id="customerDescription"
                name="description"
                value={form.description}
                onChange={updateForm}
                placeholder="What was this entry for?"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              {form.type === "payment" && (
                <label
                  className="block text-xs font-semibold text-[#52685d]"
                  htmlFor="customerPaymentMethod"
                >
                  Payment method
                  <select
                    id="customerPaymentMethod"
                    name="payment"
                    value={form.payment}
                    onChange={updateForm}
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                  >
                    <option>Cash</option>
                    <option>Online</option>
                  </select>
                </label>
              )}
              <label
                className="block text-xs font-semibold text-[#52685d]"
                htmlFor="customerAmount"
              >
                Amount
                <input
                  id="customerAmount"
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={updateForm}
                  placeholder="0"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                />
              </label>
            </div>

            <div className="sm:col-span-2">
              {error && (
                <p role="alert" className="mb-3 text-sm text-red-700">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#176044] text-sm font-bold text-white transition hover:bg-[#124d36] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? (
                  <LuLoaderCircle className="animate-spin text-xl" />
                ) : (
                  `Save ${form.type}`
                )}
              </button>
            </div>
          </form>
        )}
        {message && (
          <p role="status" className="mt-3 text-sm text-[#176044]">
            {message}
          </p>
        )}
      </section>

      {error && !isFormOpen && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-red-100"
          >
            <FiX size={15} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-[#dce6de] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.04)] sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight text-[#18392f]">
              Customers
            </h2>
            <p className="mt-1 text-sm text-[#718078]">
              Select a customer to view their full ledger.
            </p>
          </div>
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <LuLoaderCircle
                  className="animate-spin text-2xl text-[#397354]"
                  aria-label="Loading customers"
                />
              </div>
            ) : customers.length ? (
              customerOptions
            ) : (
              <p className="rounded-xl border border-dashed border-[#d7e1da] px-4 py-8 text-center text-sm text-[#839188]">
                No customer entries yet. Add a credit or payment to get started.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[#dce6de] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.04)] sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight text-[#18392f]">
              Recent customer transactions
            </h2>
            <p className="mt-1 text-sm text-[#718078]">
              Latest credits and payments across your customers.
            </p>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LuLoaderCircle
                className="animate-spin text-2xl text-[#397354]"
                aria-label="Loading transactions"
              />
            </div>
          ) : recentTransactions.length ? (
            <div className="divide-y divide-[#e8eee8]">
              {recentTransactions.map(({ customer, transaction, type }, index) => (
                <button
                  key={
                    getTransactionId(transaction) ||
                    `${customer._id}-${type}-${index}`
                  }
                  type="button"
                  onClick={() => setSelectedCustomer(customer)}
                  className="flex w-full items-center gap-3 py-3 text-left transition hover:bg-[#fbfdfb]"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      type === "credit"
                        ? "bg-[#f8e9e4] text-[#a04436]"
                        : "bg-[#e4f0e5] text-[#176044]"
                    }`}
                  >
                    {type === "credit" ? (
                      <FiArrowDownLeft size={17} aria-hidden="true" />
                    ) : (
                      <FiArrowUpRight size={17} aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#29463a]">
                      {getCustomerName(customer)} ·{" "}
                      {getTransactionDescription(transaction)}
                    </span>
                    <span className="mt-1 block text-xs text-[#718078]">
                      {type === "credit" ? "Credit" : "Payment"}
                      {transaction.payment ? ` · ${transaction.payment}` : ""}
                      {" · "}
                      {formatDateTime(transaction.createdAt || transaction.date)}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-sm font-bold ${
                      type === "credit" ? "text-[#a04436]" : "text-[#176044]"
                    }`}
                  >
                    {type === "credit" ? "+" : "−"}
                    {formatMoney(transaction.amount)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[#d7e1da] px-4 py-8 text-center text-sm text-[#839188]">
              No customer transactions yet.
            </p>
          )}
        </section>
      </div>

      {selectedCustomer && (
        <CustomerDetailsPopup
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onDelete={handleDeleteTransaction}
          deletingTransactionKey={deletingTransactionKey}
          error={error}
          onDismissError={() => setError("")}
        />
      )}
    </div>
  );
}
