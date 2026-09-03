"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Palette,
  RefreshCw,
  Check,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface Color {
  id: number;
  name: string;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
}

/* =========================================================
   API
========================================================= */

const API_URL = "/api/color";

/* =========================================================
   PAGE
========================================================= */

export default function ColorPage() {
  /* =======================================================
     STATE
  ======================================================= */

  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingColor, setEditingColor] =
    useState<Color | null>(null);

  const [deleteColor, setDeleteColor] =
    useState<Color | null>(null);

  const [colorName, setColorName] = useState("");

  const [status, setStatus] =
    useState<"active" | "inactive">("active");

  const [multipleColors, setMultipleColors] =
    useState<string[]>([""]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =======================================================
     LOAD COLORS
  ======================================================= */

  const fetchColors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        cache: "no-store",
      });

      const text = await response.text();

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Invalid JSON:", text);
        throw new Error(
          "Color API returned invalid JSON"
        );
      }

      if (!response.ok || !data.status) {
        throw new Error(
          data.message || "Failed to load colors"
        );
      }

      setColors(
        Array.isArray(data.colors)
          ? data.colors
          : []
      );
    } catch (err: any) {
      console.error("FETCH COLORS ERROR:", err);

      setError(
        err?.message ||
          "Something went wrong while loading colors"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredColors = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return colors;
    }

    return colors.filter((color) =>
      color.name
        .toLowerCase()
        .includes(value)
    );
  }, [colors, search]);

  /* =======================================================
     OPEN ADD MODAL
  ======================================================= */

  const openAddModal = () => {
    setEditingColor(null);
    setColorName("");
    setStatus("active");
    setMultipleColors([""]);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  /* =======================================================
     OPEN EDIT MODAL
  ======================================================= */

  const openEditModal = (color: Color) => {
    setEditingColor(color);
    setColorName(color.name);
    setStatus(color.status);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingColor(null);
    setColorName("");
    setStatus("active");
    setMultipleColors([""]);
    setError("");
    setSuccess("");
  };

  /* =======================================================
     MULTIPLE COLOR INPUT
  ======================================================= */

  const updateMultipleColor = (
    index: number,
    value: string
  ) => {
    setMultipleColors((prev) => {
      const next = [...prev];

      next[index] = value;

      return next;
    });
  };

  /* =======================================================
     ADD COLOR INPUT
  ======================================================= */

  const addColorInput = () => {
    setMultipleColors((prev) => [
      ...prev,
      "",
    ]);
  };

  /* =======================================================
     REMOVE COLOR INPUT
  ======================================================= */

  const removeColorInput = (
    index: number
  ) => {
    setMultipleColors((prev) => {
      if (prev.length === 1) {
        return [""];
      }

      return prev.filter(
        (_, i) => i !== index
      );
    });
  };

  /* =======================================================
     ADD MULTIPLE COLORS
  ======================================================= */

  const submitMultipleColors = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      /* Clean values */
      const cleaned = multipleColors
        .map((color) => color.trim())
        .filter(Boolean);

      if (cleaned.length === 0) {
        setError(
          "Please enter at least one color."
        );
        return;
      }

      /* Remove duplicate colors */
      const uniqueColors = Array.from(
        new Map(
          cleaned.map((color) => [
            color.toLowerCase(),
            color,
          ])
        ).values()
      );

      /* ==================================================
         FORM DATA
      ================================================== */

      const formData = new FormData();

      uniqueColors.forEach((color) => {
        formData.append(
          "colors[]",
          color
        );
      });

      /* ==================================================
         POST /api/color
      ================================================== */

      const response = await fetch(
        API_URL,
        {
          method: "POST",
          body: formData,
        }
      );

      const text = await response.text();

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Invalid JSON:", text);

        throw new Error(
          "Color API returned invalid JSON"
        );
      }

      if (!response.ok || !data.status) {
        throw new Error(
          data.message ||
            "Failed to add colors"
        );
      }

      setSuccess(
        `${data.added_count || uniqueColors.length} color(s) added successfully.`
      );

      setMultipleColors([""]);

      await fetchColors();

      setTimeout(() => {
        setShowModal(false);
        setSuccess("");
      }, 1000);
    } catch (err: any) {
      console.error(
        "ADD COLORS ERROR:",
        err
      );

      setError(
        err?.message ||
          "Failed to add colors"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     UPDATE COLOR
  ======================================================= */

  const submitEditColor = async () => {
    try {
      if (!editingColor) return;

      const name = colorName.trim();

      if (!name) {
        setError(
          "Color name is required."
        );
        return;
      }

      setSaving(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append(
        "id",
        String(editingColor.id)
      );

      formData.append(
        "name",
        name
      );

      formData.append(
        "status",
        status
      );

      /* ==================================================
         PUT /api/color
      ================================================== */

      const response = await fetch(
        API_URL,
        {
          method: "PUT",
          body: formData,
        }
      );

      const text = await response.text();

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Invalid JSON:", text);

        throw new Error(
          "Color API returned invalid JSON"
        );
      }

      if (!response.ok || !data.status) {
        throw new Error(
          data.message ||
            "Failed to update color"
        );
      }

      setSuccess(
        "Color updated successfully."
      );

      await fetchColors();

      setTimeout(() => {
        setShowModal(false);
        setSuccess("");
      }, 1000);
    } catch (err: any) {
      console.error(
        "UPDATE COLOR ERROR:",
        err
      );

      setError(
        err?.message ||
          "Failed to update color"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE CONFIRM
  ======================================================= */

  const openDeleteModal = (
    color: Color
  ) => {
    setDeleteColor(color);
    setShowDeleteModal(true);
    setError("");
  };

  /* =======================================================
     DELETE COLOR
  ======================================================= */

  const confirmDelete = async () => {
    if (!deleteColor) return;

    try {
      setDeleting(deleteColor.id);
      setError("");

      const formData = new FormData();

      formData.append(
        "id",
        String(deleteColor.id)
      );

      /* ==================================================
         DELETE /api/color
      ================================================== */

      const response = await fetch(
        API_URL,
        {
          method: "DELETE",
          body: formData,
        }
      );

      const text = await response.text();

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Invalid JSON:", text);

        throw new Error(
          "Color API returned invalid JSON"
        );
      }

      if (!response.ok || !data.status) {
        throw new Error(
          data.message ||
            "Failed to delete color"
        );
      }

      setColors((prev) =>
        prev.filter(
          (item) =>
            item.id !==
            deleteColor.id
        )
      );

      setShowDeleteModal(false);
      setDeleteColor(null);

      setSuccess(
        "Color deleted successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err: any) {
      console.error(
        "DELETE COLOR ERROR:",
        err
      );

      setError(
        err?.message ||
          "Failed to delete color"
      );
    } finally {
      setDeleting(null);
    }
  };

  /* =======================================================
     TOGGLE STATUS
  ======================================================= */

  const toggleStatus = async (
    color: Color
  ) => {
    try {
      const newStatus =
        color.status === "active"
          ? "inactive"
          : "active";

      const formData = new FormData();

      formData.append(
        "id",
        String(color.id)
      );

      formData.append(
        "name",
        color.name
      );

      formData.append(
        "status",
        newStatus
      );

      /* ==================================================
         PUT /api/color
      ================================================== */

      const response = await fetch(
        API_URL,
        {
          method: "PUT",
          body: formData,
        }
      );

      const text = await response.text();

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Invalid JSON:", text);

        throw new Error(
          "Color API returned invalid JSON"
        );
      }

      if (!response.ok || !data.status) {
        throw new Error(
          data.message ||
            "Failed to update status"
        );
      }

      setColors((prev) =>
        prev.map((item) =>
          item.id === color.id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );
    } catch (err: any) {
      console.error(
        "TOGGLE STATUS ERROR:",
        err
      );

      setError(
        err?.message ||
          "Failed to update status"
      );
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Palette className="h-6 w-6" />
              </div>

              <div>

                <h1 className="text-2xl font-bold text-slate-900">
                  Colors
                </h1>

                <p className="text-sm text-slate-500">
                  Manage product colors
                </p>

              </div>

            </div>

          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Add Colors
          </button>

        </div>

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">

            <Check className="h-5 w-5 shrink-0" />

            {success}

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error &&
          !showModal &&
          !showDeleteModal && (

            <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

              <AlertCircle className="h-5 w-5 shrink-0" />

              <span>{error}</span>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="ml-auto"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

          )}

        {/* =================================================
            SEARCH / TOOLBAR
        ================================================= */}

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div className="relative w-full md:max-w-md">

              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search colors..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <button
              type="button"
              onClick={fetchColors}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >

              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh

            </button>

          </div>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {loading ? (

            <div className="flex min-h-[300px] items-center justify-center">

              <div className="flex items-center gap-3 text-sm text-slate-500">

                <Loader2 className="h-5 w-5 animate-spin" />

                Loading colors...

              </div>

            </div>

          ) : filteredColors.length === 0 ? (

            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">

                <Palette className="h-7 w-7 text-slate-400" />

              </div>

              <h3 className="text-base font-semibold text-slate-800">
                No colors found
              </h3>

              <p className="mt-1 text-sm text-slate-500">

                {search
                  ? "Try another search."
                  : "Add your first product color."}

              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      #
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Color
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Created
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredColors.map(
                    (color, index) => (

                      <tr
                        key={color.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                      >

                        <td className="px-5 py-4 text-sm font-medium text-slate-500">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div
                              className="h-9 w-9 rounded-full border border-slate-300 shadow-sm"
                              style={{
                                backgroundColor:
                                  color.name.toLowerCase(),
                              }}
                            />

                            <div>

                              <div className="font-semibold text-slate-800">
                                {color.name}
                              </div>

                              <div className="text-xs text-slate-400">
                                ID: {color.id}
                              </div>

                            </div>

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <button
                            type="button"
                            onClick={() =>
                              toggleStatus(color)
                            }
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              color.status ===
                              "active"
                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >

                            <span
                              className={`h-2 w-2 rounded-full ${
                                color.status ===
                                "active"
                                  ? "bg-green-500"
                                  : "bg-slate-400"
                              }`}
                            />

                            {color.status ===
                            "active"
                              ? "Active"
                              : "Inactive"}

                          </button>

                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">

                          {color.created_at
                            ? new Date(
                                color.created_at
                              ).toLocaleDateString()
                            : "-"}

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  color
                                )
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openDeleteModal(
                                  color
                                )
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        {!loading &&
          filteredColors.length > 0 && (

            <div className="mt-4 text-sm text-slate-500">

              Showing{" "}

              <span className="font-semibold text-slate-700">
                {filteredColors.length}
              </span>{" "}

              of{" "}

              <span className="font-semibold text-slate-700">
                {colors.length}
              </span>{" "}

              colors

            </div>

          )}

      </div>

      {/* ===================================================
          ADD / EDIT MODAL
      =================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <h2 className="text-lg font-bold text-slate-900">

                  {editingColor
                    ? "Edit Color"
                    : "Add Colors"}

                </h2>

                <p className="mt-1 text-xs text-slate-500">

                  {editingColor
                    ? "Update color details."
                    : "Add one or multiple colors."}

                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* BODY */}

            <div className="max-h-[70vh] overflow-y-auto p-6">

              {/* ERROR */}

              {error && (

                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                  <span>{error}</span>

                </div>

              )}

              {/* SUCCESS */}

              {success && (

                <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">

                  <Check className="h-5 w-5" />

                  {success}

                </div>

              )}

              {/* EDIT */}

              {editingColor ? (

                <div className="space-y-5">

                  {/* COLOR NAME */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Color Name
                    </label>

                    <input
                      type="text"
                      value={colorName}
                      onChange={(e) =>
                        setColorName(
                          e.target.value
                        )
                      }
                      placeholder="Enter color name"
                      className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  {/* STATUS */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Status
                    </label>

                    <div className="relative">

                      <select
                        value={status}
                        onChange={(e) =>
                          setStatus(
                            e.target.value as
                              | "active"
                              | "inactive"
                          )
                        }
                        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >

                        <option value="active">
                          Active
                        </option>

                        <option value="inactive">
                          Inactive
                        </option>

                      </select>

                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    </div>

                  </div>

                </div>

              ) : (

                /* ADD MULTIPLE */

                <div>

                  <div className="mb-3 flex items-center justify-between">

                    <label className="text-sm font-semibold text-slate-700">
                      Colors
                    </label>

                    <button
                      type="button"
                      onClick={addColorInput}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add another
                    </button>

                  </div>

                  <div className="space-y-3">

                    {multipleColors.map(
                      (color, index) => (

                        <div
                          key={index}
                          className="flex items-center gap-2"
                        >

                          <div className="relative flex-1">

                            <input
                              type="text"
                              value={color}
                              onChange={(e) =>
                                updateMultipleColor(
                                  index,
                                  e.target.value
                                )
                              }
                              placeholder={`Color ${
                                index + 1
                              }`}
                              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeColorInput(
                                index
                              )
                            }
                            disabled={
                              multipleColors.length ===
                              1
                            }
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <X className="h-4 w-4" />
                          </button>

                        </div>

                      )
                    )}

                  </div>

                  <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-700">
                    You can add multiple colors in one request. Duplicate colors are automatically ignored.
                  </div>

                </div>

              )}

            </div>

            {/* FOOTER */}

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  editingColor
                    ? submitEditColor
                    : submitMultipleColors
                }
                disabled={saving}
                className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {saving && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {editingColor
                  ? "Update Color"
                  : "Add Colors"}

              </button>

            </div>

          </div>

        </div>
      )}

      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      {showDeleteModal &&
        deleteColor && (

          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">

                  <Trash2 className="h-5 w-5" />

                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Delete Color
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">

                    Are you sure you want to delete{" "}

                    <span className="font-semibold text-slate-800">
                      {deleteColor.name}
                    </span>
                    ?

                  </p>

                </div>

              </div>

              {error && (

                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>

              )}

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteColor(null);
                    setError("");
                  }}
                  disabled={
                    deleting !== null
                  }
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={
                    deleting !== null
                  }
                  className="inline-flex min-w-[100px] items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >

                  {deleting !== null && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  Delete

                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}