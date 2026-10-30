import AdminNavbar from "@/common/components/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-base-200 min-h-dvh">
      <AdminNavbar />
      {children}
    </div>
  );
}
