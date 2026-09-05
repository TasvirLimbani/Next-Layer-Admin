// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Plus,
//   Search,
//   Pencil,
//   Trash2,
//   X,
//   Palette,
//   RefreshCw,
//   Check,
//   Loader2,
//   AlertCircle,
//   ChevronDown,
// } from "lucide-react";

// /* =========================================================
//    TYPES
// ========================================================= */

// interface Color {
//   id: number;
//   name: string;
//   status: "active" | "inactive";
//   created_at?: string;
//   updated_at?: string;
// }

// /* =========================================================
//    API
// ========================================================= */

// const API_URL = "/api/color";

// /* =========================================================
//    PAGE
// ========================================================= */

// export default function ColorPage() {
//   /* =======================================================
//      STATE
//   ======================================================= */

//   const [colors, setColors] = useState<Color[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [deleting, setDeleting] = useState<number | null>(null);

//   const [search, setSearch] = useState("");

//   const [showModal, setShowModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);

//   const [editingColor, setEditingColor] =
//     useState<Color | null>(null);

//   const [deleteColor, setDeleteColor] =
//     useState<Color | null>(null);

//   const [colorName, setColorName] = useState("");

//   const [status, setStatus] =
//     useState<"active" | "inactive">("active");

//   const [multipleColors, setMultipleColors] =
//     useState<string[]>([""]);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   /* =======================================================
//      LOAD COLORS
//   ======================================================= */

//   const fetchColors = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await fetch(API_URL, {
//         method: "GET",
//         cache: "no-store",
//       });

//       const text = await response.text();

//       let data: any;

//       try {
//         data = JSON.parse(text);
//       } catch {
//         console.error("Invalid JSON:", text);
//         throw new Error(
//           "Color API returned invalid JSON"
//         );
//       }

//       if (!response.ok || !data.status) {
//         throw new Error(
//           data.message || "Failed to load colors"
//         );
//       }

//       setColors(
//         Array.isArray(data.colors)
//           ? data.colors
//           : []
//       );
//     } catch (err: any) {
//       console.error("FETCH COLORS ERROR:", err);

//       setError(
//         err?.message ||
//           "Something went wrong while loading colors"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchColors();
//   }, []);

//   /* =======================================================
//      SEARCH
//   ======================================================= */

//   const filteredColors = useMemo(() => {
//     const value = search.trim().toLowerCase();

//     if (!value) {
//       return colors;
//     }

//     return colors.filter((color) =>
//       color.name
//         .toLowerCase()
//         .includes(value)
//     );
//   }, [colors, search]);

//   /* =======================================================
//      OPEN ADD MODAL
//   ======================================================= */

//   const openAddModal = () => {
//     setEditingColor(null);
//     setColorName("");
//     setStatus("active");
//     setMultipleColors([""]);
//     setError("");
//     setSuccess("");
//     setShowModal(true);
//   };

//   /* =======================================================
//      OPEN EDIT MODAL
//   ======================================================= */

//   const openEditModal = (color: Color) => {
//     setEditingColor(color);
//     setColorName(color.name);
//     setStatus(color.status);
//     setError("");
//     setSuccess("");
//     setShowModal(true);
//   };

//   /* =======================================================
//      CLOSE MODAL
//   ======================================================= */

//   const closeModal = () => {
//     if (saving) return;

//     setShowModal(false);
//     setEditingColor(null);
//     setColorName("");
//     setStatus("active");
//     setMultipleColors([""]);
//     setError("");
//     setSuccess("");
//   };

//   /* =======================================================
//      MULTIPLE COLOR INPUT
//   ======================================================= */

//   const updateMultipleColor = (
//     index: number,
//     value: string
//   ) => {
//     setMultipleColors((prev) => {
//       const next = [...prev];

//       next[index] = value;

//       return next;
//     });
//   };

//   /* =======================================================
//      ADD COLOR INPUT
//   ======================================================= */

//   const addColorInput = () => {
//     setMultipleColors((prev) => [
//       ...prev,
//       "",
//     ]);
//   };

//   /* =======================================================
//      REMOVE COLOR INPUT
//   ======================================================= */

