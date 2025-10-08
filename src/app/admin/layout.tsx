"use client";
import { useAuth } from "@/components/context/AuthContext";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading, privileges } = useAuth();
  const router = useRouter();

  const hasAdminPrivileges = privileges.some((p) => 
    p.name === "manage_users" || 
    p.name === "manage_privileges" || 
    p.name === "system_settings"
  );

  useEffect(() => {
    if (!loading && !hasAdminPrivileges) {
      router.push("/");
    }
  }, [loading, hasAdminPrivileges, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!hasAdminPrivileges) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1">{children}</main>
    </div>
  );
}