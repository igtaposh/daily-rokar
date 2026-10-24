import { useContext, useEffect, useState } from "react";
import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiBookOpen,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiEdit2,
  FiFileText,
  FiLogOut,
  FiPlus,
  FiUser,
  FiX,
  FiUsers,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { AuthContext } from "../context/AuthContext";
import { LuLoaderCircle } from "react-icons/lu";
import axiosInstance, { setAuthToken } from "../api/axiosInstance";
import { RecordContext } from "../context/RecordContext";
import { AepsContext } from "../context/AepsContext";
import DashboardSummary from "../components/dashboard/DashboardSummary";
import CashFlowChart from "../components/dashboard/CashFlowChart";
import TransactionsSection from "../components/dashboard/TransactionsSection";
import DeleteTransactionPopup from "../components/dashboard/DeleteTransactionPopup";
import ProfilePopup from "../components/dashboard/ProfilePopup";
import Popup from "../components/dashboard/Popup";
import AepsLedgerPage from "../components/dashboard/AepsLedgerPage";
const getDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const getDateKeyForOffset = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return getDateKey(date);
};

const getPeriodDateRange = (period, selectedStartDate, selectedEndDate) => {
  const todayKey = getDateKey();
  const startDate =
    period === "Today"
      ? todayKey
      : period === "Last 7 days"
        ? getDateKeyForOffset(6)
        : period === "This month"
          ? `${todayKey.slice(0, 7)}-01`
          : selectedStartDate;
  const endDate = period === "Custom range" ? selectedEndDate : todayKey;

  return { startDate, endDate };
};

const navigationItems = [
  { id: "shop", label: "Shop Ledger", icon: FiBookOpen },
  { id: "aeps", label: "AEPS Transactions", icon: FiCreditCard },
  { id: "customers", label: "Customer Ledger", icon: FiUsers },
  { id: "billing", label: "Billing", icon: FiFileText },
];

const periodOptions = ["Today", "Last 7 days", "This month"];
const paymentOptions = ["Cash", "Online"];
const saleCategories = ["Retail sales", "Online sales", "Other"];
const expenseCategories = [
  "Stock purchase",
  "Rent",
  "Utilities",
  "Transport",
  "Packaging",
  "Other expense",
];
const formatMoney = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));

