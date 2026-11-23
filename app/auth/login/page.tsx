import LoadingSpinner from "@/common/components/LoadingSpinner";
import { Suspense } from "react";
import LoginPageClient from "./LoginPageClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Cargando inicio de sesión" />}>
      <LoginPageClient />
    </Suspense>
  );
}
