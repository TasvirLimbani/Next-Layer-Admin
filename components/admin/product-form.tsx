// 'use client';

// import { useEffect, useState } from 'react';

// import { Product } from './mock-data';
// import { normalizeProductImageUrls } from '@/lib/utils';

// import {
//   X,
//   Upload,
//   Package,
//   DollarSign,
//   Boxes,
//   Tag,
//   FileText,
//   Star,
//   Trash2,
// } from 'lucide-react';

// import { Switch } from '@/components/ui/switch';
// import { Spinner } from '@/components/ui/spinner';

// interface ProductFormProps {
//   product?: Product;

//   onSubmit: (
//     data: Product,
//     formData?: FormData
//   ) => Promise<void> | void;

//   onClose: () => void;
// }
// const [formError, setFormError] = useState('');
// /* =========================================================
//    CATEGORY OPTIONS
// ========================================================= */

// const categories = [
//   'Keychains',
// ];

// /* =========================================================
//    COLOR API TYPE
// ========================================================= */

// interface ApiColor {
//   id: number;
//   name: string;
//   status: 'active' | 'inactive';
//   created_at?: string;
//   updated_at?: string;
// }

// /* =========================================================
//    IMAGE TYPES
// ========================================================= */

// type ImageItem = {
//   id: string;
//   kind: 'existing' | 'new';
//   src: string;
//   file?: File;
// };

// type ImageGroup = {
//   id: string;
//   color: string;
//   items: ImageItem[];
// };

// type SimilarImageItem = {
//   id: string;
//   kind: 'existing' | 'new';
//   src: string;
//   file?: File;
// };

// /* =========================================================
//    CREATE IMAGE ITEM
// ========================================================= */

// function createImageItem(
//   kind: 'existing' | 'new',
//   src: string,
//   file?: File
// ): ImageItem {
//   return {
//     id: `${kind}-${src}-${Math.random()
//       .toString(36)
//       .slice(2, 8)}`,
//     kind,
//     src,
//     file,
//   };
// }

// /* =========================================================
//    DISPLAY URL
// ========================================================= */

// function toDisplayUrl(value: string) {
//   if (
//     value.startsWith('http://') ||
//     value.startsWith('https://') ||
//     value.startsWith('blob:') ||
//     value.startsWith('data:') ||
//     value.startsWith('/')
//   ) {
//     return value;
//   }

//   return `http://nextlayer.soon.it/images/${value.replace(
//     /^\/+/,
//     ''
//   )}`;
// }

// /* =========================================================
//    IMAGE PREVIEW
// ========================================================= */

// function getPreviewSrc(value: string) {
//   if (
//     value.startsWith('blob:') ||
//     value.startsWith('data:')
//   ) {
//     return value;
//   }

//   return `/api/image-proxy?url=${encodeURIComponent(
//     value
//   )}`;
// }

// /* =========================================================
//    BUILD INITIAL COLOR GROUPS
// ========================================================= */

// function buildInitialImageGroups(
//   product?: Product
// ): ImageGroup[] {
//   const productColors = Array.isArray(product?.color)
//     ? product.color
//         .map((item) => String(item).trim())
//         .filter(Boolean)
//     : product?.color &&
//         String(product.color).trim()
//       ? [String(product.color).trim()]
//       : [];

//   const groups =
//     Array.isArray(product?.variants)
//       ? product.variants
//       : Array.isArray(product?.images)
//         ? product.images
//         : [];

//   /*
//    * No variants/images = no color groups.
//    */
//   if (!groups.length) {
//     return [];
//   }

//   return groups
//     .map((group: any, index: number) => {
//       const color = String(
//         group?.color ||
//           productColors[index] ||
//           ''
//       ).trim();

//       const imageValues =
//         Array.isArray(group?.image_urls)
//           ? group.image_urls
//           : Array.isArray(group?.images)
//             ? group.images
//             : Array.isArray(group?.image)
//               ? group.image
//               : typeof group?.images === 'string'
//                 ? [group.images]
//                 : [];

//       /*
//        * Ignore completely empty groups.
//        */
//       if (!color && imageValues.length === 0) {
//         return null;
//       }

//       return {
//         id: `group-${index}-${Date.now()}`,
//         color,
//         items: imageValues
//           .map((value: any) =>
//             String(value).trim()
//           )
//           .filter(Boolean)
//           .map((value: string) =>
//             createImageItem(
//               'existing',
//               value
//             )
//           ),
//       };
//     })
//     .filter(Boolean) as ImageGroup[];
// }

// /* =========================================================
//    SYNC COLORS
// ========================================================= */

// function syncColorState(
//   groups: ImageGroup[]
// ) {
//   return groups
//     .map((group) =>
//       group.color.trim()
//     )
//     .filter(Boolean);
// }

// /* =========================================================
//    PRODUCT FORM
// ========================================================= */

// export function ProductForm({
//   product,
//   onSubmit,
//   onClose,
// }: ProductFormProps) {
//   /* =======================================================
//      COLOR API STATE
//   ======================================================= */

//   const [
//     colorOptions,
//     setColorOptions,
//   ] = useState<ApiColor[]>([]);

//   const [
//     loadingColors,
//     setLoadingColors,
//   ] = useState(false);

//   /* =======================================================
//      FORM DATA
//   ======================================================= */

//   const [
//     formData,
//     setFormData,
//   ] = useState<Product>(
//     product
//       ? {
//           ...product,

//           name: product.name || '',

//           price:
//             Number(product.price) || 0,

//           stock:
//             Number(product.stock) || 0,

//           category:
//             product.category || '',

//           subcategory:
//             product.subcategory || '',

//           sku:
//             product.sku || '',

//           customizable:
//             product.customizable ? 1 : 0,

//           image_customizable:
//             product.image_customizable
//               ? 1
//               : 0,

//           status:
//             product.status || 'active',

//           color:
//             Array.isArray(product.color)
//               ? product.color
//                   .filter(
//                     (c: any) =>
//                       c &&
//                       String(c).trim()
//                   )
//                   .map((c: any) =>
//                     String(c).trim()
//                   )
//               : product.color &&
//                   String(product.color).trim()
//                 ? [
//                     String(
//                       product.color
//                     ).trim(),
//                   ]
//                 : [],
//         }
//       : {
//           id: '',
//           name: '',
//           color: [],
//           category: '',
//           subcategory: '',
//           sku: `SKU-${Date.now()}`,
//           price: 0,
//           stock: 0,
//           description: '',
//           image: '',
//           customizable: 0,
//           image_customizable: 0,
//           status: 'active',
//           image_urls: [],
//         }
//   );

//   /* =======================================================
//      COLOR IMAGE STATE
//   ======================================================= */

//   const [
//     imageGroups,
//     setImageGroups,
//   ] = useState<ImageGroup[]>(() =>
//     buildInitialImageGroups(product)
//   );

//   const [
//     deletedImages,
//     setDeletedImages,
//   ] = useState<string[]>([]);

//   /* =======================================================
//      SIMILAR IMAGE STATE
//   ======================================================= */

//   const [
//     similarImages,
//     setSimilarImages,
//   ] = useState<SimilarImageItem[]>(
//     []
//   );

//   const [
//     deletedSimilarImages,
//     setDeletedSimilarImages,
//   ] = useState<string[]>([]);

//   /* =======================================================
//      SUBMIT STATE
//   ======================================================= */

//   const [
//     isSubmitting,
//     setIsSubmitting,
//   ] = useState(false);

//   /* =======================================================
//      LOAD COLOR OPTIONS
//   ======================================================= */

//   useEffect(() => {
//     const fetchColors = async () => {
//       try {
//         setLoadingColors(true);

//         console.log(
//           'Calling color API...'
//         );

//         const response = await fetch(
//           '/api/color',
//           {
//             method: 'GET',
//             cache: 'no-store',
//           }
//         );

//         console.log(
//           'Color API response:',
//           response.status
//         );

//         if (!response.ok) {
//           throw new Error(
//             `Color API failed: ${response.status}`
//           );
//         }

//         const data =
//           await response.json();

//         console.log(
//           'Color API data:',
//           data
//         );

//         if (
//           data.status &&
//           Array.isArray(data.colors)
//         ) {
//           /*
//            * Only active colors.
//            */
//           const activeColors =
//             data.colors.filter(
//               (color: ApiColor) =>
//                 color.status ===
//                 'active'
//             );

//           console.log(
//             'Active colors:',
//             activeColors
//           );

//           setColorOptions(
//             activeColors
//           );
//         } else {
//           setColorOptions([]);

//           console.error(
//             'Failed to load colors:',
//             data.message
//           );
//         }
//       } catch (error) {
//         console.error(
//           'Color API error:',
//           error
//         );

//         setColorOptions([]);
//       } finally {
//         setLoadingColors(false);
//       }
//     };

