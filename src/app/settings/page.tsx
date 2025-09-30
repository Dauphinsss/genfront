"use client";

import { useState } from "react";
import { Header } from "@/components/header";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("Tu nombre");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  interface SettingsProps {
    user?: {
      name: string
      email: string
      avatar: string
    }
    currentView?: "inicio" | "perfil" | "configuracion"
    onViewChange?: (view: "inicio" | "perfil" | "configuracion" ) => void
    onToggleTheme?: () => void
    onLogout?: () => void // Added onLogout prop
    isDark?: boolean
  }
  
  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpeg)$/.test(file.type) || file.size > 2 * 1024 * 1024) {
      alert("Por favor selecciona una imagen PNG o JPEG menor a 2MB.");
      return;
    }
    setAvatarPreview(URL.createObjectURL(file));
  };

  return (
    <main className="max-w-3x1 mx-auto px-4 sm:px-6 lg:px-8 py-8"> 
      <Header user={{ name: "José Daniel Virreira Rufino", email: "test@test.com", avatar: "/placeholder.svg?height=32&width=32" }}
      currentView="perfil"
      onLogout={() => alert("Cerrar sesión")}
      onViewChange={() => {}}
      onToggleTheme={() => {}}
      isDark={false}
      />

      { /* Tarjeta perfil */ }
      <section className="rounded-xl border border-border bg-background p-4 sm:p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Perfil</h2>
          <p className="text-sm text-muted-foreground">
            Actualiza tu información personal.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <img
            src={avatarPreview || "/default-avatar.png"}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover border border-border"
          />

          <div>
            <label
              htmlFor="file"
              className="inline-flex items-center px-3 py-2 rounded-md border cursor-pointer hover:bg-secondary text-sm"
            >
              Cambiar foto
            </label>
            <input id="file" type="file" accept="image/png,image/jpeg" className="hidden" onChange={onPickAvatar} />
            <p className= "text-xs text-muted-foreground mt-1">PNG/JPG, máx. 2MB</p>
          </div>

        </div>

        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">Nombre para mostrar</label>
          <input
            id="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-md border px-3 py-2 bg-background"
            placeholder="Escribe tu nombre"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={saving}
            className="inline-flex items-center rounded-md bg-foreground text-background px-4 py-2 text-sm hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cerrar sesión
          </button>
        </div>
      </section>
    </main>
  );
}