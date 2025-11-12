"use client";

import { Dashboard } from "@/components/dashboard";
import { Header } from "@/components/header";
import { LoginSection } from "@/components/login-section";
import { useState, useEffect, lazy, Suspense } from "react";
import { AuthProvider } from "@/components/context/AuthContext";
import { Loading } from "@/components/ui/loading";

const ParticleBackground = lazy(
  () => import("@/components/particleBackground")
);
const TextCircleFollower = lazy(
  () => import("@/components/textCircleFollower")
);

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

function HomeContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkExistingSession = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const savedUser = localStorage.getItem("pyson_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      const savedTheme = localStorage.getItem("pyson_theme");
      const prefersDark =
        savedTheme === "dark" ||
        (!savedTheme &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      setIsDark(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);

      setIsLoading(false);
    };

    checkExistingSession();
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("pyson_theme", newIsDark ? "dark" : "light");
  };

  const handleLogin = async (provider: "google" | "microsoft") => {
    console.log("[v0] Logging in with:", provider);
    setIsAuthLoading(true);

    if (provider === "google") {
      window.location.href = `http://localhost:4000/auth/google`;
    } else {
      window.location.href = `http://localhost:4000/auth/microsoft`;
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("pyson_user");
    localStorage.removeItem("pyson_token");
    localStorage.removeItem("pyson_privileges");
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (user) {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
        onToggleTheme={toggleTheme}
        isDark={isDark}
      />
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <TextCircleFollower />
      </Suspense>
      <main className="min-h-screen bg-background">
        <Header onToggleTheme={toggleTheme} isDark={isDark} />
        <Suspense
          fallback={<div className="absolute inset-0 pointer-events-none" />}
        >
          <ParticleBackground />
        </Suspense>
        <LoginSection onLogin={handleLogin} isLoading={isAuthLoading} />
      </main>
    </>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