//     fetchColors();
//   }, []);

//   /* =======================================================
//      LOAD EDIT PRODUCT
//   ======================================================= */

//   useEffect(() => {
//     if (!product) {
//       setImageGroups([]);
//       setSimilarImages([]);
//       setDeletedSimilarImages([]);
//       setDeletedImages([]);

//       return;
//     }

//     /* -----------------------------------------------
//        COLOR VARIANTS
//     ------------------------------------------------ */

//     const groups =
//       buildInitialImageGroups(
//         product
//       );

//     setImageGroups(groups);

//     setFormData((prev) => ({
//       ...prev,

//       color: groups
//         .map(
//           (group) =>
//             group.color
//         )
//         .filter(Boolean),
//     }));

//     /* -----------------------------------------------
//        SIMILAR IMAGES
//     ------------------------------------------------ */

//     const rawSimilar =
//       (product as any).similar;

//     const similarArray =
//       Array.isArray(rawSimilar)
//         ? rawSimilar
//         : [];

//     const normalizedSimilar =
//       similarArray
//         .map(
//           (
//             item: any,
//             index: number
//           ) => {
//             let src = '';

//             if (
//               typeof item ===
//               'string'
//             ) {
//               src = item;
//             } else if (
//               item &&
//               typeof item ===
//                 'object'
//             ) {
//               src =
//                 item.image_url ||
//                 item.image ||
//                 '';
//             }

//             if (!src) {
//               return null;
//             }

//             return {
//               id: `similar-existing-${index}-${src}`,

//               kind: 'existing' as const,

//               src: String(src),
//             };
//           }
//         )
//         .filter(
//           Boolean
//         ) as SimilarImageItem[];

//     setSimilarImages(
//       normalizedSimilar
//     );

//     setDeletedSimilarImages([]);
//     setDeletedImages([]);
//   }, [product]);

//   /* =======================================================
//      SUBMIT
//   ======================================================= */

//   const handleSubmit = async (
//     e: React.FormEvent
//   ) => {
//     e.preventDefault();

//     /* -----------------------------------------------
//        BASIC VALIDATION
//     ------------------------------------------------ */

//   if (
//   !formData.name ||
//   !formData.price ||
//   !formData.stock
// ) {
//   alert('Please fill all required fields');
//   return;
// }

//     /* -----------------------------------------------
//        COLOR VALIDATION
//     ------------------------------------------------ */

//     const invalidColor =
//       imageGroups.some(
//         (group) =>
//           !group.color.trim()
//       );

//     if (invalidColor) {
//       alert(
//         'Please select a valid color for every color variant.'
//       );

//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const apiFormData =
//         new FormData();

//       /* ---------------------------------------------
//          PRODUCT DATA
//       --------------------------------------------- */

//       apiFormData.append(
//         'product_name',
//         formData.name || ''
//       );

//       apiFormData.append(
//         'category',
//         formData.category || ''
//       );

//       apiFormData.append(
//         'subcategory',
//         formData.subcategory || ''
//       );

//       apiFormData.append(
//         'sku',
//         formData.sku || ''
//       );

//       apiFormData.append(
//         'price',
//         String(
//           formData.price || 0
//         )
//       );

//       apiFormData.append(
//         'stock',
//         String(
//           formData.stock || 0
//         )
//       );

//       apiFormData.append(
//         'description',
//         formData.description || ''
//       );

//       apiFormData.append(
//         'status',
//         formData.status ||
//           'active'
//       );

//       apiFormData.append(
//         'customizable',
//         String(
//           formData.customizable ||
//             0
//         )
//       );

//       apiFormData.append(
//         'image_customizable',
//         String(
//           formData.image_customizable ||
//             0
//         )
//       );

//       /* =================================================
//          EDIT PRODUCT
//       ================================================= */

//       if (product?.id) {
//         apiFormData.append(
//           'product_id',
//           String(product.id)
//         );

//         /* ---------------------------------------------
//            DELETED COLOR IMAGES
//         --------------------------------------------- */

//         apiFormData.append(
//           'delete_images',
//           JSON.stringify(
//             deletedImages || []
//           )
//         );

//         /* ---------------------------------------------
//            COLOR VARIANTS
//         --------------------------------------------- */

//         imageGroups.forEach(
//           (group, index) => {
//             const color =
//               group.color.trim();

//             if (!color) {
//               return;
//             }

//             apiFormData.append(
//               `variants[${index}][color]`,
//               color
//             );

//             group.items.forEach(
//               (item) => {
//                 /* NEW IMAGE */

//                 if (
//                   item.kind === 'new' &&
//                   item.file
//                 ) {
//                   apiFormData.append(
//                     `variants[${index}][images][]`,
//                     item.file,
//                     item.file.name
//                   );
//                 }

//                 /* EXISTING IMAGE */

//                 if (
//                   item.kind ===
//                   'existing'
//                 ) {
//                   apiFormData.append(
//                     `variants[${index}][existing_images][]`,
//                     item.src
//                       .split('/')
//                       .pop() ||
//                       item.src
//                   );
//                 }
//               }
//             );
//           }
//         );

//         /* =============================================
//            SIMILAR IMAGES - EDIT
//         ============================================= */

//         apiFormData.append(
//           'delete_similar',
//           JSON.stringify(
//             deletedSimilarImages ||
//               []
//           )
//         );

//         similarImages.forEach(
//           (item) => {
//             /* NEW SIMILAR IMAGE */

//             if (
//               item.kind === 'new' &&
//               item.file
//             ) {
//               apiFormData.append(
//                 'similar[]',
//                 item.file,
//                 item.file.name
//               );
//             }

//             /* EXISTING SIMILAR IMAGE */

//             if (
//               item.kind ===
//               'existing'
//             ) {
//               apiFormData.append(
//                 'existing_similar[]',
//                 item.src
//                   .split('/')
//                   .pop() ||
//                   item.src
//               );
//             }
//           }
//         );
//       } else {
//         /* =================================================
//            ADD PRODUCT
//         ================================================= */

//         /* -----------------------------------------------
//            COLOR VARIANTS
//         ------------------------------------------------ */

//         imageGroups.forEach(
//           (group, index) => {
//             const color =
//               group.color.trim();

//             if (!color) {
//               return;
//             }

//             apiFormData.append(
//               'colors[]',
//               color
//             );

//             group.items.forEach(
//               (item) => {
//                 if (
//                   item.kind ===
//                     'new' &&
//                   item.file
//                 ) {
//                   apiFormData.append(
//                     `images_${index}[]`,
//                     item.file,
//                     item.file.name
//                   );
//                 }
//               }
//             );
//           }
//         );

//         /* -----------------------------------------------
//            SIMILAR IMAGES
//         ------------------------------------------------ */

//         similarImages.forEach(
//           (item) => {
//             if (
//               item.kind === 'new' &&
//               item.file
//             ) {
//               apiFormData.append(
//                 'similar[]',
//                 item.file,
//                 item.file.name
//               );
//             }
//           }
//         );
//       }

//       /* =================================================
//          DEBUG
//       ================================================= */

//       console.log(
//         '========== PRODUCT FORM DATA =========='
//       );

//       for (
//         const [
//           key,
//           value,
//         ] of apiFormData.entries()
//       ) {
//         console.log(
//           key,
//           value
//         );
//       }

//       console.log(
//         'Similar images:',
//         similarImages
//       );

//       console.log(
//         'Deleted similar images:',
//         deletedSimilarImages
//       );

//       /* =================================================
//          SUBMIT TO PARENT
//       ================================================= */

//       await onSubmit(
//         formData,
//         apiFormData
//       );
//     } catch (error) {
//       console.error(
//         'Product submit error:',
//         error
//       );

//       alert(
//         'Something went wrong while submitting the product.'
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   /* =======================================================
//      INPUT CHANGE
//   ======================================================= */

//   const handleChange = (
//     e: React.ChangeEvent<
//       | HTMLInputElement
//       | HTMLTextAreaElement
//       | HTMLSelectElement
//     >
//   ) => {
//     const {
//       name,
//       value,
//     } = e.target;

//     setFormData((prev) => ({
//       ...prev,

//       [name]:
//         name === 'price' ||
//         name === 'stock'
//           ? Number(value)
//           : value,
//     }));
//   };

//   /* =======================================================
//      STATUS
//   ======================================================= */

//   const handleStatusToggle = (
//     value: boolean
//   ) => {
//     setFormData((prev) => ({
//       ...prev,

//       status: value
//         ? 'active'
//         : 'inactive',
//     }));
//   };

//   /* =======================================================
//      CUSTOMIZABLE
//   ======================================================= */

//   const handleCustomizableToggle =
//     (value: boolean) => {
//       setFormData((prev) => ({
//         ...prev,

