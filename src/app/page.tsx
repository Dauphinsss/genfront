'use client';

import { Dashboard } from '@/components/dashboard';
import { Header } from '@/components/header';
import { LoginSection } from '@/components/login-section';
import { useState, useEffect } from 'react';

interface User {
  name: string;
  email: string;
  avatar: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkExistingSession = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const savedUser = localStorage.getItem('pyson_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      const savedTheme = localStorage.getItem('pyson_theme');
      const prefersDark =
        savedTheme === 'dark' ||
        (!savedTheme &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDark(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);

      setIsLoading(false);
    };

    checkExistingSession();
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('pyson_theme', newIsDark ? 'dark' : 'light');
  };

  const handleLogin = async (provider: 'google' | 'microsoft') => {
    console.log('[v0] Logging in with:', provider);

    setIsAuthLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockUser: User = {
      name: provider === 'google' ? 'Juan Pérez' : 'María González',
      email: provider === 'google' ? 'juan@gmail.com' : 'maria@outlook.com',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
    };

    setUser(mockUser);
    localStorage.setItem('pyson_user', JSON.stringify(mockUser));
    setIsAuthLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pyson_user');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-border border-t-foreground rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Cargando Pyson...</p>
        </div>
      </div>
    );
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
    <main className="min-h-screen bg-background">
      <Header onToggleTheme={toggleTheme} isDark={isDark} />
      <LoginSection onLogin={handleLogin} isLoading={isAuthLoading} />
    </main>
  );
}