function Dashboard() {
  const { user, setUser, setToken } = useContext(AuthContext);
  const { records, setRecords } = useContext(RecordContext);
  const { transactions, setTransactions } = useContext(AepsContext);
  const navigate = useNavigate();
  const [weeklyRecords, setWeeklyRecords] = useState([]);
  const [activePage, setActivePage] = useState("shop");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileMode, setProfileMode] = useState("details");
  const [secondsUntilResend, setSecondsUntilResend] = useState(60);
  const [period, setPeriod] = useState("Today");
  const [selectedStartDate, setSelectedStartDate] = useState(getDateKey);
  const [selectedEndDate, setSelectedEndDate] = useState(getDateKey);
  const [rangeStartDraft, setRangeStartDraft] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(`${getDateKey()}T12:00:00`),
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [recordsRefresh, setRecordsRefresh] = useState(0);
  const [deletingTransactionKey, setDeletingTransactionKey] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);
  const [entryType, setEntryType] = useState("sale");
  const [entryForm, setEntryForm] = useState({
    description: "",
    category: saleCategories[0],
    amount: 0,
    payment: "Cash",
    type: "withdrawal",
    name: "",
    adharNumber: "",
  });
  const [editableProfileFields, setEditableProfileFields] = useState({
    shopName: false,
    name: false,
  });
  const [loading, setLoading] = useState(false);
  const [screenLoading, setScreenLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [passwordloading, setPasswordLoading] = useState(false);
  const [userForm, setUserForm] = useState({
    shopName: user?.shopName ?? "",
    password: "",
    name: user?.name ?? "",
    confirmPassword: "",
    otp: "",
  });
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });
  const [formError, setFormError] = useState({});
  const [errorPopup, setErrorPopup] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setUserForm((prev) => ({ ...prev, [name]: value }));

    if (formError[name]) {
      setFormError((prev) => ({ ...prev, [name]: "" }));
    }
  };

  useEffect(() => {
    setUserForm((prev) => ({
      ...prev,
      shopName: user?.shopName ?? "",
      name: user?.name ?? "",
    }));
  }, [user]);

  const validateForm = (formType) => {
    const errors = {};
    if (formType === "profile") {
      if (editableProfileFields.name) {
        if (!userForm.name) {
          errors.name = "Name is required";
        } else if (
          userForm.name.trim().length < 3 ||
          userForm.name.trim().length > 20
        ) {
          errors.name = "Name must be between 3 and 20 characters long";
        }
      }

      if (editableProfileFields.shopName) {
        if (!userForm.shopName) {
          errors.shopName = "Shop name is required";
        } else if (
          userForm.shopName.trim().length < 3 ||
          userForm.shopName.trim().length > 30
        ) {
          errors.shopName =
            "Shop name must be between 3 and 30 characters long";
        }
      }
    } else if (formType === "otp") {
      const otp = userForm.otp?.trim().replace(/\D/g, "").slice(0, 6);
      if (!otp) {
        errors.otp = "OTP is required";
      } else if (otp.length !== 6) {
        errors.otp = "Please enter a valid 6-digit OTP";
      }
    } else if (formType === "password") {
      if (!userForm.password.trim()) {
        errors.password = "Please enter a password";
      } else if (userForm.password.length < 8) {
        errors.password = "Password must be at least 8 characters long";
      }

      if (!userForm.confirmPassword?.trim()) {
        errors.confirmPassword = "Please confirm your password";
      } else if (userForm.password !== userForm.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    } else if (formType === "entry" && entryType === "AEPS") {
      if (!entryForm.amount) {
        errors.amount = "Amount is required";
      } else if (entryForm.amount <= 0 || entryForm.amount >= 10000000) {
        errors.amount = "Amount can't be 0 or more than 10000000";
      }
      if (!entryForm.name) {
        errors.name = "Name is required";
      } else if (entryForm.name.length < 3) {
        errors.name = "Please enter a valid name";
      }
      if (entryForm.adharNumber) {
        if (entryForm.adharNumber.length != 12) {
          errors.adharNumber = "Please enter a valid adhar number";
        }
      }
    } else if (
      formType === "entry" &&
      (entryType === "sale" || entryType === "expense")
    ) {
      if (!entryForm.description?.trim()) {
        errors.description = "Description is required";
      } else if (
        entryForm.description.trim().length < 3 ||
        entryForm.description.trim().length > 30
      ) {
        errors.description =
          "Description must be between 3 and 30 characters long";
      }
      if (!entryForm.amount) {
        errors.amount = "Amount is required";
      } else if (entryForm.amount <= 0 || entryForm.amount >= 10000000) {
        errors.amount = "Amount can't be 0 or more than 10000000";
      }
    }

    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (profileMode !== "verify" || secondsUntilResend === 0) return undefined;

    const timeoutId = window.setTimeout(() => {
      setSecondsUntilResend((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [secondsUntilResend, profileMode]);

  useEffect(() => {
    const fetchUserData = async () => {
      setMessage({ type: "", text: "" });
      setScreenLoading(true);
      try {
        const res = await axiosInstance.get("/user");

        if (res?.status === 200) {
          setUser(res.data.user);
        }
      } catch {
        setErrorPopup(true);
        setError(
          "Fetched an error while retriving your data. Please try after some time.",
        );
      } finally {
        setScreenLoading(false);
      }
    };
    fetchUserData();
  }, [setUser]);

  useEffect(() => {
    let isCurrentRequest = true;
    const { startDate, endDate } = getPeriodDateRange(
      period,
      selectedStartDate,
      selectedEndDate,
    );

    const fetchRecordData = async () => {
      try {
        const res = await axiosInstance.get(
          `/record/all/?startDate=${startDate}&endDate=${endDate}`,
        );

        if (isCurrentRequest && res?.status === 200) {
          setRecords(res.data.data);
        }
      } catch {
        if (isCurrentRequest) {
          setErrorPopup(true);
          setError(
            "Fetched an error while retriving your data. Please try after some time.",
          );
        }
      }
    };

    setRecords([]);
    fetchRecordData();

    return () => {
      isCurrentRequest = false;
    };
  }, [period, selectedStartDate, selectedEndDate, recordsRefresh, setRecords]);

  useEffect(() => {
    let isCurrentRequest = true;
    const { startDate, endDate } = getPeriodDateRange(
      period,
      selectedStartDate,
      selectedEndDate,
    );

    const fetchAepsData = async () => {
      try {
        const res = await axiosInstance.get(
          `/aeps/all?startDate=${startDate}&endDate=${endDate}`,
        );

        if (isCurrentRequest && res?.status === 200) {
          setTransactions(res.data.aeps);
        }
      } catch {
        if (isCurrentRequest) {
          setErrorPopup(true);
          setError(
            "Unable to load AEPS transactions for this period. Please try again.",
          );
        }
      }
    };

    setTransactions([]);
    fetchAepsData();

    return () => {
      isCurrentRequest = false;
    };
  }, [
    period,
    selectedStartDate,
    selectedEndDate,
    recordsRefresh,
    setTransactions,
  ]);

  useEffect(() => {
    let isCurrentRequest = true;
    const todayKey = getDateKey();
    const startDate = getDateKeyForOffset(6);

    const fetchWeeklyRecords = async () => {
      try {
        const res = await axiosInstance.get(
          `/record/all/?startDate=${startDate}&endDate=${todayKey}`,
        );

        if (isCurrentRequest && res?.status === 200) {
          setWeeklyRecords(res.data.data);
        }
      } catch {
        if (isCurrentRequest) {
          setErrorPopup(true);
          setError(
            "Unable to load your last seven days of cash flow. Please try again.",
          );
        }
      }
    };

    fetchWeeklyRecords();

    return () => {
      isCurrentRequest = false;
    };
  }, [recordsRefresh]);

  const countdownText = `${String(Math.floor(secondsUntilResend / 60)).padStart(2, "0")}:${String(secondsUntilResend % 60).padStart(2, "0")}`;

  const todayKey = getDateKey();
  const periodSales = records
    .filter((transaction) => transaction.type === "sale")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const periodExpenses = records
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const getPaymentTotals = (type) =>
    ["Cash", "Online"].map((payment) => ({
      payment,
      amount: records
        .filter(
          (transaction) =>
            transaction.type === type &&
            transaction.payment?.toLowerCase() === payment.toLowerCase(),
        )
        .reduce((total, transaction) => total + transaction.amount, 0),
    }));
  const salePaymentTotals = getPaymentTotals("sale");
  const expensePaymentTotals = getPaymentTotals("expense");
  const weeklySummary = Array.from({ length: 7 }, (_, index) => {
    const dateKey = getDateKeyForOffset(6 - index);
    const entriesForDate = weeklyRecords.filter(
      (transaction) => formatDate(transaction.createdAt) === dateKey,
    );
    return {
      dateKey,
      label: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(
        new Date(`${dateKey}T12:00:00`),
      ),
      sales: entriesForDate
        .filter((transaction) => transaction.type === "sale")
        .reduce((total, transaction) => total + transaction.amount, 0),
      expenses: entriesForDate
        .filter((transaction) => transaction.type === "expense")
        .reduce((total, transaction) => total + transaction.amount, 0),
    };
  });
  const maxChartValue = Math.max(
    1,
    ...weeklySummary.flatMap((day) => [day.sales, day.expenses]),
  );
  const profileInitials = (user?.name ?? "")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const firstCalendarDate = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    1 -
      new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth(),
        1,
      ).getDay(),
  );
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstCalendarDate);
    day.setDate(firstCalendarDate.getDate() + index);
    return day;
  });
  const formatCalendarDate = (dateKey) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(`${dateKey}T12:00:00`));
  const formattedSelectedRange =
    selectedStartDate === selectedEndDate
      ? formatCalendarDate(selectedStartDate)
      : `${formatCalendarDate(selectedStartDate)} – ${formatCalendarDate(selectedEndDate)}`;
  const calendarMonthLabel = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(calendarMonth);

  const openProfileEditor = () => {
    setProfileMode("details");
    setIsProfileOpen(true);
  };

  const handleSentOtp = async () => {
    setMessage({ type: "", text: "" });
    setPasswordLoading(true);

    try {
      const res = await axiosInstance.post("/user/sent-otp", {
        email: user.email,
      });

      if (res?.status === 200) {
        setMessage({
          type: "success",
          text: "An 6 digit code has been sent to your email.",
        });

        setProfileMode("verify");
      }
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message || "Otp sent failed. Please try again.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };
  const handleResentOtp = async () => {
    setMessage({ type: "", text: "" });

    try {
      const res = await axiosInstance.post("/user/sent-otp", {
        email: user.email,
      });

      if (res?.status === 200) {
        setMessage({
          type: "success",
          text: "An 6 digit code has been sent to your email.",
        });
        setSecondsUntilResend(60);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message || "Otp sent failed. Please try again.",
      });
    }
  };
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validateForm("otp")) {
      return;
    }
    setLoading(true);

    try {
      const res = await axiosInstance.post("/user/verify-otp", {
        email: user.email,
        otp: userForm.otp,
      });

      if (res?.status === 200) {
        setMessage({
          type: "success",
          text: "OTP verified successfully",
        });

        setProfileMode("new-password");
      }
    } catch (err) {
      console.log(err);
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Otp verification failed. Please try again.",
      });
    } finally {
      setUserForm((prev) => ({ ...prev, otp: "" }));
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validateForm("password")) {
      return;
    }
    setLoading(true);

    try {
      const res = await axiosInstance.patch("/user/update-password", {
        email: user.email,
        password: userForm.confirmPassword,
      });

      if (res?.status === 200) {
        setMessage({
          type: "success",
          text: "Password changed.",
        });

        setMessage({ type: "", text: "" });
        setProfileMode("complete");
      }
    } catch (err) {
      console.log(err);
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Changing password failed. Please try again.",
      });
    } finally {
      setUserForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
      setLoading(false);
    }
  };
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!editableProfileFields.name && !editableProfileFields.shopName) {
      setMessage({
        type: "error",
        text: "Please edit any of the fields then try again.",
      });
      return;
    }

    if (!validateForm("profile")) {
      return;
    }

    setLoading(true);

    try {
      const profileUpdates = {
        ...(editableProfileFields.name && { name: userForm.name }),
        ...(editableProfileFields.shopName && {
          shopName: userForm.shopName,
        }),
      };
      const res = await axiosInstance.patch("/user/update", profileUpdates);

      if (res?.status === 200) {
        setIsProfileOpen(false);
        setEditableProfileFields({ shopName: false, name: false });
        setUserForm((prev) => ({
          ...prev,
          name: res.data.user.name,
          shopName: res.data.user.shopName,
        }));
        setUser({
          ...user,
          name: res.data.user.name,
          email: res.data.user.email,
          shopName: res.data.user.shopName,
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Account updatation failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
    setMessage({ type: "", text: "" });
    setLogoutLoading(true);

    try {
      const res = await axiosInstance.post("/user/logout");

      if (res?.status === 200) {
        setMessage({
          type: "success",
          text: "User logged out successfully.",
        });

        navigate("/login", { replace: true });
        setAuthToken(null);
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          "User log out failed. Please try again.",
      });
    } finally {
      setLogoutLoading(false);
    }
  };

  const openEntryForm = (type) => {
    const categories = type === "sale" ? saleCategories : expenseCategories;
    setEntryType(type);
    setEntryForm({
      description: "",
      category: categories[0],
      amount: "",
      payment: "Cash",
      type: "withdrawal",
      name: "",
      adharNumber: "",
    });
    setMessage({
      type: "",
      text: "",
    });
    setIsEntryFormOpen(true);
  };

  const handleEntryTypeChange = (type) => {
    setEntryType(type);
    setEntryForm((currentForm) => ({
      ...currentForm,
      category: type === "sale" ? saleCategories[0] : expenseCategories[0],
    }));
  };

  const handleCreateAEPSTransaction = async (e) => {
    e.preventDefault();
    setMessage({
      type: "",
      text: "",
    });
    if (!validateForm("entry")) {
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post("/aeps/add", {
        amount: entryForm.amount,
        type: entryForm.type,
        name: entryForm.name,
        adharNumber: entryForm.adharNumber,
      });

      if (res?.status === 201) {
        const newAEPS = res.data.newAEPS;
        const isWithdrawal = newAEPS.type?.toLowerCase() === "withdrawal";
        const balanceField = isWithdrawal ? "aepsOnline" : "aeps";
        const amount = Number(newAEPS.amount);
        setUser((currentUser) => {
          if (!currentUser) return currentUser;

          return {
            ...currentUser,
            ...(res.data.user || {
              [balanceField]:
                Number(currentUser[balanceField] ?? 0) + amount,
            }),
          };
        });

        setMessage({
          type: "success",
          text: `AEPS transaction record created successfully.`,
        });
        setRecordsRefresh((refresh) => refresh + 1);
        setIsEntryFormOpen(false);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Transaction creation failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCreateSaleRecord = async (e, entryType) => {
    if (!entryType) {
      setMessage({
        type: "error",
        text: "Fetching error while creating any record. Please give us a moment.",
      });
    }
    e.preventDefault();
    setMessage({
      type: "",
      text: "",
    });
    if (!validateForm("entry")) {
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post("/record/add", {
        description: entryForm.description,
        category: entryForm.category,
        type: entryType,
        amount: entryForm.amount,
        payment: entryForm.payment,
      });

      if (res?.status === 201) {
        const newRecord = res.data.newRecord;
        const balanceField =
          newRecord.payment?.toLowerCase() === "online"
            ? "rokarOnline"
            : "rokar";
        const amount = Number(newRecord.amount);
        const amountChange = (newRecord.type === "sale" ? 1 : -1) * amount;
        setUser((currentUser) => {
          if (!currentUser) return currentUser;

          return {
            ...currentUser,
            ...(res.data.user || {
              [balanceField]:
                Number(currentUser[balanceField] ?? 0) + amountChange,
            }),
          };
        });

        setMessage({
          type: "success",
          text: `${entryType} record created successfully.`,
        });
        setRecordsRefresh((refresh) => refresh + 1);
        setTimeout(() => {
          setIsEntryFormOpen(false);
        }, 750);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Record creation failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (record) => {
    const deletionKey = `record:${record._id}`;
    setDeletingTransactionKey(deletionKey);

    try {
      const res = await axiosInstance.delete(
        `/record/delete/${encodeURIComponent(record._id)}`,
      );
      const balanceField =
        record.payment?.toLowerCase() === "online"
          ? "rokarOnline"
          : "rokar";
      const amountChange =
        (record.type === "sale" ? -1 : 1) * Number(record.amount);

      setUser((currentUser) => {
        if (!currentUser) return currentUser;

        return {
          ...currentUser,
          ...(res.data?.user || {
            [balanceField]:
              Number(currentUser[balanceField] ?? 0) + amountChange,
          }),
        };
      });
      setRecordsRefresh((refresh) => refresh + 1);
      setDeleteConfirmation(null);
    } catch (err) {
      setDeleteConfirmation(null);
      setError(
        err?.response?.data?.message ||
          "Unable to delete this record. Please try again.",
      );
      setErrorPopup(true);
    } finally {
      setDeletingTransactionKey("");
    }
  };

  const handleDeleteAepsTransaction = async (transaction) => {
    const deletionKey = `aeps:${transaction._id}`;
    setDeletingTransactionKey(deletionKey);

    try {
      const res = await axiosInstance.delete(
        `/aeps/delete/${encodeURIComponent(transaction._id)}`,
      );
      const balanceField =
        transaction.type?.toLowerCase() === "withdrawal"
          ? "aepsOnline"
          : "aeps";

      setUser((currentUser) => {
        if (!currentUser) return currentUser;

        return {
          ...currentUser,
          ...(res.data?.user || {
            [balanceField]:
              Number(currentUser[balanceField] ?? 0) -
              Number(transaction.amount),
          }),
        };
      });
      setRecordsRefresh((refresh) => refresh + 1);
      setDeleteConfirmation(null);
    } catch (err) {
      setDeleteConfirmation(null);
      setError(
        err?.response?.data?.message ||
          "Unable to delete this AEPS transaction. Please try again.",
      );
      setErrorPopup(true);
    } finally {
      setDeletingTransactionKey("");
    }
  };

  const formattedToday = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const formatRelativeDate = (dateKey) => {
    if (dateKey === getDateKey()) return "Today";
    if (dateKey === getDateKeyForOffset(1)) return "Yesterday";

    return dateKey;
  };

  const handlePageChange = (pageId) => {
    setActivePage(pageId);
    setEntryType(pageId === "aeps" ? "AEPS" : "sale");
    setIsEntryFormOpen(false);
    setFormError({});
    setMessage({ type: "", text: "" });
  };

  const sidebar = (
    <>
      <Link
        to="/"
        className="mb-10 flex w-fit items-center gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-white/70"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
          <img src={logo} alt="DailyRokar" className="h-9 w-9 object-contain" />
        </span>
        <span className="text-lg font-bold">DailyRokar</span>
      </Link>
      <nav aria-label="Dashboard" className="space-y-1">
        {navigationItems.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;

          return (
            <button
              key={id}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => handlePageChange(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition ${
                isActive
                  ? "bg-white/12 text-white shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={17} aria-hidden="true" />
              {label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c2e3a7]" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );

  const metricCards = [
    {
      id: "sales",
      label: "Total sales",
      amount: periodSales,
      detail: `${records.filter((transaction) => transaction.type === "sale").length} sale entries`,
      payments: salePaymentTotals,
      icon: FiArrowUpRight,
      tone: "text-[#397354] bg-[#e4f0e5]",
    },
    {
      id: "expenses",
      label: "Total expenses",
      amount: periodExpenses,
      detail: `${records.filter((transaction) => transaction.type === "expense").length} expense entries`,
      payments: expensePaymentTotals,
      icon: FiArrowDownRight,
      tone: "text-[#a05c48] bg-[#f8e9e4]",
    },
  ];
  const rokarCash = Number(user?.rokar || 0);
  const rokarOnline = Number(user?.rokarOnline || 0);
  const totalRokar = rokarCash + rokarOnline;
  const balanceCards = [
    {
      label: "Total Rokar",
      amount: totalRokar,
      tone: "text-[#18392f]",
      cardTone: "bg-[#e4f0e5]",
    },
    {
      label: "Rokar Cash",
      amount: rokarCash,
      tone: "text-[#397354]",
      cardTone: "bg-white",
    },
    {
      label: "Rokar Online",
      amount: rokarOnline,
      tone: "text-[#526b83]",
      cardTone: "bg-white",
    },
  ];

  return (
    <div className="min-h-screen bg-[#edf2ed] font-[Manrope,sans-serif] text-[#18392f]">
      <div className="mx-auto flex min-h-screen max-w-[1720px]">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 self-start flex-col overflow-y-auto bg-gradient-to-b from-[#164b3b] to-[#10372d] px-6 py-8 text-white shadow-[8px_0_32px_rgba(18,61,49,0.08)] lg:flex">
          {sidebar}
          <div className="mt-auto border-t border-white/15 pt-6">
            <p className="text-xs font-semibold text-[#c2e3a7]">SHOP LEDGER</p>
            <p className="mt-2 text-sm leading-5 text-white/70">
              Your daily sales and expenses, in one place.
            </p>
            <button
              type="button"
              onClick={openProfileEditor}
              className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-3.5 text-left transition hover:bg-white/10"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#c2e3a7] text-sm font-bold text-[#123d31]">
                {profileInitials || <FiUser size={17} aria-hidden="true" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {user?.name}
                </span>
                <span className="block truncate text-xs text-white/60">
                  {user?.shopName}
                </span>
              </span>
              <FiEdit2 size={15} aria-hidden="true" />
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-9 lg:py-8">
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-[#dce6de] bg-white px-4 py-3 shadow-sm lg:hidden">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src={logo}
                alt="DailyRokar"
                className="h-9 w-9 object-contain"
              />
              <span className="font-bold">DailyRokar</span>
            </Link>
            <button
              type="button"
              aria-label="Edit profile"
              onClick={openProfileEditor}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d7e1da] bg-[#f7faf8] text-[#64766d] transition hover:bg-[#e4f0e5]"
            >
              <FiUser size={17} aria-hidden="true" />
            </button>
          </div>

          <nav
            aria-label="Dashboard sections"
            className="mb-6 flex gap-1.5 overflow-x-auto rounded-2xl border border-[#dce6de] bg-white p-1.5 shadow-sm lg:hidden"
          >
            {navigationItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-current={activePage === id ? "page" : undefined}
                onClick={() => handlePageChange(id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                  activePage === id
                    ? "bg-[#e4f0e5] text-[#176044]"
                    : "text-[#64766d] hover:bg-[#e4f0e5] hover:text-[#176044]"
                }`}
              >
                <Icon size={15} aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>

          <header
            id="overview"
            className="mb-5 flex flex-col gap-5 rounded-3xl border border-[#dce6de] bg-gradient-to-br from-white via-white to-[#f3f8f3] p-5 shadow-[0_10px_36px_rgba(24,57,47,0.05)] sm:flex-row sm:items-end sm:justify-between sm:p-7"
          >
            <div>
              <p className="inline-flex rounded-full bg-[#e4f0e5] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#397354]">
                {formattedToday}
              </p>
              <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-[#18392f] sm:text-4xl">
                {activePage === "shop"
                  ? "Shop overview"
                  : activePage === "aeps"
                    ? "AEPS transactions"
                    : navigationItems.find((item) => item.id === activePage)
                        ?.label}
              </h1>
              <p className="mt-2 text-sm text-[#64766d]">
                {activePage === "shop"
                  ? "Track what came in, what went out, and what remains."
                  : activePage === "aeps"
                    ? "Manage your AEPS balances and transactions."
                    : "This feature is coming soon."}
              </p>
              {activePage !== "customers" && activePage !== "billing" && (
                <p className="mt-1.5 text-xs text-[#839188]">
                  Live records for your selected date range.
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="inline-flex rounded-xl border border-[#d7e1da] bg-white p-1 shadow-sm"
                  aria-label="Summary period"
                >
                  {periodOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={period === option}
                      onClick={() => {
                        setRangeStartDraft(null);
                        setPeriod(option);
                      }}
                      className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${period === option ? "bg-[#176044] text-white shadow-sm" : "text-[#64766d] hover:bg-[#f1f5f1] hover:text-[#176044]"}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Choose a date range"
                    aria-expanded={isCalendarOpen}
                    onClick={() => setIsCalendarOpen((isOpen) => !isOpen)}
                    className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-xs font-semibold transition ${
                      period === "Custom range"
                        ? "border-[#176044] bg-[#e4f0e5] text-[#176044]"
                        : "border-[#d7e1da] bg-white text-[#52685d] shadow-sm hover:border-[#397354]"
                    }`}
                  >
                    <FiCalendar size={15} aria-hidden="true" />
                    {period === "Custom range"
                      ? formattedSelectedRange
                      : "Pick a date"}
                  </button>
                  {isCalendarOpen && (
                    <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl border border-[#dce6de] bg-white p-4 shadow-[0_16px_48px_rgba(24,57,47,0.16)]">
                      <div className="mb-4 flex items-center justify-between">
                        <button
                          type="button"
                          aria-label="Previous month"
                          onClick={() =>
                            setCalendarMonth(
                              (month) =>
                                new Date(
                                  month.getFullYear(),
                                  month.getMonth() - 1,
                                  1,
                                ),
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#64766d] transition hover:bg-[#edf3ef] hover:text-[#176044]"
                        >
                          <FiChevronLeft size={17} aria-hidden="true" />
                        </button>
                        <p className="text-sm font-bold text-[#18392f]">
                          {calendarMonthLabel}
                        </p>
                        <button
                          type="button"
                          aria-label="Next month"
                          disabled={
                            calendarMonth.getFullYear() ===
                              new Date().getFullYear() &&
                            calendarMonth.getMonth() >= new Date().getMonth()
                          }
                          onClick={() =>
                            setCalendarMonth(
                              (month) =>
                                new Date(
                                  month.getFullYear(),
                                  month.getMonth() + 1,
                                  1,
                                ),
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#64766d] transition hover:bg-[#edf3ef] hover:text-[#176044] disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <FiChevronRight size={17} aria-hidden="true" />
                        </button>
                      </div>
                      <p className="mb-3 text-center text-xs text-[#718078]">
                        {rangeStartDraft
                          ? `Start: ${formatCalendarDate(rangeStartDraft)} · Choose an end date`
                          : "Choose a start date, then an end date"}
                      </p>
                      <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold text-[#839188]">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                          (weekday) => (
                            <span key={weekday} className="py-1">
                              {weekday}
                            </span>
                          ),
                        )}
                      </div>
                      <div className="grid grid-cols-7 gap-y-1">
                        {calendarDays.map((day) => {
                          const dayKey = getDateKey(day);
                          const rangeStart =
                            rangeStartDraft || selectedStartDate;
                          const rangeEnd = rangeStartDraft
                            ? rangeStartDraft
                            : selectedEndDate;
                          const isRangeStart = dayKey === rangeStart;
                          const isRangeEnd = dayKey === rangeEnd;
                          const isInRange =
                            dayKey >= rangeStart && dayKey <= rangeEnd;
                          const isToday = dayKey === todayKey;
                          const isFuture = dayKey > todayKey;
                          const isCurrentMonth =
                            day.getMonth() === calendarMonth.getMonth();

                          return (
                            <button
                              key={dayKey}
                              type="button"
                              disabled={isFuture}
                              aria-label={new Intl.DateTimeFormat("en-IN", {
                                dateStyle: "full",
                              }).format(day)}
                              aria-pressed={isInRange}
                              onClick={() => {
                                if (!rangeStartDraft) {
                                  setRangeStartDraft(dayKey);
                                  return;
                                }

                                const startDate =
                                  dayKey < rangeStartDraft
                                    ? dayKey
                                    : rangeStartDraft;
                                const endDate =
                                  dayKey < rangeStartDraft
                                    ? rangeStartDraft
                                    : dayKey;
                                setSelectedStartDate(startDate);
                                setSelectedEndDate(endDate);
                                setRangeStartDraft(null);
                                setPeriod("Custom range");
                                setIsCalendarOpen(false);
                              }}
                              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs transition disabled:cursor-not-allowed disabled:opacity-30 ${
                                isRangeStart || isRangeEnd
                                  ? "bg-[#176044] font-bold text-white"
                                  : isInRange
                                    ? "bg-[#e4f0e5] font-semibold text-[#176044]"
                                    : isToday
                                      ? "border border-[#a9c59e] font-bold text-[#176044]"
                                      : isCurrentMonth
                                        ? "text-[#52685d] hover:bg-[#edf3ef]"
                                        : "text-[#aab5ad] hover:bg-[#edf3ef]"
                              }`}
                            >
                              {day.getDate()}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStartDate(todayKey);
                          setSelectedEndDate(todayKey);
                          setRangeStartDraft(null);
                          setPeriod("Custom range");
                          setCalendarMonth(new Date(`${todayKey}T12:00:00`));
                          setIsCalendarOpen(false);
                        }}
                        className="mt-3 w-full rounded-md bg-[#f1f5f1] py-2 text-xs font-semibold text-[#176044] transition hover:bg-[#e4f0e5]"
                      >
                        Select today
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutLoading}
                className="hidden h-10 items-center gap-2 rounded-xl border border-[#d7e1da] bg-white px-4 text-sm font-semibold text-[#52685d] shadow-sm transition hover:border-[#397354] hover:text-[#176044] disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
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
          </header>

          {activePage === "shop" ? (
            <>
              <DashboardSummary
                balanceCards={balanceCards}
                metricCards={metricCards}
                formatMoney={formatMoney}
              />

          <section className="mt-5 grid gap-4 xl:grid-cols-[1.55fr_0.85fr]">
            <CashFlowChart
              weeklySummary={weeklySummary}
              maxChartValue={maxChartValue}
              formatMoney={formatMoney}
            />

            <article className="rounded-2xl border border-[#dce6de] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.04)] sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-[#18392f]">
                    Quick entry
                  </h2>
                  <p className="mt-1 text-sm text-[#718078]">
                    Record money in or out
                  </p>
                </div>
                {isEntryFormOpen && (
                  <button
                    type="button"
                    aria-label="Close entry form"
                    onClick={() => setIsEntryFormOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-[#718078] transition hover:bg-[#edf3ef]"
                  >
                    <FiX size={17} aria-hidden="true" />
                  </button>
                )}
              </div>

              {!isEntryFormOpen ? (
                <>
                  <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => openEntryForm("sale")}
                      className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#176044] px-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#124d36] hover:shadow-md"
                    >
                      <FiPlus size={16} aria-hidden="true" /> Record sale
                    </button>
                    <button
                      type="button"
                      onClick={() => openEntryForm("expense")}
                      className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#d7e1da] bg-white px-3 text-xs font-bold text-[#52685d] transition hover:border-[#d9a293] hover:bg-[#fdf8f6] hover:text-[#a05c48]"
                    >
                      <FiPlus size={16} aria-hidden="true" /> Add expense
                    </button>
                  </div>
                </>
              ) : (
                <form
                  onSubmit={(e) => {
                    handleCreateSaleRecord(e, entryType);
                  }}
                  className="mt-5 space-y-4 rounded-2xl border border-[#e8eee8] bg-[#f9fbf9] p-4"
                >
                  <div
                    className="grid grid-cols-2 rounded-xl border border-[#d7e1da] bg-white p-1"
                    aria-label="Entry type"
                  >
                    {["sale", "expense"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        aria-pressed={entryType === type}
                        onClick={() => {
                          setFormError({});
                          handleEntryTypeChange(type);
                        }}
                        className={`h-9 rounded-lg text-xs font-bold capitalize transition ${
                          entryType === type
                            ? {
                                sale: "bg-[#176044] text-white",
                                expense: "bg-[#a05c48] text-white",
                              }[type] || ""
                            : "text-[#718078]"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <label
                    className="block text-xs font-semibold text-[#52685d]"
                    htmlFor="entryDescription"
                  >
                    Description
                    <input
                      id="entryDescription"
                      value={entryForm.description}
                      onChange={(event) =>
                        setEntryForm({
                          ...entryForm,
                          description: event.target.value,
                        })
                      }
                      placeholder="e.g. Counter sales"
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none placeholder:text-[#98a79e] transition focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                    />
                    {formError.description && (
                      <span className="mt-1 block text-xs text-red-600">
                        {formError.description}
                      </span>
                    )}
                  </label>
                  <div
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    <label
                      className="block text-xs font-semibold text-[#52685d]"
                      htmlFor="entryCategory"
                    >
                      Category
                      <select
                        id="entryCategory"
                        value={entryForm.category}
                        onChange={(event) =>
                          setEntryForm({
                            ...entryForm,
                            category: event.target.value,
                          })
                        }
                        className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-xs font-normal text-[#18392f] outline-none transition focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                      >
                        {(entryType === "sale"
                          ? saleCategories
                          : expenseCategories
                        ).map((category) => (
                          <option key={category}>{category}</option>
                        ))}
                      </select>
                      {formError.category && (
                        <span className="mt-1 block text-xs text-red-600">
                          {formError.category}
                        </span>
                      )}
                    </label>
                    <label
                      className="block text-xs font-semibold text-[#52685d]"
                      htmlFor="entryPayment"
                    >
                      Payment
                      <select
                        id="entryPayment"
                        value={entryForm.payment}
                        onChange={(event) =>
                          setEntryForm({
                            ...entryForm,
                            payment: event.target.value,
                          })
                        }
                        className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-xs font-normal text-[#18392f] outline-none transition focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                      >
                        {paymentOptions.map((payment) => (
                          <option key={payment}>{payment}</option>
                        ))}
                      </select>
                      {formError.payment && (
                        <span className="mt-1 block text-xs text-red-600">
                          {formError.payment}
                        </span>
                      )}
                    </label>
                  </div>
                  <label
                    className="block text-xs font-semibold text-[#52685d]"
                    htmlFor="entryAmount"
                  >
                    Amount
                    <input
                      id="entryAmount"
                      type="number"
                      inputMode="numeric"
                      value={entryForm.amount}
                      onChange={(event) =>
                        setEntryForm({
                          ...entryForm,
                          amount: event.target.value,
                        })
                      }
                      placeholder="0"
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none placeholder:text-[#98a79e] transition focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                    />
                    {formError.amount && (
                      <span className="mt-1 block text-xs text-red-600">
                        {formError.amount}
                      </span>
                    )}
                  </label>
                  <button
                    type="submit"
                    className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-sm transition hover:shadow-md ${
                      entryType
                        ? {
                            sale: "bg-[#176044] text-white",
                            expense: "bg-[#a05c48] text-white",
                          }[entryType] || ""
                        : "text-[#718078]"
                    }`}
                  >
                    {loading ? (
                      <LuLoaderCircle className="animate-spin text-2xl" />
                    ) : (
                      <>
                        Save {entryType}
                      </>
                    )}
                  </button>
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
                </form>
              )}
            </article>
          </section>

          <TransactionsSection
            records={records}
            period={period}
            transactionFilter={transactionFilter}
            setTransactionFilter={setTransactionFilter}
            deletingTransactionKey={deletingTransactionKey}
            setDeleteConfirmation={setDeleteConfirmation}
            formatDate={formatDate}
            formatMoney={formatMoney}
            formatRelativeDate={formatRelativeDate}
          />

          <p className="mt-5 text-center text-xs text-[#839188]">
            DailyRokar · Shop ledger
          </p>
            </>
          ) : activePage === "aeps" ? (
            <AepsLedgerPage
              transactions={transactions}
              period={period}
              user={user}
              entryForm={entryForm}
              setEntryForm={setEntryForm}
              formError={formError}
              message={message}
              loading={loading}
              isEntryFormOpen={isEntryFormOpen}
              onOpenEntry={() => openEntryForm("AEPS")}
              onCloseEntry={() => {
                setIsEntryFormOpen(false);
                setFormError({});
                setMessage({ type: "", text: "" });
              }}
              onSubmitEntry={handleCreateAEPSTransaction}
              deletingTransactionKey={deletingTransactionKey}
              setDeleteConfirmation={setDeleteConfirmation}
              formatDate={formatDate}
              formatMoney={formatMoney}
              formatRelativeDate={formatRelativeDate}
            />
          ) : (
            <section className="rounded-2xl border border-[#dce6de] bg-white px-6 py-16 text-center shadow-[0_6px_22px_rgba(24,57,47,0.04)]">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e4f0e5] text-[#176044]">
                {activePage === "customers" ? (
                  <FiUsers size={24} aria-hidden="true" />
                ) : (
                  <FiFileText size={24} aria-hidden="true" />
                )}
              </span>
              <h2 className="mt-5 font-serif text-2xl font-semibold text-[#18392f]">
                {navigationItems.find((item) => item.id === activePage)?.label}
              </h2>
              <p className="mt-2 text-sm text-[#718078]">
                This feature is coming soon.
              </p>
            </section>
          )}
        </main>
      </div>
      {deleteConfirmation && (
        <DeleteTransactionPopup
          transaction={deleteConfirmation}
          isDeleting={Boolean(deletingTransactionKey)}
          onClose={() => setDeleteConfirmation(null)}
          onConfirm={() => {
            if (deleteConfirmation.kind === "aeps") {
              handleDeleteAepsTransaction(deleteConfirmation.transaction);
            } else {
              handleDeleteRecord(deleteConfirmation.transaction);
            }
          }}
          formatMoney={formatMoney}
        />
      )}
      {isProfileOpen && (
        <ProfilePopup
          profileMode={profileMode}
          setProfileMode={setProfileMode}
          user={user}
          userForm={userForm}
          formError={formError}
          message={message}
          editableProfileFields={editableProfileFields}
          setEditableProfileFields={setEditableProfileFields}
          handleInputChange={handleInputChange}
          handleSaveProfile={handleSaveProfile}
          handleSentOtp={handleSentOtp}
          handleLogout={handleLogout}
          handleVerifyOtp={handleVerifyOtp}
          handleResentOtp={handleResentOtp}
          handleChangePassword={handleChangePassword}
          loading={loading}
          passwordloading={passwordloading}
          logoutLoading={logoutLoading}
          secondsUntilResend={secondsUntilResend}
          countdownText={countdownText}
          onClose={() => {
            setEditableProfileFields({ shopName: false, name: false });
            setIsProfileOpen(false);
            setMessage({ type: "", text: "" });
          }}
        />
      )}
      {errorPopup && (
        <Popup
          label="Dashboard error"
          className="w-full max-w-115 rounded-lg bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.2)] sm:p-7"
        >
            <div className="rounded-lg border px-3 py-2 text-sm border-red-200 bg-red-50 text-red-700">
              {error}
            </div>
            <button
              onClick={() => setErrorPopup(false)}
              className="group mt-2 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#176044] px-4 text-sm font-bold text-white transition hover:bg-[#124d36] focus:outline-none focus:ring-4 focus:ring-[#176044]/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              OK
            </button>
        </Popup>
      )}
      {screenLoading && (
        <Popup
          label="Loading dashboard"
          className="w-full flex justify-center items-center max-w-115 rounded-lgsm:p-7"
        >
          <LuLoaderCircle className="animate-spin text-3xl" />
        </Popup>
      )}
    </div>
  );
}

export default Dashboard;
