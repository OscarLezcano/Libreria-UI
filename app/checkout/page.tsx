"use client";

import HomeFooter from "@/common/components/HomeFooter";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import ShippingForm from "@/common/components/ShippingForm";
import { useCart, type ShippingData } from "@/common/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, setShipping } = useCart();
  const router = useRouter();

  const handleSubmit = (data: ShippingData) => {
    setShipping(data);
    router.push("/pago");
  };

  if (items.length === 0) {
    return (
      <main className="bg-base-100 min-h-screen">
        <ReaderNavbar active="compras" initials="HA" />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center lg:px-8">
          <p className="text-lg font-bold">No hay pedidos para confirmar</p>
          <p className="text-base-content/60 mt-1 text-sm">
            Agregá libros a tu carrito antes de continuar.
          </p>
          <Link href="/explorar" className="btn btn-primary mt-6">
            Explorar catálogo
          </Link>
        </div>
        <HomeFooter />
      </main>
    );
  }

  return (
    <main className="bg-base-100 min-h-screen">
      <ReaderNavbar active="compras" initials="HA" />

      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <h1 className="text-2xl font-extrabold">Confirmar y pagar</h1>
        <p className="text-base-content/60 mt-1 text-sm">
          Completá los datos de envío para tu pedido
        </p>

        <div className="mt-6">
          <ShippingForm onSubmit={handleSubmit} />
        </div>
      </div>

      <HomeFooter />
    </main>
  );
}
