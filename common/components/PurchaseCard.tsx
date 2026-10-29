// import type { Purchase, PurchaseStatus } from "@/common/data/purchases";
// import Link from "next/link";

// interface PurchaseCardProps {
//   purchase: Purchase;
//   coverSrc: string;
//   title: string;
//   authors: string[];
//   unitPrice: number;
//   href: string;
// }

// const STATUS_META: Record<
//   PurchaseStatus,
//   { label: string; badge: string }
// > = {
//   pendiente: { label: "Pendiente", badge: "badge-warning" },
//   aprobado: { label: "Aprobado", badge: "badge-success" },
//   enviado: { label: "Enviado", badge: "badge-info" },
//   cancelado: { label: "Cancelado", badge: "badge-error" },
// };

// const formatGs = (value: number) =>
//   new Intl.NumberFormat("es-PY").format(value);

// export default function PurchaseCard({
//   purchase,
//   coverSrc,
//   title,
//   authors,
//   unitPrice,
//   href,
// }: PurchaseCardProps) {
//   const status = STATUS_META[purchase.status];
//   const total = unitPrice * purchase.quantity;

//   return (
//     <div className="card bg-base-100 card-border border-base-300 overflow-hidden">
//       <figure>
//         <Link href={href} aria-label={title}>
//           <img
//             src={coverSrc}
//             alt={title}
//             className="aspect-[3/4] w-full object-cover"
//           />
//         </Link>
//       </figure>
//       <div className="card-body gap-1 p-4">
//         <div className="flex items-center justify-between gap-2">
//           <span className={`badge badge-sm ${status.badge}`}>
//             {status.label}
//           </span>
//         </div>
//         <h3 className="text-sm font-bold leading-snug">{title}</h3>
//         <p className="text-base-content/70 text-xs font-semibold">
//           {authors.join(", ")}
//         </p>
//         <p className="text-base-content/60 text-xs">
//           Comprado el {purchase.date}
//         </p>
//         <div className="mt-1 flex justify-between text-sm">
//           <span className="text-base-content/60">
//             {purchase.quantity} {purchase.quantity === 1 ? "unidad" : "unidades"}
//           </span>
//           <span className="font-extrabold">{formatGs(total)} Gs</span>
//         </div>
//         <div className="card-actions mt-2">
//           <Link href={href} className="btn btn-neutral btn-sm btn-block">
//             Ver ficha
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }
