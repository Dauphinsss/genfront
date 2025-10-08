"use client";
import { AuthProvider, useAuth } from "@/components/context/AuthContext";
import { Sidebar } from "@/components/sidebar";
import { usePathname } from "next/navigation";

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  const hideSidebar = pathname === "/login" || pathname.startsWith("/auth");

  return (
    <div className="flex min-h-screen">
      {!hideSidebar && (
        <Sidebar
          currentView={pathname}
          onViewChange={() => {}}
        />
      )}
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </AuthProvider>
  );
}