"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { TopicsGridView } from "@/components/teacher/TopicsGridView";

export default function TopicsPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const theme = document.documentElement.classList.contains("dark");
    setIsDark(theme);
  }, []);

  const handleToggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleTheme={handleToggleTheme} isDark={isDark} />
      <div className="container mx-auto px-4 py-8">
        <TopicsGridView />
      </div>
    </div>
  );
}