//   const removeColorInput = (
//     index: number
//   ) => {
//     setMultipleColors((prev) => {
//       if (prev.length === 1) {
//         return [""];
//       }

//       return prev.filter(
//         (_, i) => i !== index
//       );
//     });
//   };

//   /* =======================================================
//      ADD MULTIPLE COLORS
//   ======================================================= */

//   const submitMultipleColors = async () => {
//     try {
//       setSaving(true);
//       setError("");
//       setSuccess("");

//       /* Clean values */
//       const cleaned = multipleColors
//         .map((color) => color.trim())
//         .filter(Boolean);

//       if (cleaned.length === 0) {
//         setError(
//           "Please enter at least one color."
//         );
//         return;
//       }

//       /* Remove duplicate colors */
//       const uniqueColors = Array.from(
//         new Map(
//           cleaned.map((color) => [
//             color.toLowerCase(),
//             color,
//           ])
//         ).values()
//       );

//       /* ==================================================
//          FORM DATA
//       ================================================== */

//       const formData = new FormData();

//       uniqueColors.forEach((color) => {
//         formData.append(
//           "colors[]",
//           color
//         );
//       });

//       /* ==================================================
//          POST /api/color
//       ================================================== */

//       const response = await fetch(
//         API_URL,
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       const text = await response.text();

//       let data: any;

//       try {
//         data = JSON.parse(text);
//       } catch {
//         console.error("Invalid JSON:", text);

//         throw new Error(
//           "Color API returned invalid JSON"
//         );
//       }

//       if (!response.ok || !data.status) {
//         throw new Error(
//           data.message ||
//             "Failed to add colors"
//         );
//       }

//       setSuccess(
//         `${data.added_count || uniqueColors.length} color(s) added successfully.`
//       );

//       setMultipleColors([""]);

//       await fetchColors();

//       setTimeout(() => {
//         setShowModal(false);
//         setSuccess("");
//       }, 1000);
//     } catch (err: any) {
//       console.error(
//         "ADD COLORS ERROR:",
//         err
//       );

//       setError(
//         err?.message ||
//           "Failed to add colors"
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* =======================================================
//      UPDATE COLOR
//   ======================================================= */

//   const submitEditColor = async () => {
//     try {
//       if (!editingColor) return;

//       const name = colorName.trim();

//       if (!name) {
//         setError(
//           "Color name is required."
//         );
//         return;
//       }

//       setSaving(true);
//       setError("");
//       setSuccess("");

//       const formData = new FormData();

//       formData.append(
//         "id",
//         String(editingColor.id)
//       );

//       formData.append(
//         "name",
//         name
//       );

//       formData.append(
//         "status",
//         status
//       );

//       /* ==================================================
//          PUT /api/color
//       ================================================== */

//       const response = await fetch(
//         API_URL,
//         {
//           method: "PUT",
//           body: formData,
//         }
//       );

//       const text = await response.text();

//       let data: any;

//       try {
//         data = JSON.parse(text);
//       } catch {
//         console.error("Invalid JSON:", text);

//         throw new Error(
//           "Color API returned invalid JSON"
//         );
//       }

//       if (!response.ok || !data.status) {
//         throw new Error(
//           data.message ||
//             "Failed to update color"
//         );
//       }

//       setSuccess(
//         "Color updated successfully."
//       );

//       await fetchColors();

//       setTimeout(() => {
//         setShowModal(false);
//         setSuccess("");
//       }, 1000);
//     } catch (err: any) {
//       console.error(
//         "UPDATE COLOR ERROR:",
//         err
//       );

//       setError(
//         err?.message ||
//           "Failed to update color"
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* =======================================================
//      DELETE CONFIRM
//   ======================================================= */

//   const openDeleteModal = (
//     color: Color
//   ) => {
//     setDeleteColor(color);
//     setShowDeleteModal(true);
//     setError("");
//   };

//   /* =======================================================
//      DELETE COLOR
//   ======================================================= */

//   const confirmDelete = async () => {
//     if (!deleteColor) return;

//     try {
//       setDeleting(deleteColor.id);
//       setError("");

//       const formData = new FormData();

//       formData.append(
//         "id",
//         String(deleteColor.id)
//       );

