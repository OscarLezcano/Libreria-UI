"use client";

import HomeFooter from "@/common/components/HomeFooter";
import ProfileSettingsContent from "@/common/components/ProfileSettingsContent";
import ReaderNavbar from "@/common/components/ReaderNavbar";
import Link from "next/link";
import { Settings } from "lucide-react";

export default function ClientSettingsPage() {
  return (
    <main className="bg-base-200 flex min-h-dvh flex-col">
      <ReaderNavbar />
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 lg:px-8">
        <div className="mb-6 flex items-start gap-3">
          <div className="bg-primary/10 text-primary rounded-box p-3">
            <Settings className="size-6" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">Configuración</h1>
            <p className="text-base-content/60 mt-1 text-sm">
              Personalizá la apariencia de la tienda en este navegador.
            </p>
          </div>
        </div>

        <ProfileSettingsContent />

        <div className="mt-6">
          <Link href="/mis-compras" className="btn btn-outline btn-sm">
            Ir a mis compras
          </Link>
        </div>
      </div>
      <HomeFooter />
    </main>
  );
}
