import { useEffect, useMemo, useState } from "react";
import {
  FiFileText,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { LuLoaderCircle, LuPencil } from "react-icons/lu";
import axiosInstance from "../../api/axiosInstance";
import Popup from "./Popup";
import formatDateTime from "./formatDateTime";

const PRODUCT_ENDPOINTS = {
  all: "/product/all",
  create: "/product/create",
  update: (id) => `/product/update/${encodeURIComponent(id)}`,
  remove: (id) => `/product/delete/${encodeURIComponent(id)}`,
};

const BILL_ENDPOINTS = {
  all: "/bill/all",
  create: "/bill/create",
  remove: (id) => `/bill/delete/${encodeURIComponent(id)}`,
};

const categories = [
  "Grocery",
  "Beverages",
  "Household",
  "Personal care",
  "Stationery",
  "Other",
];
const units = ["Piece", "Kg", "g", "L", "ml", "Box", "Pack", "Dozen", "Other"];

const emptyProductForm = {
  name: "",
  description: "",
  salePrice: "",
  buyPrice: "",
  category: categories[0],
  customCategory: "",
  unit: units[0],
  customUnit: "",
};

const emptyBillLine = {
  productId: "",
  quantity: "1",
  unit: "",
  amount: "",
};

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const productId = (product) => product?._id || product?.id || "";
const productName = (product) => product?.name || product?.productName || "Unnamed product";
const billId = (bill) => bill?._id || bill?.id || "";

const billLines = (bill) =>
  Array.isArray(bill.items)
    ? bill.items
    : Array.isArray(bill.products)
      ? bill.products
      : [];

const billTotal = (bill) =>
  Number(
    bill.total ??
      bill.totalAmount ??
      bill.amount ??
      billLines(bill).reduce(
        (sum, line) =>
          sum +
          Number(line.total ?? line.amount ?? 0) *
            (line.total == null && line.amount != null
              ? Number(line.quantity || 1)
              : 1),
        0,
      ),
  );

const dateLabel = (date) => {
  return formatDateTime(date);
};

function ProductFields({ form, setForm, errors = {} }) {
  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label
        className="block text-xs font-semibold text-[#52685d] sm:col-span-2"
        htmlFor="productName"
      >
        Product name
        <input
          id="productName"
          name="name"
          value={form.name}
          onChange={update}
          placeholder="Product name"
          className="mt-1.5 h-10 w-full rounded-lg border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
        />
        {errors.name && (
          <span className="mt-1 block text-xs text-red-600">{errors.name}</span>
        )}
      </label>

      <label
        className="block text-xs font-semibold text-[#52685d] sm:col-span-2"
        htmlFor="productDescription"
      >
        Description <span className="font-normal text-[#839188]">(optional)</span>
        <textarea
          id="productDescription"
          name="description"
          rows={2}
          value={form.description}
          onChange={update}
          placeholder="Short product description"
          className="mt-1.5 w-full resize-y rounded-lg border border-[#d7e1da] bg-white px-3 py-2 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
        />
      </label>

      <label
        className="block text-xs font-semibold text-[#52685d]"
        htmlFor="productSalePrice"
      >
        Sale price
        <input
          id="productSalePrice"
          name="salePrice"
          type="number"
          min="0"
          step="0.01"
          value={form.salePrice}
          onChange={update}
          placeholder="0.00"
          className="mt-1.5 h-10 w-full rounded-lg border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
        />
        {errors.salePrice && (
          <span className="mt-1 block text-xs text-red-600">
            {errors.salePrice}
          </span>
        )}
      </label>

      <label
        className="block text-xs font-semibold text-[#52685d]"
        htmlFor="productBuyPrice"
      >
        Buy price
        <input
          id="productBuyPrice"
          name="buyPrice"
          type="number"
          min="0"
          step="0.01"
          value={form.buyPrice}
          onChange={update}
          placeholder="0.00"
          className="mt-1.5 h-10 w-full rounded-lg border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
        />
        {errors.buyPrice && (
          <span className="mt-1 block text-xs text-red-600">
            {errors.buyPrice}
          </span>
        )}
      </label>

      <label
        className="block text-xs font-semibold text-[#52685d]"
        htmlFor="productCategory"
      >
        Category
        <select
          id="productCategory"
          name="category"
          value={form.category}
          onChange={update}
          className="mt-1.5 h-10 w-full rounded-lg border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
        >
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </label>

      <label
        className="block text-xs font-semibold text-[#52685d]"
        htmlFor="productUnit"
      >
        Unit
        <select
          id="productUnit"
          name="unit"
          value={form.unit}
          onChange={update}
          className="mt-1.5 h-10 w-full rounded-lg border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
        >
          {units.map((unit) => (
            <option key={unit}>{unit}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

function NewProductForm({ onCreate, isSaving, error }) {
  const [form, setForm] = useState(emptyProductForm);
  const [errors, setErrors] = useState({});

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Product name is required.";
    if (form.salePrice === "" || Number(form.salePrice) < 0) {
      nextErrors.salePrice = "Enter a valid sale price.";
    }
    if (form.buyPrice === "" || Number(form.buyPrice) < 0) {
      nextErrors.buyPrice = "Enter a valid buy price.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const created = await onCreate({
      name: form.name.trim(),
      description: form.description.trim(),
      salePrice: Number(form.salePrice),
      buyPrice: Number(form.buyPrice),
      category:
        form.category === "Other"
          ? form.customCategory.trim() || "Other"
          : form.category,
      unit:
        form.unit === "Other" ? form.customUnit.trim() || "Other" : form.unit,
    });
    if (created) {
      setForm(emptyProductForm);
      setErrors({});
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <ProductFields form={form} setForm={setForm} errors={errors} />
      {form.category === "Other" && (
        <label className="block text-xs font-semibold text-[#52685d]">
          Custom category
          <input
            name="customCategory"
            value={form.customCategory}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                customCategory: event.target.value,
              }))
            }
            className="mt-1.5 h-10 w-full rounded-lg border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354]"
          />
        </label>
      )}
      {form.unit === "Other" && (
        <label className="block text-xs font-semibold text-[#52685d]">
          Custom unit
          <input
            name="customUnit"
            value={form.customUnit}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                customUnit: event.target.value,
              }))
            }
            className="mt-1.5 h-10 w-full rounded-lg border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354]"
          />
        </label>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSaving}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#176044] text-sm font-bold text-white hover:bg-[#124d36] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSaving ? (
          <LuLoaderCircle className="animate-spin" />
        ) : (
          <>
            <FiPlus size={15} aria-hidden="true" />
            Add product
          </>
        )}
      </button>
    </form>
  );
}