//       /* ==================================================
//          DELETE /api/color
//       ================================================== */

//       const response = await fetch(
//         API_URL,
//         {
//           method: "DELETE",
//           body: formData,
//         }
//       );

//       const text = await response.text();

//       let data: any;

//       try {
//         data = JSON.parse(text);
//       } catch {
//         console.error("Invalid JSON:", text);

//         throw new Error(
//           "Color API returned invalid JSON"
//         );
//       }

//       if (!response.ok || !data.status) {
//         throw new Error(
//           data.message ||
//             "Failed to delete color"
//         );
//       }

//       setColors((prev) =>
//         prev.filter(
//           (item) =>
//             item.id !==
//             deleteColor.id
//         )
//       );

//       setShowDeleteModal(false);
//       setDeleteColor(null);

//       setSuccess(
//         "Color deleted successfully."
//       );

//       setTimeout(() => {
//         setSuccess("");
//       }, 2500);
//     } catch (err: any) {
//       console.error(
//         "DELETE COLOR ERROR:",
//         err
//       );

//       setError(
//         err?.message ||
//           "Failed to delete color"
//       );
//     } finally {
//       setDeleting(null);
//     }
//   };

//   /* =======================================================
//      TOGGLE STATUS
//   ======================================================= */

//   const toggleStatus = async (
//     color: Color
//   ) => {
//     try {
//       const newStatus =
//         color.status === "active"
//           ? "inactive"
//           : "active";

//       const formData = new FormData();

//       formData.append(
//         "id",
//         String(color.id)
//       );

//       formData.append(
//         "name",
//         color.name
//       );

//       formData.append(
//         "status",
//         newStatus
//       );

//       /* ==================================================
//          PUT /api/color
//       ================================================== */

//       const response = await fetch(
//         API_URL,
//         {
//           method: "PUT",
//           body: formData,
//         }
//       );

//       const text = await response.text();

//       let data: any;

//       try {
//         data = JSON.parse(text);
//       } catch {
//         console.error("Invalid JSON:", text);

//         throw new Error(
//           "Color API returned invalid JSON"
//         );
//       }

//       if (!response.ok || !data.status) {
//         throw new Error(
//           data.message ||
//             "Failed to update status"
//         );
//       }

//       setColors((prev) =>
//         prev.map((item) =>
//           item.id === color.id
//             ? {
//                 ...item,
//                 status: newStatus,
//               }
//             : item
//         )
//       );
//     } catch (err: any) {
//       console.error(
//         "TOGGLE STATUS ERROR:",
//         err
//       );

//       setError(
//         err?.message ||
//           "Failed to update status"
//       );
//     }
//   };

//   /* =======================================================
//      RENDER
//   ======================================================= */

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 md:p-6">

//       <div className="mx-auto max-w-7xl">

//         {/* =================================================
//             HEADER
//         ================================================= */}

//         <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

//           <div>

//             <div className="flex items-center gap-3">

//               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
//                 <Palette className="h-6 w-6" />
//               </div>

//               <div>

//                 <h1 className="text-2xl font-bold text-slate-900">
//                   Colors
//                 </h1>

//                 <p className="text-sm text-slate-500">
//                   Manage product colors
//                 </p>

//               </div>

//             </div>

//           </div>

//           <button
//             type="button"
//             onClick={openAddModal}
//             className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
//           >
//             <Plus className="h-5 w-5" />
//             Add Colors
//           </button>

//         </div>

//         {/* =================================================
//             SUCCESS
//         ================================================= */}

//         {success && (
//           <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">

//             <Check className="h-5 w-5 shrink-0" />

//             {success}

//           </div>
//         )}

//         {/* =================================================
//             ERROR
//         ================================================= */}

//         {error &&
//           !showModal &&
//           !showDeleteModal && (

//             <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

//               <AlertCircle className="h-5 w-5 shrink-0" />

//               <span>{error}</span>

//               <button
//                 type="button"
//                 onClick={() =>
//                   setError("")
//                 }
//                 className="ml-auto"
//               >
//                 <X className="h-4 w-4" />
//               </button>

//             </div>

//           )}

//         {/* =================================================
//             SEARCH / TOOLBAR
//         ================================================= */}

