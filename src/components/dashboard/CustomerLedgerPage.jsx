import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import { LuLoaderCircle } from "react-icons/lu";
import axiosInstance from "../../api/axiosInstance.js";
import formatDateTime from "./formatDateTime";

const initialForm = {
  name: "",
  address: "",
  email: "",
  phone: "",
};

const initialTransactionForm = {
  customerId: "",
  type: "credit",
  amount: "",
  description: "",
  payment: "Cash",
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
  return Array.isArray(customer.ledgers)
    ? customer.ledgers.filter((transaction) => transaction.type === type)
    : [];
};

const getTransactionDescription = (transaction) =>
  transaction.description ||
  (transaction.type === "credit" ? "Credit" : "Payment");

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
      className={`flex items-start gap-3 border-b  py-4 last:border-b-0 ${
        isCredit
          ? "flex-row-reverse text-right border-b-[#f0deda]"
          : " border-b-[#dce9df]"
      }`}
    >
      <div className={`min-w-0 flex-1 ${isCredit ? "text-right" : ""}`}>
        <p
          className={`mt-1 text-md font-bold ${
            isCredit ? "text-[#a04436]" : "text-[#176044]"
          }`}
        >
          {isCredit ? "+" : "−"}
          {formatMoney(transaction.amount)}
        </p>
        <p className="break-words text-sm font-semibold text-[#29463a]">
          {getTransactionDescription(transaction)}
        </p>
        <p className="mt-1 text-xs text-[#718078]">
          {formatDateTime(transaction.createdAt || transaction.date)}
          {!isCredit && transaction.payment ? ` · ${transaction.payment}` : ""}
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
          <LuLoaderCircle
            className="animate-spin"
            size={16}
            aria-hidden="true"
          />
        ) : (
          <FiTrash2 size={15} aria-hidden="true" />
        )}
      </button>
    </article>
  );
}

