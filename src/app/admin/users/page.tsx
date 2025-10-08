"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface Privilege {
  id: number;
  name: string;
  description?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  privileges: Privilege[];
}

export default function UsersPage() {
  const router = useRouter();
  const { privileges } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [allPrivileges, setAllPrivileges] = useState<Privilege[]>([]);
  const [loading, setLoading] = useState(true);

  const canManage = privileges.some((p) => p.name === "manage_users");

  useEffect(() => {
    // Redirigir si no tiene permisos
    if (!canManage && !loading) {
      router.push("/");
      return;
    }

    if (!canManage) return;

    const token = localStorage.getItem("pyson_token");
    if (!token) {
      router.push("/");
      return;
    }

    Promise.all([
      axios.get("http://localhost:4000/users", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get("http://localhost:4000/privileges", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([usersRes, privRes]) => {
        setUsers(usersRes.data);
        setAllPrivileges(privRes.data);
      })
      .catch((err) => {
        console.error("Error cargando usuarios", err);
      })
      .finally(() => setLoading(false));
  }, [canManage, router, loading]);

  const togglePrivilege = async (userId: number, privilegeId: number, has: boolean) => {
    const token = localStorage.getItem("pyson_token");
    try {
      if (has) {
        await axios.delete("http://localhost:4000/privileges/remove", {
          headers: { Authorization: `Bearer ${token}` },
          data: { userId, privilegeId },
        });
      } else {
        await axios.post(
          "http://localhost:4000/privileges/assign",
          { userId, privilegeId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                privileges: has
                  ? u.privileges.filter((p) => p.id !== privilegeId)
                  : [...u.privileges, allPrivileges.find((p) => p.id === privilegeId)!],
              }
            : u
        )
      );
    } catch (err) {
      console.error("Error al cambiar privilegio", err);
    }
  };

  if (!canManage && !loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No tienes permiso para ver esta sección.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Cargando usuarios...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Gestión de Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra privilegios de los usuarios del sistema
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/")}>
          Volver al inicio
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle>{user.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {user.privileges.map((p) => (
                  <Badge key={p.id} variant="secondary">
                    {p.name}
                  </Badge>
                ))}
                {user.privileges.length === 0 && (
                  <span className="text-xs text-muted-foreground">Sin privilegios</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {allPrivileges.map((priv) => {
                  const has = user.privileges.some((p) => p.id === priv.id);
                  return (
                    <Button
                      key={priv.id}
                      size="sm"
                      variant={has ? "destructive" : "default"}
                      onClick={() => togglePrivilege(user.id, priv.id, has)}
                    >
                      {has ? `Quitar ${priv.name}` : `Agregar ${priv.name}`}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}