//         customizable: value
//           ? 1
//           : 0,
//       }));
//     };

//   /* =======================================================
//      IMAGE CUSTOMIZABLE
//   ======================================================= */

//   const handleImageCustomizableToggle =
//     (value: boolean) => {
//       setFormData((prev) => ({
//         ...prev,

//         image_customizable:
//           value
//             ? 1
//             : 0,
//       }));
//     };

//   /* =======================================================
//      COLOR CHANGE
//   ======================================================= */

//   const handleColorGroupChange = (
//     groupIndex: number,
//     value: string
//   ) => {
//     setImageGroups((prev) => {
//       const next =
//         prev.map(
//           (
//             group,
//             index
//           ) =>
//             index ===
//             groupIndex
//               ? {
//                   ...group,
//                   color: value,
//                 }
//               : group
//         );

//       setFormData(
//         (current) => ({
//           ...current,

//           color: next
//             .map(
//               (group) =>
//                 group.color.trim()
//             )
//             .filter(Boolean),
//         })
//       );

//       return next;
//     });
//   };

//   /* =======================================================
//      ADD COLOR GROUP
//   ======================================================= */

//   const handleAddColorGroup =
//     () => {
//       setImageGroups((prev) => {
//         const next = [
//           ...prev,

//           {
//             id: `group-${Date.now()}-${prev.length}`,

//             color: '',

//             items: [],
//           },
//         ];

//         setFormData(
//           (current) => ({
//             ...current,

//             color:
//               syncColorState(
//                 next
//               ),
//           })
//         );

//         return next;
//       });
//     };

//   /* =======================================================
//      REMOVE COLOR GROUP
//   ======================================================= */

//   const handleRemoveColorGroup =
//     (groupIndex: number) => {
//       setImageGroups((prev) => {
//         const removed =
//           prev[groupIndex];

//         if (removed) {
//           removed.items.forEach(
//             (item) => {
//               if (
//                 item.kind ===
//                 'existing'
//               ) {
//                 const filename =
//                   item.src
//                     .split('/')
//                     .pop() ||
//                   item.src;

//                 setDeletedImages(
//                   (current) =>
//                     current.includes(
//                       filename
//                     )
//                       ? current
//                       : [
//                           ...current,
//                           filename,
//                         ]
//                 );
//               }

//               if (
//                 item.kind ===
//                   'new' &&
//                 item.src.startsWith(
//                   'blob:'
//                 )
//               ) {
//                 URL.revokeObjectURL(
//                   item.src
//                 );
//               }
//             }
//           );
//         }

//         const next =
//           prev.filter(
//             (_, index) =>
//               index !==
//               groupIndex
//           );

//         setFormData(
//           (current) => ({
//             ...current,

//             color:
//               syncColorState(
//                 next
//               ),
//           })
//         );

//         return next;
//       });
//     };

//   /* =======================================================
//      COLOR IMAGE UPLOAD
//   ======================================================= */

//   const handleImageChange = (
//     groupIndex: number,
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const files =
//       e.target.files;

//     if (!files) {
//       return;
//     }

//     const newFiles =
//       Array.from(files);

//     const validFiles =
//       newFiles.filter(
//         (file) => {
//           if (
//             !file.type.startsWith(
//               'image/'
//             )
//           ) {
//             alert(
//               `${file.name} is not a valid image`
//             );

//             return false;
//           }

//           if (
//             file.size >
//             5 * 1024 * 1024
//           ) {
//             alert(
//               `${file.name} exceeds 5MB`
//             );

//             return false;
//           }

//           return true;
//         }
//       );

//     if (
//       validFiles.length ===
//       0
//     ) {
//       return;
//     }

//     setImageGroups(
//       (prev) =>
//         prev.map(
//           (
//             group,
//             index
//           ) => {
//             if (
//               index !==
//               groupIndex
//             ) {
//               return group;
//             }

//             return {
//               ...group,

//               items: [
//                 ...group.items,

//                 ...validFiles.map(
//                   (file) =>
//                     createImageItem(
//                       'new',

//                       URL.createObjectURL(
//                         file
//                       ),

//                       file
//                     )
//                 ),
//               ],
//             };
//           }
//         )
//     );

//     e.target.value = '';
//   };

//   /* =======================================================
//      REMOVE COLOR IMAGE
//   ======================================================= */

//   const handleRemoveImage = (
//     groupIndex: number,
//     itemIndex: number
//   ) => {
//     setImageGroups(
//       (prev) =>
//         prev.map(
//           (
//             group,
//             index
//           ) => {
//             if (
//               index !==
//               groupIndex
//             ) {
//               return group;
//             }

//             const removed =
//               group.items[
//                 itemIndex
//               ];

//             if (
//               removed?.kind ===
//               'existing'
//             ) {
//               const filename =
//                 removed.src
//                   .split('/')
//                   .pop() ||
//                 removed.src;

//               setDeletedImages(
//                 (current) =>
//                   current.includes(
//                     filename
//                   )
//                     ? current
//                     : [
//                         ...current,
//                         filename,
//                       ]
//               );
//             }

//             if (
//               removed?.kind ===
//                 'new' &&
//               removed.src.startsWith(
//                 'blob:'
//               )
//             ) {
//               URL.revokeObjectURL(
//                 removed.src
//               );
//             }

//             return {
//               ...group,

//               items:
//                 group.items.filter(
//                   (
//                     _,
//                     imageIndex
//                   ) =>
//                     imageIndex !==
//                     itemIndex
//                 ),
//             };
//           }
//         )
//     );
//   };

//   /* =======================================================
//      SIMILAR IMAGE UPLOAD
//   ======================================================= */

//   const handleSimilarImageChange =
//     (
//       e: React.ChangeEvent<HTMLInputElement>
//     ) => {
//       const files =
//         e.target.files;

//       if (!files) {
//         return;
//       }

//       const newFiles =
//         Array.from(files);

//       const validFiles =
//         newFiles.filter(
//           (file) => {
//             if (
//               !file.type.startsWith(
//                 'image/'
//               )
//             ) {
//               alert(
//                 `${file.name} is not a valid image`
//               );

//               return false;
//             }

//             if (
//               file.size >
//               5 * 1024 * 1024
//             ) {
//               alert(
//                 `${file.name} exceeds 5MB`
//               );

//               return false;
//             }

//             return true;
//           }
//         );

//       if (
//         validFiles.length ===
//         0
//       ) {
//         return;
//       }

//       setSimilarImages(
//         (prev) => [
//           ...prev,

//           ...validFiles.map(
//             (file) => ({
//               id: `similar-new-${Date.now()}-${Math.random()
//                 .toString(36)
//                 .slice(2, 8)}`,

//               kind: 'new' as const,

//               src: URL.createObjectURL(
//                 file
//               ),

//               file,
//             })
//           ),
//         ]
//       );

//       e.target.value = '';
//     };

//   /* =======================================================
//      REMOVE SIMILAR IMAGE
//   ======================================================= */

//   const handleRemoveSimilarImage =
//     (index: number) => {
//       setSimilarImages(
//         (prev) => {
//           const removed =
//             prev[index];

//           if (!removed) {
//             return prev;
//           }

//           /* EXISTING IMAGE */

//           if (
//             removed.kind ===
//             'existing'
//           ) {
//             const filename =
//               removed.src
//                 .split('/')
//                 .pop() ||
//               removed.src;

//             setDeletedSimilarImages(
//               (current) =>
//                 current.includes(
//                   filename
//                 )
//                   ? current
//                   : [
//                       ...current,
//                       filename,
//                     ]
//             );
//           }

//           /* NEW IMAGE */

//           if (
//             removed.kind ===
//               'new' &&
//             removed.src.startsWith(
//               'blob:'
//             )
//           ) {
//             URL.revokeObjectURL(
//               removed.src
//             );
//           }

//           return prev.filter(
//             (
//               _,
//               itemIndex
//             ) =>
//               itemIndex !==
//               index
//           );
//         }
//       );
//     };

//   /* =======================================================
//      RENDER
//   ======================================================= */

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm">
//       <div className="w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

//         {/* =================================================
//             HEADER
//         ================================================= */}

//         <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-8 py-6">

//           <div className="flex items-center gap-4">

//             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
//               <Package className="h-6 w-6 text-blue-600" />
//             </div>

//             <div>
//               <h2 className="text-2xl font-bold text-slate-900">
//                 {product
//                   ? 'Edit Product'
//                   : 'Add Product'}
//               </h2>

//               <p className="text-sm text-slate-500">
//                 {product
//                   ? 'Update existing product'
//                   : 'Create new product'}
//               </p>
//             </div>

//           </div>

//           <button
//             type="button"
//             onClick={onClose}
//             className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100"
//           >
//             <X className="h-6 w-6 text-slate-600" />
//           </button>

