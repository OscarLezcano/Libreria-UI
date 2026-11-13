import SellerNavbar from "@/common/components/SellerNavbar";
import { Suspense } from "react";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-base-200 min-h-dvh">
      <Suspense fallback={null}>
        <SellerNavbar />
      </Suspense>
      <Suspense fallback={null}>{children}</Suspense>
    </div>
  );
}
