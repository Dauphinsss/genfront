"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface Privilege {
  id: number;
  name: string;
  description?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  privileges: Privilege[];
  loading: boolean;
  logout: () => void;
  refreshPrivileges: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  privileges: [],
  loading: true,
  logout: () => {},
  refreshPrivileges: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("pyson_token");
    const userData = localStorage.getItem("pyson_user");

    if (userData) setUser(JSON.parse(userData));

    if (token) {
      axios
        .get("http://localhost:4000/privileges/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setPrivileges(res.data);
          localStorage.setItem("pyson_privileges", JSON.stringify(res.data));
        })
        .catch(() => {
          console.warn("Error cargando privilegios");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("pyson_token");
    localStorage.removeItem("pyson_user");
    localStorage.removeItem("pyson_privileges");
    setUser(null);
    setPrivileges([]);
    window.location.href = "/";
  };

  const refreshPrivileges = async () => {
    const token = localStorage.getItem("pyson_token");
    if (!token) return;
    const { data } = await axios.get("http://localhost:4000/privileges/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPrivileges(data);
    localStorage.setItem("pyson_privileges", JSON.stringify(data));
  };

  return (
    <AuthContext.Provider value={{ user, privileges, loading, logout, refreshPrivileges }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);