//         </div>

//         {/* =================================================
//             FORM
//         ================================================= */}

//         <form
//           onSubmit={handleSubmit}
//           className="space-y-8 p-8"
//         >

//           {/* =================================================
//               COLOR VARIANTS
//           ================================================= */}

//           <div>

//             <div className="mb-3">

//               <label className="flex items-center gap-2 text-sm font-semibold">

//                 <Tag className="h-4 w-4 text-blue-600" />

//                 Color Variants

//                 <span className="text-xs font-normal text-slate-400">
//                   (Optional)
//                 </span>

//               </label>

//               <p className="mt-1 text-xs text-slate-500">
//                 Add color-specific images only if this product has color variants.
//               </p>

//             </div>

//             <div className="space-y-4">

//               {imageGroups.map(
//                 (
//                   group,
//                   groupIndex
//                 ) => (

//                   <div
//                     key={group.id}
//                     className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
//                   >

//                     {/* COLOR HEADER */}

//                     <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">

//                       <div className="flex-1">

//                         <label className="mb-2 block text-sm font-medium text-slate-700">
//                           Color {groupIndex + 1}
//                         </label>

//                         {/* =================================================
//                             WORKING COLOR DROPDOWN
//                         ================================================= */}

//                         <select
//                           value={
//                             group.color
//                           }
//                           onChange={(e) =>
//                             handleColorGroupChange(
//                               groupIndex,
//                               e.target.value
//                             )
//                           }
//                           className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
//                           disabled={
//                             loadingColors
//                           }
//                         >

//                           <option value="">
//                             {loadingColors
//                               ? 'Loading Colors...'
//                               : 'Select Color'}
//                           </option>

//                           {colorOptions.map(
//                             (color) => (
//                               <option
//                                 key={
//                                   color.id
//                                 }
//                                 value={
//                                   color.name
//                                 }
//                               >
//                                 {
//                                   color.name
//                                 }
//                               </option>
//                             )
//                           )}

//                         </select>

//                         {/* NO ACTIVE COLORS */}

//                         {!loadingColors &&
//                           colorOptions.length ===
//                             0 && (
//                             <div className="mt-2 text-xs text-red-500">
//                               No active colors found.
//                             </div>
//                           )}

//                         {/* SELECT COLOR MESSAGE */}

//                         {!group.color &&
//                           colorOptions.length >
//                             0 && (
//                             <div className="mt-2 text-xs text-slate-500">
//                               Select a color from the dropdown.
//                             </div>
//                           )}

//                       </div>

//                       {/* COLOR BUTTONS */}

//                       <div className="flex items-center gap-2">

//                         <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">

//                           <Upload className="h-4 w-4" />

//                           Add Images

//                           <input
//                             type="file"
//                             multiple
//                             accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
//                             className="hidden"
//                             onChange={(e) =>
//                               handleImageChange(
//                                 groupIndex,
//                                 e
//                               )
//                             }
//                           />

//                         </label>

//                         {imageGroups.length >
//                           1 && (
//                           <button
//                             type="button"
//                             onClick={() =>
//                               handleRemoveColorGroup(
//                                 groupIndex
//                               )
//                             }
//                             className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
//                           >
//                             Remove Color
//                           </button>
//                         )}

//                       </div>

//                     </div>

//                     {/* COLOR IMAGES */}

//                     <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

//                       {group.items.length >
//                       0 ? (

//                         group.items.map(
//                           (
//                             item,
//                             itemIndex
//                           ) => (

//                             <div
//                               key={
//                                 item.id
//                               }
//                               className="relative rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
//                             >

//                               <div className="h-24 overflow-hidden rounded-lg bg-slate-100">

//                                 <img
//                                   src={getPreviewSrc(
//                                     toDisplayUrl(
//                                       item.src
//                                     )
//                                   )}
//                                   alt={`${group.color || 'color'}-${itemIndex + 1}`}
//                                   className="h-full w-full object-cover"
//                                   onError={(
//                                     event
//                                   ) => {
//                                     (
//                                       event.target as HTMLImageElement
//                                     ).src =
//                                       '/placeholder.svg';
//                                   }}
//                                 />

//                               </div>

//                               {/* PRIMARY */}

//                               {itemIndex ===
//                                 0 && (
//                                 <div className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 shadow">
//                                   <Star className="h-3.5 w-3.5 text-white" />
//                                 </div>
//                               )}

//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   handleRemoveImage(
//                                     groupIndex,
//                                     itemIndex
//                                   )
//                                 }
//                                 className="mt-2 flex w-full items-center justify-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
//                               >
//                                 <Trash2 className="h-4 w-4" />
//                                 Remove
//                               </button>

//                             </div>

//                           )
//                         )

//                       ) : (

//                         <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
//                           No images added for this color yet.
//                         </div>

//                       )}

//                     </div>

//                   </div>

//                 )
//               )}

//             </div>

//             {/* ADD COLOR */}

//             <div className="mt-4 flex justify-start">

//               <button
//                 type="button"
//                 onClick={
//                   handleAddColorGroup
//                 }
//                 className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
//               >
//                 + Add Another Color
//               </button>

//             </div>

//           </div>

//           {/* =================================================
//               SIMILAR IMAGES
//           ================================================= */}

//           <div>

//             <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

//               <div>

//                 <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">

//                   <Tag className="h-4 w-4 text-purple-600" />

//                   Similar Images

//                 </label>

//                 <p className="mt-1 text-xs text-slate-500">
//                   Add images of similar or related products.
//                 </p>

//               </div>

//               <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">

//                 <Upload className="h-4 w-4" />

//                 Add Similar Images

//                 <input
//                   type="file"
//                   multiple
//                   accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
//                   className="hidden"
//                   onChange={
//                     handleSimilarImageChange
//                   }
//                 />

//               </label>

//             </div>

//             {similarImages.length >
//             0 ? (

//               <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

//                 {similarImages.map(
//                   (
//                     item,
//                     index
//                   ) => (

//                     <div
//                       key={
//                         item.id
//                       }
//                       className="relative rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
//                     >

//                       <div className="h-28 overflow-hidden rounded-lg bg-slate-100">

//                         <img
//                           src={getPreviewSrc(
//                             toDisplayUrl(
//                               item.src
//                             )
//                           )}
//                           alt={`Similar product ${index + 1}`}
//                           className="h-full w-full object-cover"
//                           onError={(
//                             event
//                           ) => {
//                             (
//                               event.target as HTMLImageElement
//                             ).src =
//                               '/placeholder.svg';
//                           }}
//                         />

//                       </div>

//                       <div className="mt-2 text-center text-xs font-medium text-slate-500">
//                         Similar {index + 1}
//                       </div>

//                       <button
//                         type="button"
//                         onClick={() =>
//                           handleRemoveSimilarImage(
//                             index
//                           )
//                         }
//                         className="mt-2 flex w-full items-center justify-center gap-1 rounded-md bg-red-50 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                         Remove
//                       </button>

//                     </div>

//                   )
//                 )}

//               </div>

//             ) : (

//               <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">

//                 <Upload className="mx-auto h-8 w-8 text-slate-400" />

//                 <p className="mt-2 text-sm font-medium text-slate-600">
//                   No similar images added
//                 </p>

//                 <p className="mt-1 text-xs text-slate-400">
//                   Upload images of similar products
//                 </p>

//               </div>

//             )}

//           </div>

//           {/* =================================================
//               PRODUCT NAME
//           ================================================= */}

//           <div>

//             <label className="mb-2 flex items-center gap-2 text-sm font-semibold">

//               <Tag className="h-4 w-4 text-blue-600" />

//               Product Name

//             </label>

//             <input
//               type="text"
//               name="name"
//               value={
//                 formData.name
//               }
//               onChange={
//                 handleChange
//               }
//               placeholder="Product name"
//               className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//               required
//             />

//           </div>

//           {/* =================================================
//               CATEGORY
//           ================================================= */}

//           <div>

//             <label className="mb-2 flex items-center gap-2 text-sm font-semibold">

//               <Package className="h-4 w-4 text-blue-600" />

//               Category

//             </label>

//             <select
//               name="category"
//               value={
//                 formData.category ||
//                 ''
//               }
//               onChange={
//                 handleChange
//               }
//               className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//               required
//             >

//               <option value="">
//                 Select Category
//               </option>

//               {categories.map(
//                 (category) => (

//                   <option
//                     key={
//                       category
//                     }
//                     value={
//                       category
//                     }
//                   >
//                     {
//                       category
//                     }
//                   </option>

//                 )
//               )}

//             </select>

//           </div>

//           {/* =================================================
//               SUBCATEGORY
//           ================================================= */}

//           <div>

//             <label className="mb-2 flex items-center gap-2 text-sm font-semibold">

