import {
  FiArrowLeft,
  FiCheck,
  FiLogOut,
  FiRefreshCw,
  FiSave,
  FiX,
} from "react-icons/fi";
import { LuLoaderCircle, LuPencil } from "react-icons/lu";
import Popup from "./Popup";

export default function ProfilePopup({
  profileMode,
  setProfileMode,
  user,
  userForm,
  formError,
  message,
  editableProfileFields,
  setEditableProfileFields,
  handleInputChange,
  handleSaveProfile,
  handleSentOtp,
  handleLogout,
  handleVerifyOtp,
  handleResentOtp,
  handleChangePassword,
  loading,
  passwordloading,
  logoutLoading,
  secondsUntilResend,
  countdownText,
  onClose,
}) {
  return (
    <Popup
      labelledBy="profileDialogTitle"
      className="w-full max-w-xl rounded-3xl border border-[#e8eee8] bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.2)] sm:p-7"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-[#397354]">Account</p>
          <h2
            id="profileDialogTitle"
            className="mt-2 text-xl font-bold tracking-tight text-[#18392f]"
          >
            {profileMode === "details"
              ? "Edit profile details"
              : profileMode === "verify"
                ? "Verify your email"
                : profileMode === "new-password"
                  ? "Choose a new password"
                  : "Password updated"}
          </h2>
        </div>
        <button
          type="button"
          aria-label="Close profile editor"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-md text-[#718078] hover:bg-[#edf3ef]"
        >
          <FiX size={18} aria-hidden="true" />
        </button>
      </div>

      {profileMode === "details" && (
        <>
          <div className="mb-5 rounded-xl border border-[#e6eee8] bg-[#f7faf8] p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#397354]">
              Profile details
            </p>
            <p className="mt-1 text-sm text-[#64766d]">
              Update your business profile and account security.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-4">
              <div className="rounded-xl border border-[#e6eee8] bg-[#f9fbfa] p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <label
                    className="text-sm font-semibold text-[#29463a]"
                    htmlFor="shopName"
                  >
                    Shop name
                  </label>
                  <button
                    type="button"
                    aria-label="Edit shop name"
                    onClick={() =>
                      setEditableProfileFields((fields) => ({
                        ...fields,
                        shopName: !fields.shopName,
                      }))
                    }
                    className="inline-flex items-center gap-1 rounded-full border border-[#d7e1da] px-2.5 py-1.5 text-xs font-semibold text-[#52685d] transition hover:border-[#397354] hover:text-[#176044]"
                  >
                    {editableProfileFields.shopName ? "Cancel" : "Edit"}
                    <LuPencil size={12} aria-hidden="true" />
                  </button>
                </div>
                <input
                  id="shopName"
                  disabled={!editableProfileFields.shopName}
                  name="shopName"
                  value={userForm.shopName}
                  onChange={handleInputChange}
                  className={`${!editableProfileFields.shopName ? "cursor-not-allowed bg-[#edf2ef] text-[#718078]" : "bg-white text-[#18392f]"} mt-2 h-11 w-full rounded-md border border-[#d7e1da] px-3 text-sm font-normal outline-none transition focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10`}
                />
              </div>

              <div className="rounded-xl border border-[#e6eee8] bg-[#f9fbfa] p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <label
                    className="text-sm font-semibold text-[#29463a]"
                    htmlFor="profileFullName"
                  >
                    Full name
                  </label>
                  <button
                    type="button"
                    aria-label="Edit full name"
                    onClick={() =>
                      setEditableProfileFields((fields) => ({
                        ...fields,
                        name: !fields.name,
                      }))
                    }
                    className="inline-flex items-center gap-1 rounded-full border border-[#d7e1da] px-2.5 py-1.5 text-xs font-semibold text-[#52685d] transition hover:border-[#397354] hover:text-[#176044]"
                  >
                    {editableProfileFields.name ? "Cancel" : "Edit"}
                    <LuPencil size={12} aria-hidden="true" />
                  </button>
                </div>
                <input
                  disabled={!editableProfileFields.name}
                  id="profileFullName"
                  name="name"
                  autoComplete="name"
                  onChange={handleInputChange}
                  value={userForm.name}
                  className={`${!editableProfileFields.name ? "cursor-not-allowed bg-[#edf2ef] text-[#718078]" : "bg-white text-[#18392f]"} mt-2 h-11 w-full rounded-md border border-[#d7e1da] px-3 text-sm font-normal outline-none transition focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10`}
                />
              </div>
            </div>

            {message.text && (
              <div
                className={`rounded-lg border px-3 py-2 text-sm ${
                  message.type === "error"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-green-200 bg-green-50 text-green-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              className="group mt-2 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#176044] px-4 text-sm font-bold text-white transition hover:bg-[#124d36] focus:outline-none focus:ring-4 focus:ring-[#176044]/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <LuLoaderCircle className="animate-spin text-2xl" />
              ) : (
                <>
                  Save profile
                  <FiSave size={16} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <section className="mt-5 rounded-xl border border-[#e8eee8] bg-[#f8faf8] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-[#29463a]">
                  Password
                </h3>
                <p className="mt-1 text-xs text-[#718078]">
                  Verify {user?.email} before changing it.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSentOtp}
                className="h-9 shrink-0 rounded-md border border-[#d7e1da] bg-white px-3 text-sm font-semibold text-[#52685d] transition hover:border-[#397354] hover:text-[#176044]"
              >
                {passwordloading ? (
                  <LuLoaderCircle className="animate-spin text-2xl" />
                ) : (
                  "Change password"
                )}
              </button>
            </div>
          </section>

          <div className="mt-4 border-t border-[#e8eee8] pt-3">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-[#a05c48] transition hover:bg-[#f8e9e4]"
            >
              {logoutLoading ? (
                <LuLoaderCircle className="animate-spin text-2xl" />
              ) : (
                <>
                  <FiLogOut size={16} aria-hidden="true" />
                  Log out
                </>
              )}
            </button>
          </div>
        </>
      )}

      {profileMode === "verify" && (
        <>
          <p className="text-sm leading-6 text-[#64766d]">
            Confirm access to{" "}
            <span className="font-semibold text-[#29463a]">{user?.email}</span>{" "}
            before setting a new password.
          </p>

          <form onSubmit={handleVerifyOtp} className="mt-4 space-y-4">
            <label
              className="block text-sm font-semibold text-[#29463a]"
              htmlFor="passwordVerificationCode"
            >
              Email verification code
              <input
                id="otp"
                name="otp"
                value={userForm.otp.replace(/\D/g, "").slice(0, 6)}
                onChange={handleInputChange}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className="mt-2 h-11 w-full rounded-md border border-[#d7e1da] px-3 text-center text-lg font-semibold text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
              />
              {formError.otp && (
                <span className="mt-1 block text-xs text-red-600">
                  {formError.otp}
                </span>
              )}
            </label>
            {message.text && (
              <div
                className={`rounded-lg border px-3 py-2 text-sm ${
                  message.type === "error"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-green-200 bg-green-50 text-green-700"
                }`}
              >
                {message.text}
              </div>
            )}
            <button
              type="submit"
              className="h-10 flex items-center justify-center w-full rounded-md bg-[#176044] px-4 text-sm font-bold text-white transition hover:bg-[#124d36]"
            >
              {loading ? (
                <LuLoaderCircle className="animate-spin text-2xl" />
              ) : (
                "Verify email"
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p aria-live="polite" className="text-sm text-[#687970]">
              {secondsUntilResend > 0
                ? "You can request another code when the timer ends."
                : "Didn't receive a code? Request another one."}
            </p>
            <button
              type="button"
              disabled={secondsUntilResend > 0}
              onClick={handleResentOtp}
              aria-label={
                secondsUntilResend > 0
                  ? `Resend verification code in ${countdownText}`
                  : "Resend verification code"
              }
              className="mt-2 inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold text-[#176044] transition hover:bg-[#e4f0e5] disabled:cursor-not-allowed disabled:text-[#98a79e] disabled:hover:bg-transparent"
            >
              <FiRefreshCw size={15} aria-hidden="true" />
              {secondsUntilResend > 0
                ? `Resend code in ${countdownText}`
                : "Resend code"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setProfileMode("details")}
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm font-semibold text-[#64766d] hover:text-[#176044]"
          >
            <FiArrowLeft size={15} aria-hidden="true" /> Back to profile
          </button>
        </>
      )}

      {profileMode === "new-password" && (
        <>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <label
              className="block text-sm font-semibold text-[#29463a]"
              htmlFor="password"
            >
              New password
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={userForm.password}
                onChange={handleInputChange}
                className="mt-2 h-11 w-full rounded-md border border-[#d7e1da] px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
              />
              {formError.password && (
                <span className="mt-1 block text-xs text-red-600">
                  {formError.password}
                </span>
              )}
            </label>
            <label
              className="block text-sm font-semibold text-[#29463a]"
              htmlFor="confirmPassword"
            >
              Confirm new password
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={userForm.confirmPassword}
                onChange={handleInputChange}
                className="mt-2 h-11 w-full rounded-md border border-[#d7e1da] px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
              />
              {formError.confirmPassword && (
                <span className="mt-1 block text-xs text-red-600">
                  {formError.confirmPassword}
                </span>
              )}
            </label>
            {message.text && (
              <div
                className={`rounded-lg border px-3 py-2 text-sm ${
                  message.type === "error"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-green-200 bg-green-50 text-green-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              className="h-10 flex items-center justify-center w-full rounded-md bg-[#176044] px-4 text-sm font-bold text-white transition hover:bg-[#124d36]"
            >
              {loading ? (
                <LuLoaderCircle className="animate-spin text-2xl" />
              ) : (
                "Change Password"
              )}
            </button>
          </form>
          <button
            type="button"
            onClick={() => setProfileMode("details")}
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm font-semibold text-[#64766d] hover:text-[#176044]"
          >
            <FiArrowLeft size={15} aria-hidden="true" /> Back to profile
          </button>
        </>
      )}

      {profileMode === "complete" && (
        <div className="py-3 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e4f0e5] text-[#397354]">
            <FiCheck size={23} aria-hidden="true" />
          </span>
          <p className="mt-4 font-semibold text-[#29463a]">
            Password changed successfully
          </p>
          <p className="mt-2 text-sm leading-6 text-[#718078]">
            Try not to share your current password with any one except your
            girlfriend if you have one.
          </p>
          <button
            type="button"
            onClick={() => setProfileMode("details")}
            className="mt-5 h-10 rounded-md bg-[#176044] px-4 text-sm font-bold text-white hover:bg-[#124d36]"
          >
            Back to profile
          </button>
        </div>
      )}
    </Popup>
  );
}