//         <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

//           <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

//             <div className="relative w-full md:max-w-md">

//               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

//               <input
//                 type="text"
//                 value={search}
//                 onChange={(e) =>
//                   setSearch(
//                     e.target.value
//                   )
//                 }
//                 placeholder="Search colors..."
//                 className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
//               />

//             </div>

//             <button
//               type="button"
//               onClick={fetchColors}
//               disabled={loading}
//               className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
//             >

//               <RefreshCw
//                 className={`h-4 w-4 ${
//                   loading
//                     ? "animate-spin"
//                     : ""
//                 }`}
//               />

//               Refresh

//             </button>

//           </div>

//         </div>

//         {/* =================================================
//             TABLE
//         ================================================= */}

//         <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

//           {loading ? (

//             <div className="flex min-h-[300px] items-center justify-center">

//               <div className="flex items-center gap-3 text-sm text-slate-500">

//                 <Loader2 className="h-5 w-5 animate-spin" />

//                 Loading colors...

//               </div>

//             </div>

//           ) : filteredColors.length === 0 ? (

//             <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

//               <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">

//                 <Palette className="h-7 w-7 text-slate-400" />

//               </div>

//               <h3 className="text-base font-semibold text-slate-800">
//                 No colors found
//               </h3>

//               <p className="mt-1 text-sm text-slate-500">

//                 {search
//                   ? "Try another search."
//                   : "Add your first product color."}

//               </p>

//             </div>

//           ) : (

//             <div className="overflow-x-auto">

//               <table className="w-full min-w-[700px]">

//                 <thead>

//                   <tr className="border-b border-slate-200 bg-slate-50">

//                     <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                       #
//                     </th>

//                     <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                       Color
//                     </th>

//                     <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                       Status
//                     </th>

//                     <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                       Created
//                     </th>

//                     <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
//                       Actions
//                     </th>

//                   </tr>

//                 </thead>

//                 <tbody>

//                   {filteredColors.map(
//                     (color, index) => (

//                       <tr
//                         key={color.id}
//                         className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
//                       >

//                         <td className="px-5 py-4 text-sm font-medium text-slate-500">
//                           {index + 1}
//                         </td>

//                         <td className="px-5 py-4">

//                           <div className="flex items-center gap-3">

//                             <div
//                               className="h-9 w-9 rounded-full border border-slate-300 shadow-sm"
//                               style={{
//                                 backgroundColor:
//                                   color.name.toLowerCase(),
//                               }}
//                             />

//                             <div>

//                               <div className="font-semibold text-slate-800">
//                                 {color.name}
//                               </div>

//                               <div className="text-xs text-slate-400">
//                                 ID: {color.id}
//                               </div>

//                             </div>

//                           </div>

//                         </td>

//                         <td className="px-5 py-4">

//                           <button
//                             type="button"
//                             onClick={() =>
//                               toggleStatus(color)
//                             }
//                             className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
//                               color.status ===
//                               "active"
//                                 ? "bg-green-50 text-green-700 hover:bg-green-100"
//                                 : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//                             }`}
//                           >

//                             <span
//                               className={`h-2 w-2 rounded-full ${
//                                 color.status ===
//                                 "active"
//                                   ? "bg-green-500"
//                                   : "bg-slate-400"
//                               }`}
//                             />

//                             {color.status ===
//                             "active"
//                               ? "Active"
//                               : "Inactive"}

//                           </button>

//                         </td>

//                         <td className="px-5 py-4 text-sm text-slate-500">

//                           {color.created_at
//                             ? new Date(
//                                 color.created_at
//                               ).toLocaleDateString()
//                             : "-"}

//                         </td>

//                         <td className="px-5 py-4">