//               <Tag className="h-4 w-4 text-blue-600" />

//               Subcategory

//             </label>

//             <input
//               type="text"
//               name="subcategory"
//               value={
//                 formData.subcategory ||
//                 ''
//               }
//               onChange={
//                 handleChange
//               }
//               placeholder="Enter subcategory"
//               className="w-full rounded-lg border border-slate-300 px-4 py-3"
//             />

//           </div>

//           {/* =================================================
//               PRICE + STOCK
//           ================================================= */}

//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

//             <div>

//               <label className="mb-2 flex items-center gap-2 text-sm font-semibold">

//                 <DollarSign className="h-4 w-4 text-amber-600" />

//                 Price

//               </label>

//               <input
//                 type="number"
//                 name="price"
//                 value={
//                   formData.price
//                 }
//                 onChange={
//                   handleChange
//                 }
//                 placeholder="Enter price"
//                 min="0"
//                 step="0.01"
//                 className="w-full rounded-lg border border-slate-300 px-4 py-3"
//                 required
//               />

//             </div>

//             <div>

//               <label className="mb-2 flex items-center gap-2 text-sm font-semibold">

//                 <Boxes className="h-4 w-4 text-amber-600" />

//                 Stock

//               </label>

//               <input
//                 type="number"
//                 name="stock"
//                 value={
//                   formData.stock
//                 }
//                 onChange={
//                   handleChange
//                 }
//                 placeholder="Enter stock"
//                 min="0"
//                 className="w-full rounded-lg border border-slate-300 px-4 py-3"
//                 required
//               />

//             </div>

//           </div>

//           {/* =================================================
//               DESCRIPTION
//           ================================================= */}

//           <div>

//             <label className="mb-2 flex items-center gap-2 text-sm font-semibold">

//               <FileText className="h-4 w-4 text-blue-600" />

//               Description

//             </label>

//             <textarea
//               name="description"
//               rows={4}
//               value={
//                 formData.description ||
//                 ''
//               }
//               onChange={
//                 handleChange
//               }
//               placeholder="Enter product description"
//               className="w-full rounded-lg border border-slate-300 px-4 py-3"
//             />

//           </div>

//           {/* =================================================
//               TOGGLES
//           ================================================= */}

//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

//             {/* STATUS */}

//             <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4">

//               <div>

//                 <p className="font-semibold">
//                   Product Status
//                 </p>

//                 <p className="text-sm text-slate-500">
//                   {formData.status ===
//                   'active'
//                     ? 'Active'
//                     : 'Inactive'}
//                 </p>

//               </div>

//               <Switch
//                 checked={
//                   formData.status ===
//                   'active'
//                 }
//                 onCheckedChange={
//                   handleStatusToggle
//                 }
//               />

//             </div>

//             {/* CUSTOMIZABLE */}

//             <div className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50 p-4">

//               <div>

//                 <p className="font-semibold">
//                   Customizable
//                 </p>

//                 <p className="text-sm text-slate-500">
//                   {formData.customizable
//                     ? 'Enabled'
//                     : 'Disabled'}
//                 </p>

//               </div>

//               <Switch
//                 checked={
//                   formData.customizable ===
//                   1
//                 }
//                 onCheckedChange={
//                   handleCustomizableToggle
//                 }
//               />

//             </div>

//             {/* IMAGE CUSTOMIZABLE */}

//             <div className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50 p-4">

//               <div>

//                 <p className="font-semibold">
//                   Image Customizable
//                 </p>

//                 <p className="text-sm text-slate-500">
//                   {formData.image_customizable
//                     ? 'Enabled'
//                     : 'Disabled'}
//                 </p>

//               </div>

//               <Switch
//                 checked={
//                   formData.image_customizable ===
//                   1
//                 }
//                 onCheckedChange={
//                   handleImageCustomizableToggle
//                 }
//               />

//             </div>

//           </div>

//           {/* =================================================
//               BUTTONS
//           ================================================= */}

//           <div className="flex justify-end gap-4 border-t border-slate-200 pt-6">

//             <button
//               type="button"
//               onClick={
//                 onClose
//               }
//               disabled={
//                 isSubmitting
//               }
//               className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={
//                 isSubmitting
//               }
//               className={`rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition ${
//                 isSubmitting
//                   ? 'cursor-not-allowed opacity-80'
//                   : 'hover:bg-blue-700'
//               }`}
//             >

//               <span className="inline-flex items-center justify-center gap-2">

//                 {isSubmitting && (
//                   <Spinner className="h-4 w-4" />
//                 )}

//                 {isSubmitting
//                   ? product
//                     ? 'Updating Product...'
//                     : 'Creating Product...'
//                   : product
//                     ? 'Update Product'
//                     : 'Create Product'}

//               </span>

//             </button>

//           </div>

//         </form>

//       </div>
//     </div>
//   );
// }





'use client';

import { useEffect, useState } from 'react';
import {
  X,
  Upload,
  Package,
  DollarSign,
  Boxes,
  Tag,
  FileText,
  Star,
  Trash2,
  AlertCircle,
} from 'lucide-react';

import { Product } from './mock-data';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';

interface ProductFormProps {
  product?: Product;

  onSubmit: (
    data: Product,
    formData?: FormData
  ) => Promise<void> | void;

  onClose: () => void;
}

const categories = ['Cable Organizer', 'Pen Holder Stand'];

interface ApiColor {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

type ImageItem = {
  id: string;
  kind: 'existing' | 'new';
  src: string;
  file?: File;
};

type ImageGroup = {
  id: string;
  color: string;
  items: ImageItem[];
};

type SimilarImageItem = {
  id: string;
  kind: 'existing' | 'new';
  src: string;
  file?: File;
};

/* =========================================================
   CREATE IMAGE ITEM
========================================================= */

function createImageItem(
  kind: 'existing' | 'new',
  src: string,
  file?: File
): ImageItem {
  return {
    id: `${kind}-${src}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    kind,
    src,
    file,
  };
}

/* =========================================================
   IMAGE URL
========================================================= */

function toDisplayUrl(value: string) {
  const cleanValue = String(value || '').trim();

  if (!cleanValue) {
    return '';
  }

  if (
    cleanValue.startsWith('http://') ||
    cleanValue.startsWith('https://') ||
    cleanValue.startsWith('blob:') ||
    cleanValue.startsWith('data:') ||
    cleanValue.startsWith('/')
  ) {
    return cleanValue;
  }

  return `http://nextlayer.soon.it/images/${cleanValue.replace(
    /^\/+/,
    ''
  )}`;
}

/* =========================================================
   IMAGE PREVIEW

   IMPORTANT:
   Remote HTTP/HTTPS images are sent through the
   Next.js image proxy so they also work on HTTPS production.
========================================================= */

function getPreviewSrc(value: string) {
  const cleanValue = String(value || '').trim();

  if (!cleanValue) {
    return '/placeholder.svg';
  }

  if (
    cleanValue.startsWith('blob:') ||
    cleanValue.startsWith('data:')
  ) {
    return cleanValue;
  }

  if (cleanValue.startsWith('/api/image-proxy')) {
    return cleanValue;
  }

  const displayUrl = toDisplayUrl(cleanValue);

  if (!displayUrl) {
    return '/placeholder.svg';
  }

  /*
   * Local/same-origin images can be loaded directly.
   */
  if (displayUrl.startsWith('/')) {
    return displayUrl;
  }

  /*
   * Remote images use our proxy.
   */
  return `/api/image-proxy?url=${encodeURIComponent(
    displayUrl
  )}`;
}

/* =========================================================
   BUILD INITIAL COLOR GROUPS
========================================================= */

function buildInitialImageGroups(
  product?: Product
): ImageGroup[] {
  const productColors = Array.isArray(product?.color)
    ? product.color
      .map((item) => String(item).trim())
      .filter(Boolean)
    : product?.color &&
      String(product.color).trim()
      ? [String(product.color).trim()]
      : [];

  const groups =
    Array.isArray(product?.variants)
      ? product.variants
      : Array.isArray(product?.images)
        ? product.images
        : [];

  if (!groups.length) {
    return [];
  }

  return groups
    .map((group: any, index: number) => {
      const color = String(
        group?.color ||
        productColors[index] ||
        ''
      ).trim();

      const imageValues =
        Array.isArray(group?.image_urls)
          ? group.image_urls
          : Array.isArray(group?.images)
            ? group.images
            : Array.isArray(group?.image)
              ? group.image
              : typeof group?.images === 'string'
                ? [group.images]
                : [];

      if (!color && imageValues.length === 0) {
        return null;
      }

      return {
        id: `group-${index}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,

        color,

