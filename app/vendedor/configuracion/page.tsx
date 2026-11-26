"use client";

import ProfileSettingsContent from "@/common/components/ProfileSettingsContent";
import { Settings } from "lucide-react";

export default function SellerSettingsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-start gap-3">
        <div className="bg-primary/10 text-primary rounded-box p-3">
          <Settings className="size-6" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold">Configuración</h1>
          <p className="text-base-content/60 mt-1 text-sm">
            Preferencias visuales y accesos rápidos del panel vendedor.
          </p>
        </div>
      </div>

      <ProfileSettingsContent />
    </main>
  );
}