//                           <div className="flex justify-end gap-2">

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 openEditModal(
//                                   color
//                                 )
//                               }
//                               className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
//                               title="Edit"
//                             >
//                               <Pencil className="h-4 w-4" />
//                             </button>

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 openDeleteModal(
//                                   color
//                                 )
//                               }
//                               className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
//                               title="Delete"
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </button>

//                           </div>

//                         </td>

//                       </tr>

//                     )
//                   )}

//                 </tbody>

//               </table>

//             </div>

//           )}

//         </div>

//         {/* =================================================
//             FOOTER
//         ================================================= */}

//         {!loading &&
//           filteredColors.length > 0 && (

//             <div className="mt-4 text-sm text-slate-500">

//               Showing{" "}

//               <span className="font-semibold text-slate-700">
//                 {filteredColors.length}
//               </span>{" "}

//               of{" "}

//               <span className="font-semibold text-slate-700">
//                 {colors.length}
//               </span>{" "}

//               colors

//             </div>

//           )}

//       </div>

//       {/* ===================================================
//           ADD / EDIT MODAL
//       =================================================== */}

//       {showModal && (

//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

//           <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

//             {/* HEADER */}

//             <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

//               <div>

//                 <h2 className="text-lg font-bold text-slate-900">

//                   {editingColor
//                     ? "Edit Color"
//                     : "Add Colors"}

//                 </h2>

//                 <p className="mt-1 text-xs text-slate-500">

//                   {editingColor
//                     ? "Update color details."
//                     : "Add one or multiple colors."}

//                 </p>

//               </div>

//               <button
//                 type="button"
//                 onClick={closeModal}
//                 disabled={saving}
//                 className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
//               >
//                 <X className="h-5 w-5" />
//               </button>

//             </div>

//             {/* BODY */}

//             <div className="max-h-[70vh] overflow-y-auto p-6">

//               {/* ERROR */}

//               {error && (

//                 <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

//                   <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

//                   <span>{error}</span>

//                 </div>

//               )}

//               {/* SUCCESS */}

//               {success && (

//                 <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">

//                   <Check className="h-5 w-5" />

//                   {success}

//                 </div>

//               )}

//               {/* EDIT */}

//               {editingColor ? (

//                 <div className="space-y-5">

//                   {/* COLOR NAME */}

//                   <div>

//                     <label className="mb-2 block text-sm font-semibold text-slate-700">
//                       Color Name
//                     </label>

//                     <input
//                       type="text"
//                       value={colorName}
//                       onChange={(e) =>
//                         setColorName(
//                           e.target.value
//                         )
//                       }
//                       placeholder="Enter color name"
//                       className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                     />

//                   </div>

//                   {/* STATUS */}

//                   <div>

//                     <label className="mb-2 block text-sm font-semibold text-slate-700">
//                       Status
//                     </label>

//                     <div className="relative">

//                       <select
//                         value={status}
//                         onChange={(e) =>
//                           setStatus(
//                             e.target.value as
//                               | "active"
//                               | "inactive"
//                           )
//                         }
//                         className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                       >

//                         <option value="active">
//                           Active
//                         </option>

//                         <option value="inactive">
//                           Inactive
//                         </option>

//                       </select>

//                       <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

//                     </div>

//                   </div>

//                 </div>

//               ) : (

//                 /* ADD MULTIPLE */

//                 <div>

//                   <div className="mb-3 flex items-center justify-between">

//                     <label className="text-sm font-semibold text-slate-700">
//                       Colors
//                     </label>

//                     <button
//                       type="button"
//                       onClick={addColorInput}
//                       className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
//                     >
//                       <Plus className="h-4 w-4" />
//                       Add another
//                     </button>

//                   </div>

//                   <div className="space-y-3">

//                     {multipleColors.map(
//                       (color, index) => (

//                         <div
//                           key={index}
//                           className="flex items-center gap-2"
//                         >

//                           <div className="relative flex-1">

//                             <input
//                               type="text"
//                               value={color}
//                               onChange={(e) =>
//                                 updateMultipleColor(
//                                   index,
//                                   e.target.value
//                                 )
//                               }
//                               placeholder={`Color ${
//                                 index + 1
//                               }`}
//                               className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                             />

//                           </div>

//                           <button
//                             type="button"
//                             onClick={() =>
//                               removeColorInput(
//                                 index
//                               )
//                             }
//                             disabled={
//                               multipleColors.length ===
//                               1
//                             }
//                             className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
//                           >
//                             <X className="h-4 w-4" />
//                           </button>

//                         </div>

//                       )
//                     )}

//                   </div>

//                   <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-700">
//                     You can add multiple colors in one request. Duplicate colors are automatically ignored.
//                   </div>

//                 </div>

//               )}

//             </div>

//             {/* FOOTER */}

//             <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

//               <button
//                 type="button"
//                 onClick={closeModal}
//                 disabled={saving}
//                 className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 onClick={
//                   editingColor
//                     ? submitEditColor
//                     : submitMultipleColors
//                 }
//                 disabled={saving}
//                 className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
//               >

//                 {saving && (
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                 )}