        items: imageValues
          .map((value: any) =>
            String(value).trim()
          )
          .filter(Boolean)
          .map((value: string) =>
            createImageItem(
              'existing',
              value
            )
          ),
      };
    })
    .filter(Boolean) as ImageGroup[];
}

/* =========================================================
   SYNC COLORS
========================================================= */

function syncColorState(groups: ImageGroup[]) {
  return groups
    .map((group) => group.color.trim())
    .filter(Boolean);
}

/* =========================================================
   PRODUCT FORM
========================================================= */

export function ProductForm({
  product,
  onSubmit,
  onClose,
}: ProductFormProps) {
  /* =======================================================
     ERROR POPUP
  ======================================================= */

  const [formError, setFormError] = useState('');

  /* =======================================================
     COLOR API
  ======================================================= */

  const [colorOptions, setColorOptions] =
    useState<ApiColor[]>([]);

  const [loadingColors, setLoadingColors] =
    useState(false);

  /* =======================================================
     FORM DATA
  ======================================================= */

  const [formData, setFormData] = useState<Product>(
    product
      ? {
        ...product,

        name: product.name || '',

        price:
          Number(product.price) || 0,

        stock:
          Number(product.stock) || 0,

        category:
          product.category || '',

        subcategory:
          product.subcategory || '',

        sku:
          product.sku || '',

        customizable:
          product.customizable ? 1 : 0,

        image_customizable:
          product.image_customizable ? 1 : 0,

        status:
          product.status || 'active',

        color: Array.isArray(product.color)
          ? product.color
            .filter(
              (c: any) =>
                c &&
                String(c).trim()
            )
            .map((c: any) =>
              String(c).trim()
            )
          : product.color &&
            String(product.color).trim()
            ? [String(product.color).trim()]
            : [],
      }
      : {
        id: '',
        name: '',
        color: [],
        category: '',
        subcategory: '',
        sku: `SKU-${Date.now()}`,
        price: '',
        stock: '',
        description: '',
        image: '',
        customizable: 0,
        image_customizable: 0,
        status: 'active',
        image_urls: [],
      }
  );

  /* =======================================================
     COLOR IMAGE STATE
  ======================================================= */

  const [imageGroups, setImageGroups] =
    useState<ImageGroup[]>(() =>
      buildInitialImageGroups(product)
    );

  const [deletedImages, setDeletedImages] =
    useState<string[]>([]);

  /* =======================================================
     SIMILAR IMAGE STATE
  ======================================================= */

  const [similarImages, setSimilarImages] =
    useState<SimilarImageItem[]>([]);

  const [
    deletedSimilarImages,
    setDeletedSimilarImages,
  ] = useState<string[]>([]);

  /* =======================================================
     SUBMIT STATE
  ======================================================= */

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /* =======================================================
     LOAD COLORS
  ======================================================= */

  useEffect(() => {
    const fetchColors = async () => {
      try {
        setLoadingColors(true);

        const response = await fetch(
          '/api/color',
          {
            method: 'GET',
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          throw new Error(
            `Color API failed: ${response.status}`
          );
        }

        const data = await response.json();

        if (
          data.status &&
          Array.isArray(data.colors)
        ) {
          const activeColors =
            data.colors.filter(
              (color: ApiColor) =>
                color.status === 'active'
            );

          setColorOptions(activeColors);
        } else {
          setColorOptions([]);
        }
      } catch (error) {
        console.error(
          'Color API error:',
          error
        );

        setColorOptions([]);
      } finally {
        setLoadingColors(false);
      }
    };

    fetchColors();
  }, []);

  /* =======================================================
     LOAD EDIT PRODUCT
  ======================================================= */

  useEffect(() => {
    if (!product) {
      setImageGroups([]);
      setSimilarImages([]);
      setDeletedSimilarImages([]);
      setDeletedImages([]);
      return;
    }

    const groups =
      buildInitialImageGroups(product);

    setImageGroups(groups);

    setFormData((prev) => ({
      ...prev,

      color: groups
        .map((group) => group.color)
        .filter(Boolean),
    }));

    const rawSimilar =
      (product as any).similar;

    const similarArray =
      Array.isArray(rawSimilar)
        ? rawSimilar
        : [];

    const normalizedSimilar =
      similarArray
        .map(
          (
            item: any,
            index: number
          ) => {
            let src = '';

            if (
              typeof item === 'string'
            ) {
              src = item;
            } else if (
              item &&
              typeof item === 'object'
            ) {
              src =
                item.image_url ||
                item.image ||
                '';
            }

            if (!src) {
              return null;
            }

            return {
              id: `similar-existing-${index}-${src}`,

              kind: 'existing' as const,

              src: String(src),
            };
          }
        )
        .filter(
          Boolean
        ) as SimilarImageItem[];

    setSimilarImages(
      normalizedSimilar
    );

    setDeletedSimilarImages([]);
    setDeletedImages([]);
  }, [product]);

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous error
    setFormError('');

    // ================================
    // VALIDATION
    // ================================

    if (!formData.name?.trim()) {
      setFormError('Please enter the product name.');
      return;
    }

    if (!formData.category?.trim()) {
      setFormError('Please select a product category.');
      return;
    }

    if (
      formData.price === undefined ||
      formData.price === null ||
      Number.isNaN(Number(formData.price)) ||
      Number(formData.price) < 0
    ) {
      setFormError('Please enter a valid product price.');
      return;
    }

    if (
      formData.stock === undefined ||
      formData.stock === null ||
      Number.isNaN(Number(formData.stock)) ||
      Number(formData.stock) < 0
    ) {
      setFormError('Please enter a valid stock quantity.');
      return;
    }

    // ================================
    // COLOR VALIDATION
    // ================================

    const invalidColor = imageGroups.some(
      (group) => !group.color.trim()
    );

    if (invalidColor) {
      setFormError(
        'Please select a valid color for every color variant.'
      );
      return;
    }

    // ================================
    // DUPLICATE COLORS
    // ================================

    const colors = imageGroups
      .map((group) => group.color.trim().toLowerCase())
      .filter(Boolean);

    if (new Set(colors).size !== colors.length) {
      setFormError(
        'You cannot use the same color more than once.'
      );
      return;
    }

    // ================================
    // SUBMIT
    // ================================

    setIsSubmitting(true);

    try {
      const apiFormData = new FormData();

      // Product fields
      apiFormData.append(
        'product_name',
        formData.name || ''
      );

      apiFormData.append(
        'category',
        formData.category || ''
      );

      apiFormData.append(
        'subcategory',
        formData.subcategory || ''
      );

      apiFormData.append(
        'sku',
        formData.sku || ''
      );

      apiFormData.append(
        'price',
        String(formData.price ?? 0)
      );

      apiFormData.append(
        'stock',
        String(formData.stock ?? 0)
      );

      apiFormData.append(
        'description',
        formData.description || ''
      );

      apiFormData.append(
        'status',
        formData.status || 'active'
      );

      apiFormData.append(
        'customizable',
        String(formData.customizable ?? 0)
      );

      apiFormData.append(
        'image_customizable',
        String(formData.image_customizable ?? 0)
      );

      // ================================
      // EDIT PRODUCT
      // ================================

      if (product?.id) {
        apiFormData.append(
          'product_id',
          String(product.id)
        );

        apiFormData.append(
          'delete_images',
          JSON.stringify(deletedImages || [])
        );

        imageGroups.forEach((group, index) => {
          const color = group.color.trim();

          if (!color) return;

          apiFormData.append(
            `variants[${index}][color]`,
            color
          );

          group.items.forEach((item) => {
            if (
              item.kind === 'new' &&
              item.file
            ) {
              apiFormData.append(
                `variants[${index}][images][]`,
                item.file,
                item.file.name
              );
            }

            if (
              item.kind === 'existing'
            ) {
              apiFormData.append(
                `variants[${index}][existing_images][]`,
                item.src.split('/').pop() || item.src
              );
            }
          });
        });

        apiFormData.append(
          'delete_similar',
          JSON.stringify(
            deletedSimilarImages || []
          )
        );

        similarImages.forEach((item) => {
          if (
            item.kind === 'new' &&
            item.file
          ) {
            apiFormData.append(
              'similar[]',
              item.file,
              item.file.name
            );
          }

          if (
            item.kind === 'existing'
          ) {
            apiFormData.append(
              'existing_similar[]',
              item.src.split('/').pop() || item.src
            );
          }
        });
      }

      // ================================
      // ADD PRODUCT
      // ================================

      else {
        imageGroups.forEach((group, index) => {
          const color = group.color.trim();

          if (!color) return;

          apiFormData.append(
            'colors[]',
            color
          );

          group.items.forEach((item) => {
            if (
              item.kind === 'new' &&
              item.file
            ) {
              apiFormData.append(
                `images_${index}[]`,
                item.file,
                item.file.name
              );
            }
          });
        });

        similarImages.forEach((item) => {
          if (
            item.kind === 'new' &&
            item.file
          ) {
            apiFormData.append(
              'similar[]',
              item.file,
              item.file.name
            );
          }
        });
      }

      console.log(
        '========== PRODUCT FORM DATA =========='
      );

      for (const [key, value] of apiFormData.entries()) {
        console.log(key, value);
      }

      // IMPORTANT:
      // Parent MUST throw an error when API fails.
      await onSubmit(
        formData,
        apiFormData
      );

    } catch (error: any) {
      console.error(
        'Product submit error:',
        error
      );

      /*
       * THIS ERROR WILL APPEAR
       * IN THE POPUP ABOVE THE FORM.
       */
      setFormError(
        error?.message ||
        'Something went wrong while submitting the product.'
      );

    } finally {
      setIsSubmitting(false);
    }
  };
  /* =======================================================
     INPUT CHANGE
  ======================================================= */

  const handleChange = (
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]:
        name === 'price' ||
          name === 'stock'
          ? value
          : value,
    }));
  };

  /* =======================================================
     STATUS
  ======================================================= */

  const handleStatusToggle = (
    value: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,

      status: value
        ? 'active'
        : 'inactive',
    }));
  };

  /* =======================================================
     CUSTOMIZABLE
  ======================================================= */

  const handleCustomizableToggle = (
    value: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,

      customizable:
        value ? 1 : 0,
    }));
  };

  /* =======================================================
     IMAGE CUSTOMIZABLE
  ======================================================= */

  const handleImageCustomizableToggle =
    (value: boolean) => {
      setFormData((prev) => ({
        ...prev,

        image_customizable:
          value ? 1 : 0,
      }));
    };

  /* =======================================================
     COLOR CHANGE
  ======================================================= */

  const handleColorGroupChange = (
    groupIndex: number,
    value: string
  ) => {
    setImageGroups((prev) => {
      const next = prev.map(
        (
          group,
          index
        ) =>
          index === groupIndex
            ? {
              ...group,
              color: value,
            }
            : group
      );

      setFormData(
        (current) => ({
          ...current,

          color: next
            .map(
              (group) =>
                group.color.trim()
            )
            .filter(Boolean),
        })
      );

      return next;
    });
  };

  /* =======================================================
     ADD COLOR GROUP
  ======================================================= */

  const handleAddColorGroup =
    () => {
      setImageGroups((prev) => {
        const next = [
          ...prev,

          {
            id: `group-${Date.now()}-${prev.length}`,
            color: '',
            items: [],
          },
        ];

        setFormData(
          (current) => ({
            ...current,

            color:
              syncColorState(
                next
              ),
          })
        );

        return next;
      });
    };

  /* =======================================================
     REMOVE COLOR GROUP
  ======================================================= */

  const handleRemoveColorGroup =
    (groupIndex: number) => {
      setImageGroups((prev) => {
        const removed =
          prev[groupIndex];

        if (removed) {
          removed.items.forEach(
            (item) => {
              if (
                item.kind ===
                'existing'
              ) {
                const filename =
                  item.src
                    .split('/')
                    .pop() ||
                  item.src;

                setDeletedImages(
                  (current) =>
                    current.includes(
                      filename
                    )
                      ? current
                      : [
                        ...current,
                        filename,
                      ]
                );
              }

              if (
                item.kind ===
                'new' &&
                item.src.startsWith(
                  'blob:'
                )
              ) {
                URL.revokeObjectURL(
                  item.src
                );
              }
            }
          );
        }

        const next =
          prev.filter(
            (_, index) =>
              index !==
              groupIndex
          );

        setFormData(
          (current) => ({
            ...current,

            color:
              syncColorState(
                next
              ),
          })
        );

        return next;
      });
    };

  /* =======================================================
     COLOR IMAGE UPLOAD
  ======================================================= */

  const handleImageChange = (
    groupIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files =
      e.target.files;

    if (!files) {
      return;
    }

    const newFiles =
      Array.from(files);

    const validFiles =
      newFiles.filter(
        (file) => {
          if (
            !file.type.startsWith(
              'image/'
            )
          ) {
            setFormError(
              `${file.name} is not a valid image.`
            );

            return false;
          }

          if (
            file.size >
            5 * 1024 * 1024
          ) {
            setFormError(
              `${file.name} exceeds the 5MB image size limit.`
            );

            return false;
          }

          return true;
        }
      );

    if (
      validFiles.length === 0
    ) {
      e.target.value = '';
      return;
    }

    setImageGroups(
      (prev) =>
        prev.map(
          (
            group,
            index
          ) => {
            if (
              index !==
              groupIndex
            ) {
              return group;
            }

            return {
              ...group,

              items: [
                ...group.items,

                ...validFiles.map(
                  (file) =>
                    createImageItem(
                      'new',
                      URL.createObjectURL(
                        file
                      ),
                      file
                    )
                ),
              ],
            };
          }
        )
    );

    e.target.value = '';
  };

  /* =======================================================
     REMOVE COLOR IMAGE
  ======================================================= */

  const handleRemoveImage = (
    groupIndex: number,
    itemIndex: number
  ) => {
    setImageGroups(
      (prev) =>
        prev.map(
          (
            group,
            index
          ) => {
            if (
              index !==
              groupIndex
            ) {
              return group;
            }

            const removed =
              group.items[
              itemIndex
              ];

            if (
              removed?.kind ===
              'existing'
            ) {
              const filename =
                removed.src
                  .split('/')
                  .pop() ||
                removed.src;

              setDeletedImages(
                (current) =>
                  current.includes(
                    filename
                  )
                    ? current
                    : [
                      ...current,
                      filename,
                    ]
              );
            }

            if (
              removed?.kind ===
              'new' &&
              removed.src.startsWith(
                'blob:'
              )
            ) {
              URL.revokeObjectURL(
                removed.src
              );
            }

            return {
              ...group,

              items:
                group.items.filter(
                  (
                    _,
                    imageIndex
                  ) =>
                    imageIndex !==
                    itemIndex
                ),
            };
          }
        )
    );
  };

  /* =======================================================
     SIMILAR IMAGE UPLOAD
  ======================================================= */

  const handleSimilarImageChange =
    (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const files =
        e.target.files;

      if (!files) {
        return;
      }

      const newFiles =
        Array.from(files);

      const validFiles =
        newFiles.filter(
          (file) => {
            if (
              !file.type.startsWith(
                'image/'
              )
            ) {
              setFormError(
                `${file.name} is not a valid image.`
              );

              return false;
            }

            if (
              file.size >
              5 * 1024 * 1024
            ) {
              setFormError(
                `${file.name} exceeds the 5MB image size limit.`
              );

              return false;
            }

            return true;
          }
        );

      if (
        validFiles.length === 0
      ) {
        e.target.value = '';
        return;
      }

      setSimilarImages(
        (prev) => [
          ...prev,

          ...validFiles.map(
            (file) => ({
              id: `similar-new-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,

              kind: 'new' as const,

              src: URL.createObjectURL(
                file
              ),

              file,
            })
          ),
        ]
      );

      e.target.value = '';
    };

  /* =======================================================
     REMOVE SIMILAR IMAGE
  ======================================================= */

  const handleRemoveSimilarImage =
    (index: number) => {
      setSimilarImages(
        (prev) => {
          const removed =
            prev[index];

          if (!removed) {
            return prev;
          }

          if (
            removed.kind ===
            'existing'
          ) {
            const filename =
              removed.src
                .split('/')
                .pop() ||
              removed.src;

            setDeletedSimilarImages(
              (current) =>
                current.includes(
                  filename
                )
                  ? current
                  : [
                    ...current,
                    filename,
                  ]
            );
          }

          if (
            removed.kind ===
            'new' &&
            removed.src.startsWith(
              'blob:'
            )
          ) {
            URL.revokeObjectURL(
              removed.src
            );
          }

          return prev.filter(
            (
              _,
              itemIndex
            ) =>
              itemIndex !==
              index
          );
        }
      );
    };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm">

      {/* =================================================
          ERROR POPUP
      ================================================= */}

      {formError && (
        <div
          className="
            fixed inset-0
            z-[9999]
            flex items-center justify-center
            bg-black/60
            p-4
            backdrop-blur-sm
          "
        >
          <div
            className="
              relative
              w-full
              max-w-md
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-2xl
              animate-in
              fade-in
              zoom-in-95
              duration-200
            "
          >
            {/* HEADER */}

            <div className="flex items-center gap-3 border-b border-red-100 bg-red-50 px-6 py-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-700">
                  Error
                </h3>

                <p className="text-xs text-red-500">
                  Product could not be added
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFormError('')
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MESSAGE */}

            <div className="px-6 py-6">
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                {formError}
              </p>
            </div>

            {/* BUTTON */}

            <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setFormError('')
                }
                className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          MAIN PRODUCT FORM
      ================================================= */}

      <div className="relative w-full max-w-3xl max-h-[95vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Package className="h-6 w-6 text-blue-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {product
                  ? 'Edit Product'
                  : 'Add Product'}
              </h2>

              <p className="text-sm text-slate-500">
                {product
                  ? 'Update existing product'
                  : 'Create new product'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="h-6 w-6 text-slate-600" />
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-8 p-8"
        >
          {/* =================================================
              COLOR VARIANTS
          ================================================= */}

          <div>
            <div className="mb-3">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <Tag className="h-4 w-4 text-blue-600" />

                Color Variants

                <span className="text-xs font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <p className="mt-1 text-xs text-slate-500">
                Add color-specific images only if this product has color variants.
              </p>
            </div>

            <div className="space-y-4">
              {imageGroups.map(
                (
                  group,
                  groupIndex
                ) => (
                  <div
                    key={group.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                      <div className="flex-1">
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Color {groupIndex + 1}
                        </label>

                        <select
                          value={
                            group.color
                          }
                          onChange={(e) =>
                            handleColorGroupChange(
                              groupIndex,
                              e.target.value
                            )
                          }
                          disabled={
                            loadingColors
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                        >
                          <option value="">
                            {loadingColors
                              ? 'Loading Colors...'
                              : 'Select Color'}
                          </option>

                          {colorOptions.map(
                            (color) => (
                              <option
                                key={
                                  color.id
                                }
                                value={
                                  color.name
                                }
                              >
                                {
                                  color.name
                                }
                              </option>
                            )
                          )}
                        </select>

                        {!loadingColors &&
                          colorOptions.length ===
                          0 && (
                            <div className="mt-2 text-xs text-red-500">
                              No active colors found.
                            </div>
                          )}
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                          <Upload className="h-4 w-4" />

                          Add Images

                          <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={(e) =>
                              handleImageChange(
                                groupIndex,
                                e
                              )
                            }
                          />
                        </label>

                        {imageGroups.length >
                          1 && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveColorGroup(
                                  groupIndex
                                )
                              }
                              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              Remove Color
                            </button>
                          )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {group.items.length >
                        0 ? (
                        group.items.map(
                          (
                            item,
                            itemIndex
                          ) => (
                            <div
                              key={
                                item.id
                              }
                              className="relative rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
                            >
                              <div className="h-24 overflow-hidden rounded-lg bg-slate-100">
                                <img
                                  src={getPreviewSrc(
                                    item.src
                                  )}
                                  alt={`${group.color || 'color'}-${itemIndex + 1}`}
                                  className="h-full w-full object-cover"
                                  onError={(
                                    event
                                  ) => {
                                    event.currentTarget.src =
                                      '/placeholder.svg';
                                  }}
                                />
                              </div>

                              {itemIndex ===
                                0 && (
                                  <div className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 shadow">
                                    <Star className="h-3.5 w-3.5 text-white" />
                                  </div>
                                )}

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveImage(
                                    groupIndex,
                                    itemIndex
                                  )
                                }
                                className="mt-2 flex w-full items-center justify-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4" />

                                Remove
                              </button>
                            </div>
                          )
                        )
                      ) : (
                        <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                          No images added for this color yet.
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="mt-4 flex justify-start">
              <button
                type="button"
                onClick={
                  handleAddColorGroup
                }
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                + Add Another Color
              </button>
            </div>
          </div>

          {/* =================================================
              SIMILAR IMAGES
          ================================================= */}

          <div>
            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Tag className="h-4 w-4 text-purple-600" />

                  Similar Images
                </label>

                <p className="mt-1 text-xs text-slate-500">
                  Add images of similar or related products.
                </p>
              </div>

              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700">
                <Upload className="h-4 w-4" />

                Add Similar Images

                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={
                    handleSimilarImageChange
                  }
                />
              </label>
            </div>

            {similarImages.length >
              0 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {similarImages.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={
                        item.id
                      }
                      className="relative rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
                    >
                      <div className="h-28 overflow-hidden rounded-lg bg-slate-100">
                        <img
                          src={getPreviewSrc(
                            item.src
                          )}
                          alt={`Similar product ${index + 1}`}
                          className="h-full w-full object-cover"
                          onError={(
                            event
                          ) => {
                            event.currentTarget.src =
                              '/placeholder.svg';
                          }}
                        />
                      </div>

                      <div className="mt-2 text-center text-xs font-medium text-slate-500">
                        Similar {index + 1}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveSimilarImage(
                            index
                          )
                        }
                        className="mt-2 flex w-full items-center justify-center gap-1 rounded-md bg-red-50 px-2 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />

                        Remove
                      </button>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <Upload className="mx-auto h-8 w-8 text-slate-400" />

                <p className="mt-2 text-sm font-medium text-slate-600">
                  No similar images added
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Upload images of similar products
                </p>
              </div>
            )}
          </div>

          {/* =================================================
              PRODUCT NAME
          ================================================= */}

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Tag className="h-4 w-4 text-blue-600" />
              Product Name
            </label>

            <input
              type="text"
              name="name"
              value={
                formData.name
              }
              onChange={
                handleChange
              }
              placeholder="Product name"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* =================================================
              CATEGORY
          ================================================= */}

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Package className="h-4 w-4 text-blue-600" />
              Category
            </label>

            <select
              name="category"
              value={
                formData.category ||
                ''
              }
              onChange={
                handleChange
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">
                Select Category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      category
                    }
                    value={
                      category
                    }
                  >
                    {
                      category
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {/* =================================================
              SUBCATEGORY
          ================================================= */}

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Tag className="h-4 w-4 text-blue-600" />
              Subcategory
            </label>

            <input
              type="text"
              name="subcategory"
              value={
                formData.subcategory ||
                ''
              }
              onChange={
                handleChange
              }
              placeholder="Enter subcategory"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* =================================================
              PRICE + STOCK
          ================================================= */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <DollarSign className="h-4 w-4 text-amber-600" />
                Price
              </label>

              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={
                  formData.price
                }
                onChange={(e) => {
                  setFormData(
                    (prev) => ({
                      ...prev,
                      price:
                        e.target.value,
                    })
                  );
                }}
                placeholder="Enter price"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Boxes className="h-4 w-4 text-amber-600" />
                Stock
              </label>

              <input
                type="number"
                name="stock"
                min="0"
                step="1"
                value={
                  formData.stock
                }
                onChange={(e) => {
                  setFormData(
                    (prev) => ({
                      ...prev,
                      stock:
                        e.target.value,
                    })
                  );
                }}
                placeholder="Enter stock"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-blue-600" />
              Description
            </label>

            <textarea
              name="description"
              rows={4}
              value={
                formData.description ||
                ''
              }
              onChange={
                handleChange
              }
              placeholder="Enter product description"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* =================================================
              TOGGLES
          ================================================= */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* STATUS */}

            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div>
                <p className="font-semibold">
                  Product Status
                </p>

                <p className="text-sm text-slate-500">
                  {formData.status ===
                    'active'
                    ? 'Active'
                    : 'Inactive'}
                </p>
              </div>

              <Switch
                checked={
                  formData.status ===
                  'active'
                }
                onCheckedChange={
                  handleStatusToggle
                }
              />
            </div>

            {/* CUSTOMIZABLE */}

            <div className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50 p-4">
              <div>
                <p className="font-semibold">
                  Customizable
                </p>

                <p className="text-sm text-slate-500">
                  {formData.customizable
                    ? 'Enabled'
                    : 'Disabled'}
                </p>
              </div>

              <Switch
                checked={
                  formData.customizable ===
                  1
                }
                onCheckedChange={
                  handleCustomizableToggle
                }
              />
            </div>

            {/* IMAGE CUSTOMIZABLE */}

            <div className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50 p-4">
              <div>
                <p className="font-semibold">
                  Image Customizable
                </p>

                <p className="text-sm text-slate-500">
                  {formData.image_customizable
                    ? 'Enabled'
                    : 'Disabled'}
                </p>
              </div>

              <Switch
                checked={
                  formData.image_customizable ===
                  1
                }
                onCheckedChange={
                  handleImageCustomizableToggle
                }
              />
            </div>
          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="flex justify-end gap-4 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={
                isSubmitting
              }
              className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting
              }
              className={`rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition ${isSubmitting
                ? 'cursor-not-allowed opacity-80'
                : 'hover:bg-blue-700'
                }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                {isSubmitting && (
                  <Spinner className="h-4 w-4" />
                )}

                {isSubmitting
                  ? product
                    ? 'Updating Product...'
                    : 'Creating Product...'
                  : product
                    ? 'Update Product'
                    : 'Create Product'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}