function CustomerDetailsPage({
  customer,
  onBack,
  onDelete,
  deletingTransactionKey,
  error,
  onDismissError,
  isLoading,
  isEditing,
  customerForm,
  onCustomerFormChange,
  onUpdateCustomer,
  isUpdatingCustomer,
  updateMessage,
  isDeleteConfirmationOpen,
  onRequestDelete,
  onCancelDelete,
  onDeleteCustomer,
  isDeletingCustomer,
}) {
  const credits = getTransactions(customer, "credit");
  const payments = getTransactions(customer, "payment");

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#dce6de] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.04)] sm:p-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-[#d7e1da] px-3 text-sm font-semibold text-[#52685d] transition hover:border-[#397354] hover:text-[#176044]"
        >
          <FiArrowLeft size={16} aria-hidden="true" />
          All customers
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#397354]">
              Customer ledger
            </p>
            <h2
              id="customerLedgerTitle"
              className="mt-2 truncate text-2xl font-bold tracking-tight text-[#18392f]"
            >
              {getCustomerName(customer)}
            </h2>
            <p className="mt-1 text-sm text-[#718078]">
              Outstanding credit:{" "}
              <span className="font-bold text-[#a04436]">
                {formatMoney(customer.creditAmount)}
              </span>
            </p>
            <p className="mt-1 text-sm text-[#718078]">
              {customer.phone || "No phone"}{" "}
              {customer.email ? ` · ${customer.email}` : ""}
            </p>
            {customer.address && (
              <p className="mt-1 text-sm text-[#718078]">{customer.address}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onCustomerFormChange(null, true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d7e1da] px-3 text-sm font-semibold text-[#52685d] transition hover:border-[#397354] hover:text-[#176044]"
            >
              <FiEdit2 size={15} aria-hidden="true" />
              Edit customer
            </button>
            <button
              type="button"
              onClick={onRequestDelete}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#f0deda] px-3 text-sm font-semibold text-[#a04436] transition hover:bg-[#fdf4f2]"
            >
              <FiTrash2 size={15} aria-hidden="true" />
              Delete customer
            </button>
          </div>
        </div>

        {isEditing && (
          <form
            onSubmit={onUpdateCustomer}
            className="mt-5 grid gap-4 rounded-2xl border border-[#e8eee8] bg-[#f9fbf9] p-4 sm:grid-cols-2"
          >
            {[
              ["name", "Customer name"],
              ["phone", "Phone"],
              ["email", "Email"],
              ["address", "Address"],
            ].map(([name, label]) => (
              <label
                key={name}
                className="block text-xs font-semibold text-[#52685d]"
                htmlFor={`edit-customer-${name}`}
              >
                {label}
                <input
                  id={`edit-customer-${name}`}
                  name={name}
                  value={customerForm[name]}
                  onChange={(event) => onCustomerFormChange(event)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                />
              </label>
            ))}
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={isUpdatingCustomer}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#176044] px-4 text-sm font-bold text-white transition hover:bg-[#124d36] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUpdatingCustomer ? (
                  <LuLoaderCircle className="animate-spin" />
                ) : null}
                Save changes
              </button>
              <button
                type="button"
                onClick={() => onCustomerFormChange(null, false)}
                disabled={isUpdatingCustomer}
                className="h-10 rounded-xl border border-[#d7e1da] px-4 text-sm font-semibold text-[#52685d] transition hover:bg-white disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {updateMessage && (
          <p role="status" className="mt-3 text-sm text-[#176044]">
            {updateMessage}
          </p>
        )}
        {isDeleteConfirmationOpen && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-800">
              Delete {getCustomerName(customer)}? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancelDelete}
                disabled={isDeletingCustomer}
                className="h-9 rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onDeleteCustomer}
                disabled={isDeletingCustomer}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-700 px-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isDeletingCustomer && (
                  <LuLoaderCircle className="animate-spin" />
                )}
                Confirm delete
              </button>
            </div>
          </div>
        )}
      </section>

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

      {isLoading && (
        <div
          role="status"
          className="flex items-center justify-center gap-2 rounded-xl border border-[#dce6de] bg-white py-5 text-sm font-semibold text-[#52685d]"
        >
          <LuLoaderCircle
            className="animate-spin text-lg text-[#397354]"
            aria-hidden="true"
          />
          Loading full customer ledger...
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-[#dce9df] bg-[#f8fbf8] p-4">
          <div className="mb-2 flex items-center gap-2 border-b border-b-[#dce9df] pb-2 ">
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
          <div className="mb-2 flex items-center justify-end gap-2 border-b border-b-[#f0deda] pb-2">
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
    </div>
  );
}

export default function CustomerLedgerPage({
  startDate,
  endDate,
  onDateFilterLoadingChange,
}) {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerEditForm, setCustomerEditForm] = useState(initialForm);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [customerUpdateMessage, setCustomerUpdateMessage] = useState("");
  const [isLoadingCustomerLedger, setIsLoadingCustomerLedger] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [transactionForm, setTransactionForm] = useState(
    initialTransactionForm,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingTransaction, setIsSavingTransaction] = useState(false);
  const [deletingTransactionKey, setDeletingTransactionKey] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [transactionError, setTransactionError] = useState("");
  const [transactionMessage, setTransactionMessage] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;
    const loadCustomers = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [customerResponse, ledgerResponse] = await Promise.all([
          axiosInstance.get("/customer"),
          axiosInstance.get("/ledger", {
            params: {
              startDate,
              endDate,
            },
          }),
        ]);
        if (isCurrentRequest) {
          if (
            !Array.isArray(customerResponse.data?.customers) ||
            !Array.isArray(ledgerResponse.data?.ledgers)
          ) {
            throw new Error("Unexpected customer list response.");
          }
          const ledgersByCustomer = new Map();
          ledgerResponse.data.ledgers.forEach((ledger) => {
            const customerId =
              typeof ledger.customerId === "object"
                ? ledger.customerId?._id
                : ledger.customerId;
            if (!customerId) return;
            const customerLedgers = ledgersByCustomer.get(customerId) || [];
            customerLedgers.push(ledger);
            ledgersByCustomer.set(customerId, customerLedgers);
          });

          setCustomers(
            customerResponse.data.customers.map((customer) => {
              const ledgers = ledgersByCustomer.get(customer._id) || [];
              const creditAmount = ledgers.reduce(
                (balance, ledger) =>
                  balance +
                  (ledger.type === "credit" ? 1 : -1) *
                    Number(ledger.amount || 0),
                0,
              );
              return {
                ...customer,
                ledgers,
                creditAmount: Number(customer.amountBalance ?? creditAmount),
              };
            }),
          );
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
        if (isCurrentRequest) {
          setIsLoading(false);
          onDateFilterLoadingChange?.(false);
        }
      }
    };
    loadCustomers();

    return () => {
      isCurrentRequest = false;
    };
  }, [refresh, startDate, endDate, onDateFilterLoadingChange]);

  const recentTransactions = useMemo(() => {
    const transactions = customers
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
      );

    return transactions;
  }, [customers]);

  const totalOutstanding = customers.reduce(
    (total, customer) => total + Number(customer.creditAmount || 0),
    0,
  );

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const updateTransactionForm = (event) => {
    const { name, value } = event.target;
    setTransactionForm((current) => ({ ...current, [name]: value }));
  };

  const handleTransactionTypeChange = (event) => {
    const type = event.target.value;
    setTransactionForm((current) => ({
      ...current,
      type,
      payment: type === "payment" ? current.payment || "Cash" : "Cash",
    }));
  };

  const handleCreateLedgerEntry = async (event) => {
    event.preventDefault();
    setTransactionError("");
    setTransactionMessage("");

    const amount = Number(transactionForm.amount);
    const description = transactionForm.description.trim();

    if (
      !customers.some((customer) => customer._id === transactionForm.customerId)
    ) {
      setTransactionError("Select a customer for this ledger entry.");
      return;
    }
    if (!Number.isFinite(amount) || amount < 1) {
      setTransactionError("Enter an amount of at least ₹1.");
      return;
    }
    if (description && description.length < 5) {
      setTransactionError("Description must contain at least 5 characters.");
      return;
    }

    setIsSavingTransaction(true);
    try {
      await axiosInstance.post(
        `/ledger/create/${encodeURIComponent(transactionForm.customerId)}`,
        {
          type: transactionForm.type,
          amount,
          description,
          ...(transactionForm.type === "payment"
            ? { payment: transactionForm.payment }
            : {}),
        },
      );
      setTransactionForm(initialTransactionForm);
      setTransactionMessage(
        transactionForm.type === "credit"
          ? "Credit added to the customer ledger."
          : "Payment received and added to the customer ledger.",
      );
      setRefresh((current) => current + 1);
    } catch (requestError) {
      setTransactionError(
        requestError.response?.data?.message ||
          "Unable to save this ledger entry. Please try again.",
      );
    } finally {
      setIsSavingTransaction(false);
    }
  };

  const handleCreateCustomer = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const name = form.name.trim();
    const address = form.address.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();
    if (name.length < 2) {
      setError("Enter a customer name with at least 2 characters.");
      return;
    }
    if (address) {
      if (address.length < 2) {
        setError("Enter a description with at least 2 characters.");
        return;
      }
    }
    if (phone) {
      if (phone.length != 10) {
        setError("Phone number can't be more or less than 10.");
        return;
      }
    }
    setIsSaving(true);
    try {
      await axiosInstance.post("/customer/create", {
        name,
        address,
        phone,
        email,
      });
      setForm(initialForm);
      setIsFormOpen(false);
      setMessage("Customer added successfully.");
      setRefresh((current) => current + 1);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to add this customer. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenCustomerLedger = async (customer) => {
    setSelectedCustomer(customer);
    setIsLoadingCustomerLedger(true);
    setError("");
    setIsEditingCustomer(false);
    setIsDeleteConfirmationOpen(false);
    setCustomerUpdateMessage("");
    try {
      const response = await axiosInstance.get(
        `/ledger/${encodeURIComponent(customer._id)}`,
      );
      if (!Array.isArray(response.data?.ledgers)) {
        throw new Error("Unexpected customer ledger response.");
      }
      setSelectedCustomer((current) =>
        current?._id === customer._id
          ? { ...current, ledgers: response.data.ledgers }
          : current,
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to load this customer ledger. Please try again.",
      );
    } finally {
      setIsLoadingCustomerLedger(false);
    }
  };

  const handleCustomerFormChange = (event, editing) => {
    if (event) {
      const { name, value } = event.target;
      setCustomerEditForm((current) => ({ ...current, [name]: value }));
      return;
    }

    if (editing) {
      setCustomerEditForm({
        name: selectedCustomer.name || "",
        phone: selectedCustomer.phone || "",
        email: selectedCustomer.email || "",
        address: selectedCustomer.address || "",
      });
      setError("");
      setCustomerUpdateMessage("");
      setIsEditingCustomer(true);
      return;
    }

    setIsEditingCustomer(false);
    setError("");
  };

  const handleUpdateCustomer = async (event) => {
    event.preventDefault();
    if (!selectedCustomer?._id) return;

    const updates = {
      name: customerEditForm.name.trim(),
      phone: customerEditForm.phone.trim(),
      email: customerEditForm.email.trim(),
      address: customerEditForm.address.trim(),
    };

    if (updates.name.length < 3) {
      setError("Customer name must contain at least 3 characters.");
      return;
    }
    if (updates.phone && !/^[6-9]\d{9}$/.test(updates.phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (updates.address && updates.address.length < 5) {
      setError("Address must contain at least 5 characters.");
      return;
    }

    setIsUpdatingCustomer(true);
    setError("");
    setCustomerUpdateMessage("");
    try {
      const response = await axiosInstance.patch(
        `/customer/update/${encodeURIComponent(selectedCustomer._id)}`,
        updates,
      );
      const updatedCustomer = response.data?.updatedCustomer;
      if (!updatedCustomer) {
        throw new Error("Unexpected customer update response.");
      }

      const mergedCustomer = {
        ...selectedCustomer,
        ...updatedCustomer,
        ledgers: selectedCustomer.ledgers,
        creditAmount: selectedCustomer.creditAmount,
      };
      setCustomers((current) =>
        current.map((customer) =>
          customer._id === mergedCustomer._id ? mergedCustomer : customer,
        ),
      );
      setSelectedCustomer(mergedCustomer);
      setIsEditingCustomer(false);
      setCustomerUpdateMessage("Customer details updated.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to update this customer. Please try again.",
      );
    } finally {
      setIsUpdatingCustomer(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer?._id) return;

    setIsDeletingCustomer(true);
    setError("");
    try {
      await axiosInstance.delete(
        `/customer/delete/${encodeURIComponent(selectedCustomer._id)}`,
      );
      setCustomers((current) =>
        current.filter((customer) => customer._id !== selectedCustomer._id),
      );
      setSelectedCustomer(null);
      setIsDeleteConfirmationOpen(false);
      setRefresh((current) => current + 1);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete this customer. Please try again.",
      );
    } finally {
      setIsDeletingCustomer(false);
    }
  };

  const handleDeleteTransaction = async (customer, transaction) => {
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
        `/ledger/delete/${encodeURIComponent(transactionId)}`,
      );
      setSelectedCustomer((current) =>
        current?._id === customer._id
          ? {
              ...current,
              ledgers: (current.ledgers || []).filter(
                (ledger) => getTransactionId(ledger) !== transactionId,
              ),
              creditAmount:
                Number(current.creditAmount || 0) +
                (transaction.type === "credit" ? -1 : 1) *
                  Number(transaction.amount || 0),
            }
          : current,
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
      onClick={() => handleOpenCustomerLedger(customer)}
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

  if (selectedCustomer) {
    return (
      <CustomerDetailsPage
        customer={selectedCustomer}
        onBack={() => {
          setSelectedCustomer(null);
          setError("");
          setIsEditingCustomer(false);
          setIsDeleteConfirmationOpen(false);
        }}
        onDelete={handleDeleteTransaction}
        deletingTransactionKey={deletingTransactionKey}
        error={error}
        onDismissError={() => setError("")}
        isLoading={isLoadingCustomerLedger}
        isEditing={isEditingCustomer}
        customerForm={customerEditForm}
        onCustomerFormChange={handleCustomerFormChange}
        onUpdateCustomer={handleUpdateCustomer}
        isUpdatingCustomer={isUpdatingCustomer}
        updateMessage={customerUpdateMessage}
        isDeleteConfirmationOpen={isDeleteConfirmationOpen}
        onRequestDelete={() => {
          setError("");
          setIsDeleteConfirmationOpen(true);
        }}
        onCancelDelete={() => setIsDeleteConfirmationOpen(false)}
        onDeleteCustomer={handleDeleteCustomer}
        isDeletingCustomer={isDeletingCustomer}
      />
    );
  }

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

      <section className="grid items-start gap-5 rounded-2xl border border-[#dce6de] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.04)] sm:p-6 lg:grid-cols-[7fr_3fr]">
        <div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#18392f]">
              Create a credit or receive a payment
            </h2>
            <p className="mt-1 text-sm text-[#718078]">
              Record a customer credit or a payment received against their
              balance.
            </p>
          </div>

          <form
            onSubmit={handleCreateLedgerEntry}
            className="mt-5 grid gap-4 rounded-2xl border border-[#e8eee8] bg-[#f9fbf9] p-4 sm:grid-cols-2"
          >
            <label
              className="block text-xs font-semibold text-[#52685d]"
              htmlFor="ledger-customer"
            >
              Customer
              <select
                id="ledger-customer"
                name="customerId"
                value={transactionForm.customerId}
                onChange={updateTransactionForm}
                required
                disabled={isLoading || !customers.length}
                className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10 disabled:cursor-not-allowed disabled:bg-[#f1f4f1]"
              >
                <option value="">
                  {customers.length
                    ? "Select a customer"
                    : "No customers available"}
                </option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {getCustomerName(customer)}
                  </option>
                ))}
              </select>
            </label>
            <label
              className="block text-xs font-semibold text-[#52685d]"
              htmlFor="ledger-type"
            >
              Entry type
              <select
                id="ledger-type"
                name="type"
                value={transactionForm.type}
                onChange={handleTransactionTypeChange}
                className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
              >
                <option value="credit">Credit given</option>
                <option value="payment">Payment received</option>
              </select>
            </label>
            <label
              className="block text-xs font-semibold text-[#52685d]"
              htmlFor="ledger-amount"
            >
              Amount
              <input
                id="ledger-amount"
                name="amount"
                type="number"
                min="1"
                step="0.01"
                value={transactionForm.amount}
                onChange={updateTransactionForm}
                required
                placeholder="Enter amount"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
              />
            </label>
            {transactionForm.type === "payment" && (
              <label
                className="block text-xs font-semibold text-[#52685d]"
                htmlFor="ledger-payment"
              >
                Payment received by
                <select
                  id="ledger-payment"
                  name="payment"
                  value={transactionForm.payment}
                  onChange={updateTransactionForm}
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                >
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                </select>
              </label>
            )}
            <label
              className="block text-xs font-semibold text-[#52685d] sm:col-span-2"
              htmlFor="ledger-description"
            >
              Description{" "}
              <span className="font-normal text-[#839188]">(optional)</span>
              <input
                id="ledger-description"
                name="description"
                value={transactionForm.description}
                onChange={updateTransactionForm}
                placeholder="Add a note (at least 5 characters)"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
              />
            </label>
            <div className="sm:col-span-2">
              {transactionError && (
                <p role="alert" className="mb-3 text-sm text-red-700">
                  {transactionError}
                </p>
              )}
              <button
                type="submit"
                disabled={isSavingTransaction || isLoading || !customers.length}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#176044] text-sm font-bold text-white transition hover:bg-[#124d36] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingTransaction ? (
                  <LuLoaderCircle className="animate-spin text-xl" />
                ) : transactionForm.type === "credit" ? (
                  "Save credit"
                ) : (
                  "Record payment"
                )}
              </button>
              {transactionMessage && (
                <p role="status" className="mt-3 text-sm text-[#176044]">
                  {transactionMessage}
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-[#e8eee8] bg-[#f9fbf9] p-4 sm:p-5">
          <h3 className="text-base font-bold tracking-tight text-[#18392f]">
            Add a customer
          </h3>
          <p className="mt-1 text-sm text-[#718078]">
            Create a customer before recording their first entry.
          </p>
          <form onSubmit={handleCreateCustomer} className="mt-4 space-y-4">
            <label
              className="block text-xs font-semibold text-[#52685d]"
              htmlFor="name"
            >
              Customer name
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={updateForm}
                autoComplete="off"
                placeholder="Customer name"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
              />
            </label>
            <label
              className="block text-xs font-semibold text-[#52685d]"
              htmlFor="phone"
            >
              Customer phone
              <input
                id="phone"
                name="phone"
                value={form.phone.replace(/\D/g, "").slice(0, 10)}
                maxLength={10}
                onChange={updateForm}
                autoComplete="off"
                placeholder="Customer phone"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
              />
            </label>
            <label
              className="block text-xs font-semibold text-[#52685d]"
              htmlFor="email"
            >
              Customer email
              <input
                id="email"
                name="email"
                value={form.email}
                onChange={updateForm}
                autoComplete="off"
                placeholder="Customer email"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
              />
            </label>

            {error && (
              <p role="alert" className="text-sm text-red-700">
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
                "Save customer"
              )}
            </button>
          </form>
          {message && (
            <p role="status" className="mt-3 text-sm text-[#176044]">
              {message}
            </p>
          )}
        </div>
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
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#18392f]">
                Recent customer transactions
              </h2>
              <p className="mt-1 text-sm text-[#718078]">
                {startDate && endDate
                  ? startDate === endDate
                    ? `Credits and payments for ${startDate}.`
                    : `Credits and payments from ${startDate} to ${endDate}.`
                  : "Latest credits and payments across your customers."}
              </p>
            </div>
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
              {recentTransactions.map(
                ({ customer, transaction, type }, index) => (
                  <button
                    key={
                      getTransactionId(transaction) ||
                      `${customer._id}-${type}-${index}`
                    }
                    type="button"
                    onClick={() => handleOpenCustomerLedger(customer)}
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
                        {formatDateTime(
                          transaction.createdAt || transaction.date,
                        )}
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
                ),
              )}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[#d7e1da] px-4 py-8 text-center text-sm text-[#839188]">
              {startDate || endDate
                ? "No customer transactions for this date range."
                : "No customer transactions yet."}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
