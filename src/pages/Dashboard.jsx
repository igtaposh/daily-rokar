import { useContext, useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiArrowDownRight,
  FiArrowUpRight,
  FiBarChart2,
  FiCalendar,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiEdit2,
  FiGrid,
  FiList,
  FiLogOut,
  FiPlus,
  FiSave,
  FiUser,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { AuthContext } from "../context/AuthContext";
import { LuLoaderCircle, LuPencil } from "react-icons/lu";
import axiosInstance, { setAuthToken } from "../api/axiosInstance";
import { RecordContext } from "../context/RecordContext";
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
  { label: "Overview", href: "#overview", icon: FiGrid },
  { label: "Sales", href: "#sales", icon: FiArrowUpRight },
  { label: "Expenses", href: "#expenses", icon: FiArrowDownRight },
  { label: "Transactions", href: "#transactions", icon: FiList },
  { label: "Cash flow", href: "#cashflow", icon: FiBarChart2 },
];

const periodOptions = ["Today", "Last 7 days", "This month"];
const paymentOptions = ["Cash", "Online"];
const typeOptions = ["Withdrawal", "Deposit"];
const saleCategories = ["Retail sales", "Online sales", "Other"];
const expenseCategories = [
  "Stock purchase",
  "Rent",
  "Utilities",
  "Transport",
  "Packaging",
  "Other expense",
];
const transactionFilters = [
  { label: "All", value: "all" },
  { label: "Sales", value: "sale" },
  { label: "Expenses", value: "expense" },
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
  const navigate = useNavigate();
  const [aepsResult, setAepsResult] = useState({ rangeKey: "", records: [] });
  const [weeklyRecords, setWeeklyRecords] = useState([]);
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
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);
  const [entryType, setEntryType] = useState("sale");
  const [entryForm, setEntryForm] = useState({
    description: "",
    category: saleCategories[0],
    amount: null,
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
    shopName: user?.shopName,
    password: "",
    name: user?.name,
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

  const validateForm = () => {
    const errors = {};
    if (profileMode === "details") {
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
    }

    if (profileMode === "verify") {
      const otp = userForm.otp?.trim().replace(/\D/g, "").slice(0, 6);
      if (!otp) {
        errors.otp = "OTP is required";
      } else if (otp.length !== 6) {
        errors.otp = "Please enter a valid 6-digit OTP";
      }
    }

    if (profileMode === "new-password") {
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
    }

    if (entryType === "AEPS") {
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
    }
    if (entryType === "sale" || entryType === "expense") {
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
          setAepsResult({
            rangeKey: `${startDate}:${endDate}`,
            records: res.data.aeps,
          });
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

    fetchAepsData();

    return () => {
      isCurrentRequest = false;
    };
  }, [period, selectedStartDate, selectedEndDate, recordsRefresh]);

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
  const currentDateRange = getPeriodDateRange(
    period,
    selectedStartDate,
    selectedEndDate,
  );
  const aepsRecords =
    aepsResult.rangeKey ===
    `${currentDateRange.startDate}:${currentDateRange.endDate}`
      ? aepsResult.records
      : [];
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
  const profileInitials = user?.name
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
    if (!validateForm()) {
      return;
    }

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

    if (!validateForm()) {
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

        setTimeout(() => {
          setProfileMode("new-password");
        }, 750);
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
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validateForm()) {
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

        setTimeout(() => {
          setProfileMode("complete");
        }, 750);
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
      setLoading(false);
    }
  };
  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    if (!editableProfileFields.name && !editableProfileFields.shopName) {
      setMessage({
        type: "error",
        text: "Please edit any of the fields then try again.",
      });
      return;
    }

    if (!validateForm()) {
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
        setMessage({
          type: "success",
          text: "Account details updated successfully.",
        });
        setEditableProfileFields({ shopName: false, name: false });
        setUser({
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
    if (!validateForm()) {
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
        setMessage({
          type: "success",
          text: "AEPS transaction created successfully.",
        });
        setRecordsRefresh((refresh) => refresh + 1);
        setTimeout(() => {
          setIsEntryFormOpen(false);
        }, 750);
      }
    } catch (err) {
      console.log(err);
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
    if (!validateForm()) {
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
        setMessage({
          type: "success",
          text: `${entryType} record created successfully.`,
        });
        const balanceField =
          entryForm.payment.toLowerCase() === "online"
            ? "rokarOnline"
            : "rokar";
        const amountChange =
          (entryType === "sale" ? 1 : -1) * Number(entryForm.amount);
        setUser((currentUser) => {
          if (!currentUser) return currentUser;

          return {
            ...currentUser,
            ...(res.data.user || {
              [balanceField]:
                Number(currentUser[balanceField] || 0) + amountChange,
            }),
          };
        });
        console.log(res.data.newRecord);
        setRecordsRefresh((refresh) => refresh + 1);
        setTimeout(() => {
          setIsEntryFormOpen(false);
        }, 750);
      }
    } catch (err) {
      console.log(err);
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
        {navigationItems.map(({ label, href, icon: Icon }, index) => (
          <a
            key={label}
            href={href}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
              index === 0
                ? "bg-white/12 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={17} aria-hidden="true" />
            {label}
            {index === 0 && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c2e3a7]" />
            )}
          </a>
        ))}
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
  const aepsCash = Number(user?.aeps || 0);
  const aepsOnline = Number(user?.aepsOnline || 0);
  const totalAeps = aepsCash + aepsOnline;

  return (
    <div className="min-h-screen bg-[#f1f5f1] text-[#18392f] font-[Manrope,sans-serif]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 self-start flex-col overflow-y-auto bg-[#123d31] px-5 py-7 text-white lg:flex">
          {sidebar}
          <div className="mt-auto border-t border-white/15 pt-5">
            <p className="text-xs font-semibold text-[#c2e3a7]">SHOP LEDGER</p>
            <p className="mt-2 text-sm leading-5 text-white/70">
              Your daily sales and expenses, in one place.
            </p>
            <button
              type="button"
              onClick={openProfileEditor}
              className="mt-5 flex w-full items-center gap-3 rounded-md border border-white/15 p-3 text-left transition hover:bg-white/10"
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

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 md:px-8 md:py-7">
          <div className="mb-5 flex items-center justify-between lg:hidden">
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
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#d7e1da] bg-white text-[#64766d]"
            >
              <FiUser size={17} aria-hidden="true" />
            </button>
          </div>

          <nav
            aria-label="Dashboard sections"
            className="mb-6 flex gap-1 overflow-x-auto border-b border-[#dce6de] pb-2 lg:hidden"
          >
            {navigationItems.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-[#64766d] hover:bg-white hover:text-[#176044]"
              >
                <Icon size={15} aria-hidden="true" />
                {label}
              </a>
            ))}
          </nav>

          <header
            id="overview"
            className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <p className="text-xs font-bold uppercase text-[#397354]">
                {formattedToday}
              </p>
              <h1 className="mt-2 font-serif text-3xl font-semibold text-[#18392f]">
                Shop overview
              </h1>
              <p className="mt-1 text-sm text-[#718078]">
                Track what came in, what went out, and what remains.
              </p>
              <p className="mt-1 text-xs text-[#839188]">
                Live records for your selected date range.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="inline-flex rounded-md border border-[#d7e1da] bg-white p-1"
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
                      className={`rounded px-3 py-1.5 text-xs font-semibold transition ${period === option ? "bg-[#176044] text-white" : "text-[#64766d] hover:text-[#176044]"}`}
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
                        : "border-[#d7e1da] bg-white text-[#52685d] hover:border-[#397354]"
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
              <p
                onClick={handleLogout}
                className="hidden h-9 items-center gap-2 rounded-md border border-[#d7e1da] bg-white px-3 text-sm font-semibold text-[#52685d] transition hover:border-[#397354] hover:text-[#176044] sm:inline-flex"
              >
                {logoutLoading ? (
                  <LuLoaderCircle className="animate-spin text-2xl" />
                ) : (
                  <>
                    <FiLogOut size={16} aria-hidden="true" />
                    Log out
                  </>
                )}
              </p>
            </div>
          </header>

          <section
            aria-label="Rokar balance"
            className="mb-3 grid gap-3 sm:grid-cols-3"
          >
            {[
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
            ].map(({ label, amount, tone, cardTone }) => (
              <article
                key={label}
                className={`rounded-md border border-[#dce6de] p-4 sm:p-5 ${cardTone}`}
              >
                <p className="text-sm font-semibold text-[#64766d]">{label}</p>
                <p className={`mt-2 text-2xl font-bold ${tone}`}>
                  {formatMoney(amount)}
                </p>
              </article>
            ))}
          </section>

          <section
            aria-label="Sales and expense summary"
            className="grid gap-3 md:grid-cols-2"
          >
            {metricCards.map(
              ({ id, label, amount, detail, payments, icon: Icon, tone }) => (
                <article
                  id={id}
                  key={id}
                  className="rounded-md border border-[#dce6de] bg-white p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#64766d]">
                      {label}
                    </p>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-md ${tone}`}
                    >
                      <Icon size={17} aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-[#18392f]">
                    {formatMoney(amount)}
                  </p>
                  <p className="mt-1 text-xs text-[#839188]">{detail}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#e8eee8] pt-3">
                    {payments.map(({ payment, amount: paymentAmount }) => (
                      <div key={payment}>
                        <p className="text-xs font-medium text-[#839188]">
                          {payment}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#29463a]">
                          {formatMoney(paymentAmount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              ),
            )}
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_0.85fr]">
            <article
              id="cashflow"
              className="rounded-md border border-[#dce6de] bg-white p-4 sm:p-6"
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
                    <div className="flex h-32 items-end justify-center gap-1 border-b border-[#e8eee8] sm:gap-1.5">
                      <div
                        title={`Sales ${formatMoney(day.sales)}`}
                        aria-label={`${day.label}: sales ${formatMoney(day.sales)}`}
                        className="w-2.5 rounded-t-sm bg-[#397354] sm:w-4"
                        style={{
                          height: `${Math.max(day.sales ? 5 : 0, (day.sales / maxChartValue) * 112)}px`,
                        }}
                      />
                      <div
                        title={`Expenses ${formatMoney(day.expenses)}`}
                        aria-label={`${day.label}: expenses ${formatMoney(day.expenses)}`}
                        className="w-2.5 rounded-t-sm bg-[#d9a293] sm:w-4"
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
                    {formatMoney(
                      weeklySummary.reduce(
                        (total, day) => total + day.sales,
                        0,
                      ),
                    )}
                  </span>
                </p>
                <p className="text-[#64766d]">
                  7-day expenses{" "}
                  <span className="ml-1 font-bold text-[#a05c48]">
                    {formatMoney(
                      weeklySummary.reduce(
                        (total, day) => total + day.expenses,
                        0,
                      ),
                    )}
                  </span>
                </p>
              </div>
            </article>

            <article className="rounded-md border border-[#dce6de] bg-white p-4 sm:p-6">
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
                    className="flex h-8 w-8 items-center justify-center rounded-md text-[#718078] hover:bg-[#edf3ef]"
                  >
                    <FiX size={17} aria-hidden="true" />
                  </button>
                )}
              </div>

              {!isEntryFormOpen ? (
                <>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => openEntryForm("sale")}
                      className="flex h-11 items-center justify-center gap-2 rounded-md bg-[#176044] px-3 text-xs font-bold text-white transition hover:bg-[#124d36]"
                    >
                      <FiPlus size={16} aria-hidden="true" /> Record sale
                    </button>
                    <button
                      type="button"
                      onClick={() => openEntryForm("expense")}
                      className="flex h-11 items-center justify-center gap-2 rounded-md border border-[#d7e1da] bg-white px-3 text-xs font-bold text-[#52685d] transition hover:border-[#d9a293] hover:text-[#a05c48]"
                    >
                      <FiPlus size={16} aria-hidden="true" /> Add expense
                    </button>
                    <button
                      type="button"
                      onClick={() => openEntryForm("AEPS")}
                      className="flex h-11 items-center justify-center gap-2 rounded-md border border-[#d7e1da] bg-white px-3 text-xs font-bold text-[#52685d] transition hover:border-[#d9a293] hover:text-[#a05c48]"
                    >
                      <FiPlus size={16} aria-hidden="true" /> AEPS
                    </button>
                  </div>
                </>
              ) : (
                <form
                  onSubmit={(e) => {
                    if (entryType == "AEPS") {
                      handleCreateAEPSTransaction(e);
                    } else {
                      handleCreateSaleRecord(e, entryType);
                    }
                  }}
                  className="mt-4 space-y-3"
                >
                  <div
                    className="grid grid-cols-3 rounded-md border border-[#d7e1da] p-1"
                    aria-label="Entry type"
                  >
                    {["sale", "expense", "AEPS"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        aria-pressed={entryType === type}
                        onClick={() => {
                          setFormError({});
                          handleEntryTypeChange(type);
                        }}
                        className={`h-8 rounded text-xs font-bold capitalize ${
                          entryType === type
                            ? {
                                sale: "bg-[#176044] text-white",
                                expense: "bg-[#a05c48] text-white",
                                AEPS: "bg-zinc-900 text-white",
                              }[type] || ""
                            : "text-[#718078]"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  {entryType != "AEPS" ? (
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
                        className="mt-1.5 h-10 w-full rounded-md border border-[#d7e1da] px-3 text-sm font-normal text-[#18392f] outline-none placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                      />
                      {formError.description && (
                        <span className="mt-1 block text-xs text-red-600">
                          {formError.description}
                        </span>
                      )}
                    </label>
                  ) : (
                    <label
                      className="block text-xs font-semibold text-[#52685d]"
                      htmlFor="customerName"
                    >
                      Customer Name
                      <input
                        id="customerName"
                        value={entryForm.name}
                        onChange={(event) =>
                          setEntryForm({
                            ...entryForm,
                            name: event.target.value,
                          })
                        }
                        placeholder="e.g. Khushi Rawat"
                        className="mt-1.5 h-10 w-full rounded-md border border-[#d7e1da] px-3 text-sm font-normal text-[#18392f] outline-none placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                      />
                      {formError.name && (
                        <span className="mt-1 block text-xs text-red-600">
                          {formError.name}
                        </span>
                      )}
                    </label>
                  )}
                  {entryType == "AEPS" && (
                    <label
                      className="block text-xs font-semibold text-[#52685d]"
                      htmlFor="adharNumber"
                    >
                      Aadhar Number
                      <input
                        id="adharNumber"
                        value={entryForm.adharNumber}
                        onChange={(event) =>
                          setEntryForm({
                            ...entryForm,
                            adharNumber: event.target.value,
                          })
                        }
                        placeholder="9834-7366-1887"
                        className="mt-1.5 h-10 w-full rounded-md border border-[#d7e1da] px-3 text-sm font-normal text-[#18392f] outline-none placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                      />
                      {formError.adharNumber && (
                        <span className="mt-1 block text-xs text-red-600">
                          {formError.adharNumber}
                        </span>
                      )}
                    </label>
                  )}
                  <div
                    className={`grid  gap-2 ${entryType == "AEPS" ? "grid-cols-1" : "grid-cols-2 "}`}
                  >
                    {entryType != "AEPS" && (
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
                          className="mt-1.5 h-10 w-full rounded-md border border-[#d7e1da] bg-white px-2 text-xs font-normal text-[#18392f] outline-none focus:border-[#397354]"
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
                    )}
                    {entryType == "AEPS" ? (
                      <label
                        className="block text-xs font-semibold text-[#52685d]"
                        htmlFor="entryPayment"
                      >
                        Transaction
                        <select
                          id="entryPayment"
                          value={entryForm.type}
                          onChange={(event) =>
                            setEntryForm({
                              ...entryForm,
                              type: event.target.value,
                            })
                          }
                          className="mt-1.5 h-10 w-full rounded-md border border-[#d7e1da] bg-white px-2 text-xs font-normal text-[#18392f] outline-none focus:border-[#397354]"
                        >
                          {typeOptions.map((payment) => (
                            <option key={payment}>{payment}</option>
                          ))}
                        </select>
                        {formError.type && (
                          <span className="mt-1 block text-xs text-red-600">
                            {formError.type}
                          </span>
                        )}
                      </label>
                    ) : (
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
                          className="mt-1.5 h-10 w-full rounded-md border border-[#d7e1da] bg-white px-2 text-xs font-normal text-[#18392f] outline-none focus:border-[#397354]"
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
                    )}
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
                      className="mt-1.5 h-10 w-full rounded-md border border-[#d7e1da] px-3 text-sm font-normal text-[#18392f] outline-none placeholder:text-[#98a79e] focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
                    />
                    {formError.amount && (
                      <span className="mt-1 block text-xs text-red-600">
                        {formError.amount}
                      </span>
                    )}
                  </label>
                  <button
                    type="submit"
                    className={`h-10 w-full items-center justify-center flex  rounded-md text-sm font-bold text-white transition ${
                      entryType
                        ? {
                            sale: "bg-[#176044] text-white",
                            expense: "bg-[#a05c48] text-white",
                            AEPS: "bg-zinc-900 text-white",
                          }[entryType] || ""
                        : "text-[#718078]"
                    }`}
                  >
                    {loading ? (
                      <LuLoaderCircle className="animate-spin text-2xl" />
                    ) : (
                      <>
                        Save {entryType == "AEPS" ? "transaction" : entryType}
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

          <section
            id="transactions"
            className="mt-5 rounded-md border border-[#dce6de] bg-white p-4 sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-serif text-xl font-semibold text-[#18392f]">
                  Recent transactions
                </h2>
                <p className="mt-1 text-sm text-[#718078]">
                  Sales and expenses recorded for {period.toLowerCase()}.
                </p>
              </div>
              <div
                className="inline-flex w-fit rounded-md border border-[#d7e1da] bg-white p-1"
                aria-label="Filter transactions"
              >
                {transactionFilters.map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={transactionFilter === value}
                    onClick={() => setTransactionFilter(value)}
                    className={`rounded px-3 py-1.5 text-xs font-semibold transition ${transactionFilter === value ? "bg-[#e4f0e5] text-[#176044]" : "text-[#718078] hover:text-[#176044]"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              {records.length ? (
                records
                  .filter((record) => {
                    if (transactionFilter == "sale") {
                      return record.type == "sale";
                    }
                    if (transactionFilter == "expense") {
                      return record.type == "expense";
                    }

                    return record;
                  })
                  .map((transaction) => (
                    <div
                      key={transaction._id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-[#e8eee8] py-3 sm:grid-cols-[minmax(0,1.6fr)_1fr_0.8fr_auto] sm:gap-4"
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
                        </div>
                      </div>
                      <span className="hidden text-sm text-[#64766d] sm:block">
                        {transaction.payment}
                      </span>
                      <span className="hidden text-sm text-[#718078] sm:block">
                        {formatRelativeDate(formatDate(transaction.createdAt))}
                      </span>
                      <span
                        className={`text-right text-sm font-bold ${transaction.type === "sale" ? "text-[#397354]" : "text-[#a05c48]"}`}
                      >
                        {transaction.type === "sale" ? "+" : "−"}
                        {formatMoney(transaction.amount)}
                      </span>
                    </div>
                  ))
              ) : (
                <p className="border-t border-[#e8eee8] py-8 text-center text-sm text-[#839188]">
                  No transactions for this period.
                </p>
              )}
            </div>
          </section>

          <section
            aria-label="AEPS balance"
            className="mt-5 grid gap-3 sm:grid-cols-3"
          >
            {[
              {
                label: "Total AEPS",
                amount: totalAeps,
                tone: "text-[#18392f]",
                cardTone: "bg-[#e4f0e5]",
              },
              {
                label: "AEPS Cash",
                amount: aepsCash,
                tone: "text-[#397354]",
                cardTone: "bg-white",
              },
              {
                label: "AEPS Online",
                amount: aepsOnline,
                tone: "text-[#526b83]",
                cardTone: "bg-white",
              },
            ].map(({ label, amount, tone, cardTone }) => (
              <article
                key={label}
                className={`rounded-md border border-[#dce6de] p-4 sm:p-5 ${cardTone}`}
              >
                <p className="text-sm font-semibold text-[#64766d]">{label}</p>
                <p className={`mt-2 text-2xl font-bold ${tone}`}>
                  {formatMoney(amount)}
                </p>
              </article>
            ))}
          </section>

          <section
            id="aeps-transactions"
            className="mt-5 rounded-md border border-[#dce6de] bg-white p-4 sm:p-6"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-serif text-xl font-semibold text-[#18392f]">
                  Recent transactions
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
              {aepsRecords.length ? (
                aepsRecords.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-[#e8eee8] py-3 sm:grid-cols-[minmax(0,1.6fr)_1fr_0.8fr_auto] sm:gap-4"
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
                      </div>
                    </div>
                    <span className="hidden text-sm text-[#64766d] sm:block">
                      AEPS
                    </span>
                    <span className="hidden text-sm text-[#718078] sm:block">
                      {formatRelativeDate(formatDate(transaction.createdAt))}
                    </span>
                    <span className="text-right text-sm font-bold text-[#526b83]">
                      {formatMoney(transaction.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="border-t border-[#e8eee8] py-8 text-center text-sm text-[#839188]">
                  No AEPS transactions for this period.
                </p>
              )}
            </div>
          </section>

          <p className="mt-5 text-center text-xs text-[#839188]">
            DailyRokar · Shop ledger
          </p>
        </main>
      </div>
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10291f]/55 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="profileDialogTitle"
            className="w-full max-w-115 rounded-lg bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.2)] sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-[#397354]">
                  Account
                </p>
                <h2
                  id="profileDialogTitle"
                  className="mt-2 font-serif text-2xl font-semibold text-[#18392f]"
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
                onClick={() => {
                  setEditableProfileFields({ shopName: false, name: false });
                  setIsProfileOpen(false);
                  setMessage({
                    type: "",
                    text: "",
                  });
                }}
                className="flex h-9 w-9 items-center justify-center rounded-md text-[#718078] hover:bg-[#edf3ef]"
              >
                <FiX size={18} aria-hidden="true" />
              </button>
            </div>

            {profileMode === "details" && (
              <>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="flex items-end gap-2">
                    <label
                      className="block min-w-0 flex-1 text-sm font-semibold text-[#29463a]"
                      htmlFor="shopName"
                    >
                      Shop name
                      <input
                        id="shopName"
                        disabled={!editableProfileFields.shopName}
                        name="shopName"
                        value={userForm.shopName}
                        onChange={handleInputChange}
                        className={`${!editableProfileFields.shopName ? "bg-gray-200" : ""} mt-2 h-11 w-full rounded-md border border-[#d7e1da] px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10`}
                      />
                    </label>
                    <button
                      type="button"
                      aria-label="Edit shop name"
                      onClick={() =>
                        setEditableProfileFields((fields) => ({
                          ...fields,
                          shopName: !editableProfileFields.shopName,
                        }))
                      }
                      className="mb-0 flex h-11 shrink-0 items-center gap-1 rounded-md border border-[#d7e1da] px-3 text-sm font-semibold text-[#52685d] transition hover:border-[#397354] hover:text-[#176044]"
                    >
                      Edit <LuPencil size={14} aria-hidden="true" />
                    </button>
                  </div>
                  <div className="flex items-end gap-2">
                    <label
                      className="block min-w-0 flex-1 text-sm font-semibold text-[#29463a]"
                      htmlFor="profileFullName"
                    >
                      Full name
                      <input
                        disabled={!editableProfileFields.name}
                        id="profileFullName"
                        name="name"
                        autoComplete="name"
                        onChange={handleInputChange}
                        value={userForm.name}
                        className={`${!editableProfileFields.name ? "bg-gray-200" : ""} mt-2 h-11 w-full rounded-md border border-[#d7e1da] px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10`}
                      />
                    </label>
                    <button
                      type="button"
                      aria-label="Edit full name"
                      onClick={() =>
                        setEditableProfileFields((fields) => ({
                          ...fields,
                          name: !editableProfileFields.name,
                        }))
                      }
                      className="mb-0 flex h-11 shrink-0 items-center gap-1 rounded-md border border-[#d7e1da] px-3 text-sm font-semibold text-[#52685d] transition hover:border-[#397354] hover:text-[#176044]"
                    >
                      Edit <LuPencil size={14} aria-hidden="true" />
                    </button>
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
                    disabled={loading}
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

                <section className="mt-5 border-t border-[#e8eee8] pt-4">
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
                      className="h-9 shrink-0 rounded-md border border-[#d7e1da] px-3 text-sm font-semibold text-[#52685d] transition hover:border-[#397354] hover:text-[#176044]"
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
                  <p
                    onClick={handleLogout}
                    className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[#a05c48] hover:bg-[#f8e9e4]"
                  >
                    {logoutLoading ? (
                      <LuLoaderCircle className="animate-spin text-2xl" />
                    ) : (
                      <>
                        <FiLogOut size={16} aria-hidden="true" />
                        Log out
                      </>
                    )}
                  </p>
                </div>
              </>
            )}

            {profileMode === "verify" && (
              <>
                <p className="text-sm leading-6 text-[#64766d]">
                  Confirm access to{" "}
                  <span className="font-semibold text-[#29463a]">
                    {user?.email}
                  </span>{" "}
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
                    className="h-10 w-full rounded-md bg-[#176044] px-4 text-sm font-bold text-white transition hover:bg-[#124d36]"
                  >
                    Verify email
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
                    className="h-10 w-full rounded-md bg-[#176044] px-4 text-sm font-bold text-white transition hover:bg-[#124d36]"
                  >
                    Change Password
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
                  Try not to share your current password with any one except
                  your girlfriend if you have one.
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
          </section>
        </div>
      )}
      {errorPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10291f]/55 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="profileDialogTitle"
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
          </section>
        </div>
      )}
      {screenLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10291f]/55 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="profileDialogTitle"
            className="w-full flex justify-center items-center max-w-115 rounded-lgsm:p-7"
          >
            <LuLoaderCircle className="animate-spin text-3xl" />
          </section>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