//                 {editingColor
//                   ? "Update Color"
//                   : "Add Colors"}

//               </button>

//             </div>

//           </div>

//         </div>
//       )}

//       {/* ===================================================
//           DELETE MODAL
//       =================================================== */}

//       {showDeleteModal &&
//         deleteColor && (

//           <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

//             <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

//               <div className="flex items-start gap-4">

//                 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">

//                   <Trash2 className="h-5 w-5" />

//                 </div>

//                 <div>

//                   <h2 className="text-lg font-bold text-slate-900">
//                     Delete Color
//                   </h2>

//                   <p className="mt-2 text-sm leading-6 text-slate-500">

//                     Are you sure you want to delete{" "}

//                     <span className="font-semibold text-slate-800">
//                       {deleteColor.name}
//                     </span>
//                     ?

//                   </p>

//                 </div>

//               </div>

//               {error && (

//                 <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//                   {error}
//                 </div>

//               )}

//               <div className="mt-6 flex justify-end gap-3">

//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowDeleteModal(false);
//                     setDeleteColor(null);
//                     setError("");
//                   }}
//                   disabled={
//                     deleting !== null
//                   }
//                   className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="button"
//                   onClick={confirmDelete}
//                   disabled={
//                     deleting !== null
//                   }
//                   className="inline-flex min-w-[100px] items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
//                 >

//                   {deleting !== null && (
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                   )}

//                   Delete

//                 </button>

//               </div>

//             </div>

//           </div>
//         )}

//     </div>
//   );
// }




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
   COLOR NAME -> CSS COLOR
========================================================= */

