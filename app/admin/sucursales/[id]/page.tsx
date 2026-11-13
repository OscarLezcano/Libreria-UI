import { parseWarehouseId } from "@/common/utils/warehouseScope";
import { redirect } from "next/navigation";

export default async function AdminSucursalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (parseWarehouseId(id) === null) {
    redirect("/admin/sucursales");
  }

  redirect(`/vendedor/libros?warehouseId=${encodeURIComponent(id)}`);
}
