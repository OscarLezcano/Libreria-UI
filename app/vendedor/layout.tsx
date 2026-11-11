import SellerNavbar from "@/common/components/SellerNavbar";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-base-200 min-h-dvh">
      <SellerNavbar />
      {children}
    </div>
  );
}