const COLOR_MAP: Record<string, string> = {
  /* Basic */
  red: "#FF0000",
  green: "#008000",
  blue: "#0000FF",
  yellow: "#FFFF00",
  orange: "#FFA500",
  purple: "#800080",
  pink: "#FFC0CB",
  black: "#000000",
  "jet black": "#0A0A0A",
  white: "#FFFFFF",
  gray: "#808080",
  grey: "#808080",
  brown: "#A52A2A",

  /* Pink */
  "baby pink": "#F4C2C2",
  babypink: "#F4C2C2",
  "light pink": "#FFB6C1",
  lightpink: "#FFB6C1",
  "hot pink": "#FF69B4",
  hotpink: "#FF69B4",
  "dark pink": "#FF1493",
  darkpink: "#FF1493",
  "rose pink": "#FF66CC",
  rosepink: "#FF66CC",
  "dusty pink": "#DCAE96",
  dustypink: "#DCAE96",
  "blush pink": "#DE5D83",
  blushpink: "#DE5D83",
  "salmon pink": "#FA8072",
  salmonpink: "#FA8072",
  "peach pink": "#FFD1C1",
  peachpink: "#FFD1C1",
  "pastel pink": "#FFD1DC",
  pastelpink: "#FFD1DC",

  /* Blue */
  "sky blue": "#87CEEB",
  skyblue: "#87CEEB",
  "light blue": "#ADD8E6",
  lightblue: "#ADD8E6",
  "dark blue": "#00008B",
  darkblue: "#00008B",
  "royal blue": "#4169E1",
  royalblue: "#4169E1",
  "navy blue": "#000080",
  navyblue: "#000080",
  "baby blue": "#89CFF0",
  babyblue: "#89CFF0",
  "powder blue": "#B0E0E6",
  powderblue: "#B0E0E6",
  "ice blue": "#D6F0FF",
  iceblue: "#D6F0FF",
  "denim blue": "#1560BD",
  denimblue: "#1560BD",
  "midnight blue": "#191970",
  midnightblue: "#191970",
  "ocean blue": "#0077BE",
  oceanblue: "#0077BE",

  /* Green */
  "light green": "#90EE90",
  lightgreen: "#90EE90",
  "dark green": "#006400",
  darkgreen: "#006400",
  "mint green": "#98FF98",
  mintgreen: "#98FF98",
  "sea green": "#2E8B57",
  seagreen: "#2E8B57",
  "lime green": "#32CD32",
  limegreen: "#32CD32",
  "olive green": "#6B8E23",
  olivegreen: "#6B8E23",
  "forest green": "#228B22",
  forestgreen: "#228B22",
  "pastel green": "#77DD77",
  pastelgreen: "#77DD77",

  /* Yellow */
  "light yellow": "#FFFFE0",
  lightyellow: "#FFFFE0",
  "dark yellow": "#CCCC00",
  darkyellow: "#CCCC00",
  "lemon yellow": "#FFF44F",
  lemonyellow: "#FFF44F",
  "mustard yellow": "#FFDB58",
  mustardyellow: "#FFDB58",
  "pastel yellow": "#FDFD96",
  pastelyellow: "#FDFD96",

  /* Orange */
  "light orange": "#FFDAB9",
  lightorange: "#FFDAB9",
  "dark orange": "#FF8C00",
  darkorange: "#FF8C00",
  "peach orange": "#FFCBA4",
  peachorange: "#FFCBA4",
  "burnt orange": "#CC5500",
  burntorange: "#CC5500",

  /* Purple */
  "light purple": "#D8BFD8",
  lightpurple: "#D8BFD8",
  "dark purple": "#4B0082",
  darkpurple: "#4B0082",
  "lavender purple": "#967BB6",
  lavenderpurple: "#967BB6",
  lavender: "#E6E6FA",
  violet: "#8F00FF",
  "deep purple": "#673AB7",
  deeppurple: "#673AB7",
  "pastel purple": "#C3B1E1",
  pastelpurple: "#C3B1E1",

  /* Red */
  "light red": "#FF7F7F",
  lightred: "#FF7F7F",
  "dark red": "#8B0000",
  darkred: "#8B0000",
  "brick red": "#CB4154",
  brickred: "#CB4154",
  "wine red": "#722F37",
  winered: "#722F37",
  maroon: "#800000",
  burgundy: "#800020",
  crimson: "#DC143C",

  /* Brown */
  "light brown": "#C4A484",
  lightbrown: "#C4A484",
  "dark brown": "#654321",
  darkbrown: "#654321",
  beige: "#F5F5DC",
  cream: "#FFFDD0",
  tan: "#D2B48C",
  chocolate: "#7B3F00",
  "coffee brown": "#6F4E37",
  caramel: "#C68E17",

  /* White */
  "off white": "#FAF9F6",
  offwhite: "#FAF9F6",
  ivory: "#FFFFF0",
  pearl: "#EAE0C8",
  "snow white": "#FFFAFA",
  snowwhite: "#FFFAFA",

  /* Gray */
  "light gray": "#D3D3D3",
  lightgray: "#D3D3D3",
  "dark gray": "#A9A9A9",
  darkgray: "#A9A9A9",
  silver: "#C0C0C0",
  charcoal: "#36454F",
  "slate gray": "#708090",
  slategray: "#708090",

  /* Special */
  cyan: "#00FFFF",
  aqua: "#00FFFF",
  teal: "#008080",
  turquoise: "#40E0D0",
  magenta: "#FF00FF",
  gold: "#FFD700",
  bronze: "#CD7F32",
  rose: "#FF007F",
  coral: "#FF7F50",
  peach: "#FFE5B4",
};

/* =========================================================
   GET COLOR PREVIEW
========================================================= */

