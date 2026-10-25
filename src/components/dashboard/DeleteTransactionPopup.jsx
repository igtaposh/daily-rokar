import { FiTrash2, FiX } from "react-icons/fi";
import { LuLoaderCircle } from "react-icons/lu";
import Popup from "./Popup";

export default function DeleteTransactionPopup({
  transaction,
  isDeleting,
  onClose,
  onConfirm,
  formatMoney,
}) {
  const isAeps = transaction.kind === "aeps";
  const isCashManagement = transaction.kind === "cms";
  const item = transaction.transaction;

  return (
    <Popup
      role="alertdialog"
      labelledBy="deleteTransactionTitle"
      describedBy="deleteTransactionDescription"
      overlayClassName="fixed inset-0 z-[60] flex items-center justify-center bg-[#10291f]/60 p-4 backdrop-blur-[2px]"
      className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e8eee8] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
    >
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f8e9e4] text-[#a05c48]">
          <FiTrash2 size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="deleteTransactionTitle"
            className="text-lg font-bold tracking-tight text-[#18392f]"
          >
            Delete this {isAeps ? "AEPS " : isCashManagement ? "cash " : ""}
            {item.type}?
          </h2>
          <p
            id="deleteTransactionDescription"
            className="mt-2 text-sm leading-6 text-[#64766d]"
          >
            This will permanently remove the transaction and adjust the matching
            balance. This action cannot be undone.
          </p>
        </div>
        <button
          type="button"
          aria-label="Cancel deletion"
          disabled={isDeleting}
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#718078] transition hover:bg-[#edf3ef] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiX size={17} aria-hidden="true" />
        </button>
      </div>

      <div className="mx-5 mb-5 rounded-xl border border-[#e8eee8] bg-[#f7faf8] px-4 py-3 sm:mx-6">
        <p className="truncate text-sm font-semibold text-[#29463a]">
          {isAeps || isCashManagement
            ? item.name ||
              (isCashManagement ? "Cash transaction" : "AEPS transaction")
            : item.description || "Ledger transaction"}
        </p>
        <p className="mt-1 text-xs capitalize text-[#718078]">
          {isAeps ? "AEPS · " : isCashManagement ? `${item.method} · ` : ""}
          {item.type} · {formatMoney(item.amount)}
        </p>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-[#e8eee8] bg-[#fbfcfb] p-4 sm:flex-row sm:justify-end sm:px-6">
        <button
          type="button"
          disabled={isDeleting}
          onClick={onClose}
          className="h-10 rounded-lg border border-[#d7e1da] bg-white px-4 text-sm font-semibold text-[#52685d] transition hover:bg-[#f1f5f1] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isDeleting}
          onClick={onConfirm}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#a04436] px-4 text-sm font-bold text-white transition hover:bg-[#87372d] focus:outline-none focus:ring-4 focus:ring-[#a04436]/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isDeleting ? (
            <>
              <LuLoaderCircle
                className="animate-spin"
                size={16}
                aria-hidden="true"
              />
              Deleting…
            </>
          ) : (
            <>
              <FiTrash2 size={15} aria-hidden="true" />
              Delete transaction
            </>
          )}
        </button>
      </div>
    </Popup>
  );
}
