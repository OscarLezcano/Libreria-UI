import LoadingSpinner from "@/common/components/LoadingSpinner";
import { Suspense } from "react";
import BookDetailClient from "./BookDetailClient";

export default function BookDetailPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Cargando libro" />}>
      <BookDetailClient />
    </Suspense>
  );
}