function ProductDetailsPopup({ product, onClose, onSave, onDelete, busy }) {
  const [form, setForm] = useState(() => ({
    ...emptyProductForm,
    name: productName(product),
    description: product.description || "",
    salePrice: product.salePrice ?? "",
    buyPrice: product.buyPrice ?? "",
    category: categories.includes(product.category)
      ? product.category
      : "Other",
    customCategory: categories.includes(product.category)
      ? ""
      : product.category || "",
    unit: units.includes(product.unit) ? product.unit : "Other",
    customUnit: units.includes(product.unit) ? "" : product.unit || "",
  }));
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Product name is required.";
    if (form.salePrice === "" || Number(form.salePrice) < 0) {
      nextErrors.salePrice = "Enter a valid sale price.";
    }
    if (form.buyPrice === "" || Number(form.buyPrice) < 0) {
      nextErrors.buyPrice = "Enter a valid buy price.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      await onSave(product, {
        name: form.name.trim(),
        description: form.description.trim(),
        salePrice: Number(form.salePrice),
        buyPrice: Number(form.buyPrice),
        category:
          form.category === "Other"
            ? form.customCategory.trim() || "Other"
            : form.category,
        unit:
          form.unit === "Other"
            ? form.customUnit.trim() || "Other"
            : form.unit,
      });
      onClose();
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  return (
    <Popup
      labelledBy="productDetailsTitle"
      className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#e8eee8] bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.2)] sm:p-7"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#397354]">
            Product details
          </p>
          <h2
            id="productDetailsTitle"
            className="mt-2 text-xl font-bold tracking-tight text-[#18392f]"
          >
            {productName(product)}
          </h2>
        </div>
        <button
          type="button"
          aria-label="Close product details"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-md text-[#718078] hover:bg-[#edf3ef]"
        >
          <FiX size={18} aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <ProductFields form={form} setForm={setForm} errors={errors} />
        {form.category === "Other" && (
          <label className="block text-xs font-semibold text-[#52685d]">
            Custom category
            <input
              value={form.customCategory}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  customCategory: event.target.value,
                }))
              }
              className="mt-1.5 h-10 w-full rounded-lg border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f]"
            />
          </label>
        )}
        {form.unit === "Other" && (
          <label className="block text-xs font-semibold text-[#52685d]">
            Custom unit
            <input
              value={form.customUnit}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  customUnit: event.target.value,
                }))
              }
              className="mt-1.5 h-10 w-full rounded-lg border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f]"
            />
          </label>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <button
            type="button"
            disabled={busy}
            onClick={() => onDelete(product)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-semibold text-[#a04436] hover:bg-red-50 disabled:opacity-50"
          >
            {busy ? (
              <LuLoaderCircle className="animate-spin" />
            ) : (
              <FiTrash2 size={15} aria-hidden="true" />
            )}
            Delete product
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#176044] px-4 text-sm font-bold text-white hover:bg-[#124d36] disabled:opacity-50"
          >
            {busy ? (
              <LuLoaderCircle className="animate-spin" />
            ) : (
              <>
                <LuPencil size={15} aria-hidden="true" />
                Update product
              </>
            )}
          </button>
        </div>
      </form>
    </Popup>
  );
}

function DeleteBillPopup({ bill, onClose, onConfirm, busy }) {
  return (
    <Popup
      role="alertdialog"
      labelledBy="deleteBillTitle"
      className="w-full max-w-md rounded-2xl border border-[#e8eee8] bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id="deleteBillTitle"
            className="text-lg font-bold tracking-tight text-[#18392f]"
          >
            Delete this bill?
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#64766d]">
            This will permanently remove the bill containing{" "}
            {billLines(bill).length} product
            {billLines(bill).length === 1 ? "" : "s"}.
          </p>
        </div>
        <button
          type="button"
          aria-label="Close delete bill confirmation"
          onClick={onClose}
          disabled={busy}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#718078] hover:bg-[#edf3ef] disabled:opacity-50"
        >
          <FiX size={17} aria-hidden="true" />
        </button>
      </div>
      <div className="mt-5 flex flex-col-reverse justify-end gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="h-10 rounded-lg border border-[#d7e1da] px-4 text-sm font-semibold text-[#52685d] hover:bg-[#f1f5f1] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#a04436] px-4 text-sm font-bold text-white hover:bg-[#87372d] disabled:opacity-70"
        >
          {busy ? (
            <LuLoaderCircle className="animate-spin" />
          ) : (
            <FiTrash2 size={15} aria-hidden="true" />
          )}
          Delete bill
        </button>
      </div>
    </Popup>
  );
}

export default function BillingPage() {
  const [products, setProducts] = useState([]);
  const [bills, setBills] = useState([]);
  const [lineForm, setLineForm] = useState(emptyBillLine);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pendingDeleteBill, setPendingDeleteBill] = useState(null);
  const [error, setError] = useState("");
  const [productError, setProductError] = useState("");
  const [billMessage, setBillMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSavingBill, setIsSavingBill] = useState(false);
  const [busyProductId, setBusyProductId] = useState("");
  const [busyBillId, setBusyBillId] = useState("");
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;
    const loadBillingData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [productResponse, billResponse] = await Promise.all([
          axiosInstance.get(PRODUCT_ENDPOINTS.all),
          axiosInstance.get(BILL_ENDPOINTS.all),
        ]);
        if (!Array.isArray(productResponse.data?.products)) {
          throw new Error("Unexpected products response from the server.");
        }
        if (!Array.isArray(billResponse.data?.bills)) {
          throw new Error("Unexpected bills response from the server.");
        }
        if (isCurrentRequest) {
          setProducts(productResponse.data.products);
          setBills(billResponse.data.bills);
        }
      } catch (requestError) {
        if (isCurrentRequest) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Unable to load billing data. Please try again.",
          );
        }
      } finally {
        if (isCurrentRequest) setIsLoading(false);
      }
    };
    loadBillingData();
    return () => {
      isCurrentRequest = false;
    };
  }, [refresh]);

  const totalCart = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number(item.amount) * Number(item.quantity),
        0,
      ),
    [cart],
  );

  const handleSelectProduct = (event) => {
    const selectedId = event.target.value;
    if (selectedId === "__add_product__") {
      setIsProductFormOpen(true);
      setProductError("");
      return;
    }
    const product = products.find((item) => productId(item) === selectedId);
    setLineForm({
      productId: selectedId,
      quantity: "1",
      unit: product?.unit || "",
      amount: product?.salePrice ?? "",
    });
  };

  const handleAddLine = (event) => {
    event.preventDefault();
    setError("");
    const product = products.find(
      (item) => productId(item) === lineForm.productId,
    );
    const quantity = Number(lineForm.quantity);
    const amount = Number(lineForm.amount);
    if (!product) {
      setError("Select a product before adding it to the bill.");
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }
    if (!lineForm.unit.trim()) {
      setError("Enter a unit for this product.");
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      setError("Enter a valid unit amount.");
      return;
    }

    setCart((current) => [
      ...current,
      {
        key: `${productId(product)}-${Date.now()}-${current.length}`,
        productId: productId(product),
        name: productName(product),
        quantity,
        unit: lineForm.unit.trim(),
        amount,
      },
    ]);
    setLineForm(emptyBillLine);
  };

  const handleCreateProduct = async (payload) => {
    setIsSavingProduct(true);
    setProductError("");
    try {
      const response = await axiosInstance.post(
        PRODUCT_ENDPOINTS.create,
        payload,
      );
      const product =
        response.data?.product || response.data?.newProduct || response.data;
      if (!product || !productId(product)) {
        throw new Error("Unexpected response while creating product.");
      }
      setProducts((current) => [...current, product]);
      setLineForm({
        productId: productId(product),
        quantity: "1",
        unit: product.unit || "",
        amount: product.salePrice ?? "",
      });
      setIsProductFormOpen(false);
      return true;
    } catch (requestError) {
      setProductError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to add product. Please try again.",
      );
      return false;
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleUpdateProduct = async (product, payload) => {
    const id = productId(product);
    setBusyProductId(id);
    try {
      const response = await axiosInstance.patch(
        PRODUCT_ENDPOINTS.update(id),
        payload,
      );
      const updated =
        response.data?.product ||
        response.data?.updatedProduct ||
        response.data ||
        { ...product, ...payload };
      setProducts((current) =>
        current.map((item) =>
          productId(item) === id ? { ...item, ...payload, ...updated } : item,
        ),
      );
      setCart((current) =>
        current.map((line) =>
          line.productId === id
            ? { ...line, name: payload.name }
            : line,
        ),
      );
      setRefresh((current) => current + 1);
    } catch (requestError) {
      throw new Error(
        requestError.response?.data?.message ||
          "Unable to update product. Please try again.",
        { cause: requestError },
      );
    } finally {
      setBusyProductId("");
    }
  };

  const handleDeleteProduct = async (product) => {
    const id = productId(product);
    setBusyProductId(id);
    setError("");
    try {
      await axiosInstance.delete(PRODUCT_ENDPOINTS.remove(id));
      setProducts((current) =>
        current.filter((item) => productId(item) !== id),
      );
      setCart((current) => current.filter((line) => line.productId !== id));
      setSelectedProduct(null);
      setRefresh((current) => current + 1);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete product. Please try again.",
      );
    } finally {
      setBusyProductId("");
    }
  };

  const handleCartChange = (key, field, value) => {
    setCart((current) =>
      current.map((line) =>
        line.key === key
          ? {
              ...line,
              [field]:
                field === "quantity" || field === "amount" ? value : value,
            }
          : line,
      ),
    );
  };

  const handleGenerateBill = async () => {
    setError("");
    setBillMessage("");
    if (!cart.length) {
      setError("Add at least one product before generating a bill.");
      return;
    }
    const invalidLine = cart.some(
      (line) =>
        !Number.isFinite(Number(line.quantity)) ||
        Number(line.quantity) <= 0 ||
        !Number.isFinite(Number(line.amount)) ||
        Number(line.amount) < 0 ||
        !line.unit.trim(),
    );
    if (invalidLine) {
      setError("Check each product's quantity, unit, and amount.");
      return;
    }

    setIsSavingBill(true);
    try {
      await axiosInstance.post(BILL_ENDPOINTS.create, {
        items: cart.map((line) => ({
          productId: line.productId,
          name: line.name,
          quantity: Number(line.quantity),
          unit: line.unit,
          amount: Number(line.amount),
          total: Number(line.amount) * Number(line.quantity),
        })),
        total: totalCart,
      });
      setCart([]);
      setLineForm(emptyBillLine);
      setBillMessage("Bill generated successfully.");
      setRefresh((current) => current + 1);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to generate bill. Please try again.",
      );
    } finally {
      setIsSavingBill(false);
    }
  };

  const handleDeleteBill = async () => {
    if (!pendingDeleteBill) return;
    const id = billId(pendingDeleteBill);
    if (!id) {
      setError("This bill is missing an ID and cannot be deleted.");
      setPendingDeleteBill(null);
      return;
    }
    setBusyBillId(id);
    setError("");
    try {
      await axiosInstance.delete(BILL_ENDPOINTS.remove(id));
      setBills((current) => current.filter((bill) => billId(bill) !== id));
      setPendingDeleteBill(null);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete this bill. Please try again.",
      );
      setPendingDeleteBill(null);
    } finally {
      setBusyBillId("");
    }
  };

  const recentBills = [...bills].sort(
    (left, right) =>
      new Date(right.createdAt || right.date || 0).getTime() -
      new Date(left.createdAt || left.date || 0).getTime(),
  );

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-[#dce6de] bg-[#e4f0e5] p-5 shadow-[0_6px_22px_rgba(24,57,47,0.04)]">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#718078]">
            Products
          </p>
          <p className="mt-3 text-2xl font-bold text-[#18392f]">
            {products.length}
          </p>
        </article>
        <article className="rounded-2xl border border-[#dce6de] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.04)]">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#718078]">
            Bills generated
          </p>
          <p className="mt-3 text-2xl font-bold text-[#18392f]">
            {bills.length}
          </p>
        </article>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
          <button
            type="button"
            aria-label="Dismiss billing error"
            onClick={() => setError("")}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-red-100"
          >
            <FiX size={15} aria-hidden="true" />
          </button>
        </div>
      )}
      {billMessage && (
        <p role="status" className="rounded-xl bg-[#e4f0e5] px-4 py-3 text-sm text-[#176044]">
          {billMessage}
        </p>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-[#dce6de] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.04)] sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold tracking-tight text-[#18392f]">
              Create bill
            </h2>
            <p className="mt-1 text-sm text-[#718078]">
              Add products and adjust quantity, unit, or price for this bill.
            </p>
          </div>

          <form onSubmit={handleAddLine} className="space-y-4">
            <label
              className="block text-xs font-semibold text-[#52685d]"
              htmlFor="billProduct"
            >
              Product
              <select
                id="billProduct"
                value={lineForm.productId}
                onChange={handleSelectProduct}
                className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] bg-white px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354] focus:ring-4 focus:ring-[#397354]/10"
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={productId(product)} value={productId(product)}>
                    {productName(product)}
                  </option>
                ))}
                <option value="__add_product__">+ Add a product</option>
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              <label
                className="block text-xs font-semibold text-[#52685d]"
                htmlFor="billQuantity"
              >
                Quantity
                <input
                  id="billQuantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={lineForm.quantity}
                  onChange={(event) =>
                    setLineForm((current) => ({
                      ...current,
                      quantity: event.target.value,
                    }))
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354]"
                />
              </label>
              <label
                className="block text-xs font-semibold text-[#52685d]"
                htmlFor="billUnit"
              >
                Unit
                <input
                  id="billUnit"
                  value={lineForm.unit}
                  onChange={(event) =>
                    setLineForm((current) => ({
                      ...current,
                      unit: event.target.value,
                    }))
                  }
                  placeholder="Select product"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354]"
                />
              </label>
              <label
                className="block text-xs font-semibold text-[#52685d]"
                htmlFor="billAmount"
              >
                Unit amount
                <input
                  id="billAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={lineForm.amount}
                  onChange={(event) =>
                    setLineForm((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  placeholder="0.00"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#d7e1da] px-3 text-sm font-normal text-[#18392f] outline-none focus:border-[#397354]"
                />
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#d7e1da] bg-[#f8fbf8] text-sm font-bold text-[#176044] hover:bg-[#e4f0e5]"
            >
              <FiPlus size={16} aria-hidden="true" />
              Add another product
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-[#dce6de] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.04)] sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#18392f]">
                Bill preview
              </h2>
              <p className="mt-1 text-sm text-[#718078]">
                {cart.length} product{cart.length === 1 ? "" : "s"} added
              </p>
            </div>
            {cart.length > 0 && (
              <p className="text-right">
                <span className="block text-xs text-[#718078]">Total</span>
                <span className="text-lg font-bold text-[#18392f]">
                  {money(totalCart)}
                </span>
              </p>
            )}
          </div>

          {cart.length > 0 && (
            <>
              <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                {cart.map((line) => (
                  <article
                    key={line.key}
                    className="rounded-xl border border-[#e8eee8] bg-[#f9fbf9] p-3"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#29463a]">
                          {line.name}
                        </p>
                        <p className="mt-1 text-xs text-[#718078]">
                          Line total:{" "}
                          {money(Number(line.amount) * Number(line.quantity))}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${line.name} from bill`}
                        title="Remove product from bill"
                        onClick={() =>
                          setCart((current) =>
                            current.filter((item) => item.key !== line.key),
                          )
                        }
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#a04436] hover:bg-[#f8e9e4]"
                      >
                        <FiTrash2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <label className="text-[11px] font-semibold text-[#718078]">
                        Quantity
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={line.quantity}
                          onChange={(event) =>
                            handleCartChange(
                              line.key,
                              "quantity",
                              event.target.value,
                            )
                          }
                          className="mt-1 h-9 w-full rounded-lg border border-[#d7e1da] bg-white px-2 text-xs text-[#18392f]"
                        />
                      </label>
                      <label className="text-[11px] font-semibold text-[#718078]">
                        Unit
                        <input
                          value={line.unit}
                          onChange={(event) =>
                            handleCartChange(
                              line.key,
                              "unit",
                              event.target.value,
                            )
                          }
                          className="mt-1 h-9 w-full rounded-lg border border-[#d7e1da] bg-white px-2 text-xs text-[#18392f]"
                        />
                      </label>
                      <label className="text-[11px] font-semibold text-[#718078]">
                        Unit amount
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.amount}
                          onChange={(event) =>
                            handleCartChange(
                              line.key,
                              "amount",
                              event.target.value,
                            )
                          }
                          className="mt-1 h-9 w-full rounded-lg border border-[#d7e1da] bg-white px-2 text-xs text-[#18392f]"
                        />
                      </label>
                    </div>
                  </article>
                ))}
              </div>
              <button
                type="button"
                onClick={handleGenerateBill}
                disabled={isSavingBill}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#176044] text-sm font-bold text-white hover:bg-[#124d36] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingBill ? (
                  <LuLoaderCircle className="animate-spin" />
                ) : (
                  <>
                    <FiFileText size={16} aria-hidden="true" />
                    Generate bill · {money(totalCart)}
                  </>
                )}
              </button>
            </>
          )}
          {cart.length === 0 || isProductFormOpen ? (
            <div className="rounded-xl border border-dashed border-[#d7e1da] bg-[#f9fbf9] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-[#29463a]">
                  Add a new product
                </h3>
                {cart.length > 0 && (
                  <button
                    type="button"
                    aria-label="Close add product form"
                    onClick={() => setIsProductFormOpen(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-[#718078] hover:bg-[#edf3ef]"
                  >
                    <FiX size={15} aria-hidden="true" />
                  </button>
                )}
              </div>
              <NewProductForm
                onCreate={handleCreateProduct}
                isSaving={isSavingProduct}
                error={productError}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsProductFormOpen(true)}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-[#d7e1da] px-3 text-xs font-bold text-[#176044] hover:bg-[#f1f5f1]"
            >
              <FiPlus size={14} aria-hidden="true" />
              Add product to catalog
            </button>
          )}
        </section>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-[#dce6de] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.04)] sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight text-[#18392f]">
              Products
            </h2>
            <p className="mt-1 text-sm text-[#718078]">
              Select a product to update or delete it.
            </p>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LuLoaderCircle
                className="animate-spin text-2xl text-[#397354]"
                aria-label="Loading products"
              />
            </div>
          ) : products.length ? (
            <div className="max-h-[30rem] space-y-2 overflow-y-auto">
              {products.map((product) => (
                <button
                  key={productId(product)}
                  type="button"
                  onClick={() => setSelectedProduct(product)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#e8eee8] p-3 text-left transition hover:border-[#a9c59e] hover:bg-[#f8fbf8]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-[#29463a]">
                      {productName(product)}
                    </span>
                    <span className="mt-1 block truncate text-xs text-[#718078]">
                      {product.category || "Uncategorized"} ·{" "}
                      {product.unit || "Unit"}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[10px] font-bold uppercase text-[#839188]">
                      Sale price
                    </span>
                    <span className="mt-1 block text-sm font-bold text-[#176044]">
                      {money(product.salePrice)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[#d7e1da] px-4 py-8 text-center text-sm text-[#839188]">
              No products yet. Add one from the bill preview.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-[#dce6de] bg-white p-5 shadow-[0_6px_22px_rgba(24,57,47,0.04)] sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight text-[#18392f]">
              Recent bills
            </h2>
            <p className="mt-1 text-sm text-[#718078]">
              Latest generated bills.
            </p>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LuLoaderCircle
                className="animate-spin text-2xl text-[#397354]"
                aria-label="Loading bills"
              />
            </div>
          ) : recentBills.length ? (
            <div className="max-h-[30rem] divide-y divide-[#e8eee8] overflow-y-auto">
              {recentBills.map((bill, index) => {
                const id = billId(bill);
                const lines = billLines(bill);
                return (
                  <article
                    key={id || `bill-${index}`}
                    className="flex items-start gap-3 py-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e4f0e5] text-[#176044]">
                      <FiFileText size={17} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#29463a]">
                        Bill {bill.billNumber || bill.invoiceNumber || `#${index + 1}`}
                      </p>
                      <p className="mt-1 text-xs text-[#718078]">
                        {lines.length} product{lines.length === 1 ? "" : "s"} ·{" "}
                        {dateLabel(bill.createdAt || bill.date)}
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#176044]">
                        {money(billTotal(bill))}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Delete bill ${bill.billNumber || bill.invoiceNumber || index + 1}`}
                      title="Delete bill"
                      disabled={!id || Boolean(busyBillId)}
                      onClick={() => setPendingDeleteBill(bill)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#a04436] hover:bg-[#f8e9e4] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyBillId === id ? (
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
              })}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[#d7e1da] px-4 py-8 text-center text-sm text-[#839188]">
              No bills generated yet.
            </p>
          )}
        </section>
      </div>

      {selectedProduct && (
        <ProductDetailsPopup
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSave={handleUpdateProduct}
          onDelete={handleDeleteProduct}
          busy={busyProductId === productId(selectedProduct)}
        />
      )}
      {pendingDeleteBill && (
        <DeleteBillPopup
          bill={pendingDeleteBill}
          onClose={() => setPendingDeleteBill(null)}
          onConfirm={handleDeleteBill}
          busy={Boolean(busyBillId)}
        />
      )}
    </div>
  );
}
