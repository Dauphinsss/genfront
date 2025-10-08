"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const { privileges } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [allPrivileges, setAllPrivileges] = useState<Privilege[]>([]);
  const [loading, setLoading] = useState(true);

  const canManage = privileges.some((p) => p.name === "manage_users");

  useEffect(() => {
    if (!canManage) return;

    const token = localStorage.getItem("pyson_token");

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
      .catch(() => console.error("Error cargando usuarios"))
      .finally(() => setLoading(false));
  }, [canManage]);

  const togglePrivilege = async (userId: number, privilegeId: number) => {
    const token = localStorage.getItem("pyson_token");
    try {
      await axios.post(
        `http://localhost:4000/users/${userId}/toggle-privilege`,
        { privilegeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                privileges: u.privileges.some((p) => p.id === privilegeId)
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

  if (!canManage)
    return (
      <div className="p-8 text-center text-muted-foreground">
        No tienes permiso para ver esta sección.
      </div>
    );

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Cargando usuarios...
      </div>
    );

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Gestión de Usuarios</h1>

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
                      onClick={() => togglePrivilege(user.id, priv.id)}
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