function getColorPreview(colorName: string): string {
  const original = colorName.trim();

  if (!original) {
    return "#E2E8F0";
  }

  const normalized = original
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  /*
    First check our custom color map.
  */
  if (COLOR_MAP[normalized]) {
    return COLOR_MAP[normalized];
  }

  const noSpaces = normalized.replace(/[\s-_]/g, "");

  if (COLOR_MAP[noSpaces]) {
    return COLOR_MAP[noSpaces];
  }

  /*
    Allow CSS color names directly.
    Example:
    red, blue, green, tomato, salmon, etc.
  */
  if (
    typeof window !== "undefined" &&
    typeof CSS !== "undefined" &&
    CSS.supports("color", original)
  ) {
    return original;
  }

  /*
    If user enters HEX directly.
  */
  if (
    /^#([0-9A-F]{3}){1,2}$/i.test(original)
  ) {
    return original;
  }

  /*
    RGB / RGBA / HSL / HSLA
  */
  if (
    /^(rgb|rgba|hsl|hsla)\(/i.test(original)
  ) {
    return original;
  }

  /*
    Unknown custom color.
    Use a neutral preview.
  */
  return "#CBD5E1";
}

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
          data.message ||
          "Failed to load colors"
        );
      }

      setColors(
        Array.isArray(data.colors)
          ? data.colors
          : []
      );
    } catch (err: any) {
      console.error(
        "FETCH COLORS ERROR:",
        err
      );

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

      const cleaned = multipleColors
        .map((color) => color.trim())
        .filter(Boolean);

      if (cleaned.length === 0) {
        setError(
          "Please enter at least one color."
        );
        return;
      }

      const uniqueColors = Array.from(
        new Map(
          cleaned.map((color) => [
            color.toLowerCase(),
            color,
          ])
        ).values()
      );

      const formData = new FormData();

      uniqueColors.forEach((color) => {
        formData.append(
          "colors[]",
          color
        );
      });

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
        console.error(
          "Invalid JSON:",
          text
        );

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
        `${data.added_count ||
        uniqueColors.length
        } color(s) added successfully.`
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
        console.error(
          "Invalid JSON:",
          text
        );

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
        console.error(
          "Invalid JSON:",
          text
        );

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
        console.error(
          "Invalid JSON:",
          text
        );

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

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

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

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Add Colors
          </button>

        </div>

        {/* SUCCESS */}

        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            <Check className="h-5 w-5 shrink-0" />
            {success}
          </div>
        )}

        {/* ERROR */}

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

        {/* SEARCH */}

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
                className={`h-4 w-4 ${loading
                  ? "animate-spin"
                  : ""
                  }`}
              />

              Refresh

            </button>

          </div>

        </div>

        {/* TABLE */}

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

                            {/* COLOR PREVIEW */}

                            <div
                              className="h-9 w-9 shrink-0 rounded-full border border-slate-300 shadow-sm"
                              style={{
                                backgroundColor:
                                  getColorPreview(
                                    color.name
                                  ),
                              }}
                              title={color.name}
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
                              toggleStatus(
                                color
                              )
                            }
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${color.status ===
                              "active"
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                          >

                            <span
                              className={`h-2 w-2 rounded-full ${color.status ===
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

        {/* FOOTER */}

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
                      placeholder="Example: Baby Pink"
                      className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    {/* LIVE PREVIEW */}

                    {colorName.trim() && (

                      <div className="mt-3 flex items-center gap-3">

                        <div
                          className="h-10 w-10 rounded-full border border-slate-300 shadow-sm"
                          style={{
                            backgroundColor:
                              getColorPreview(
                                colorName
                              ),
                          }}
                        />

                        <div className="text-sm text-slate-600">

                          Preview:{" "}

                          <span className="font-semibold text-slate-800">
                            {colorName}
                          </span>

                        </div>

                      </div>

                    )}

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

                          {/* PREVIEW */}

                          <div
                            className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 shadow-sm"
                            style={{
                              backgroundColor:
                                color.trim()
                                  ? getColorPreview(
                                    color
                                  )
                                  : "#F1F5F9",
                            }}
                            title={
                              color ||
                              "Color preview"
                            }
                          />

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
                              placeholder={`Color ${index + 1
                                } - e.g. Baby Pink`}
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

                  {/* EXAMPLES */}

                  <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700">

                    <div className="font-semibold">
                      Examples:
                    </div>

                    Baby Pink, Sky Blue,
                    Royal Blue, Dark Green,
                    Mint Green, Light Yellow,
                    Maroon, Beige, Lavender

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
                    setShowDeleteModal(
                      false
                    );
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
