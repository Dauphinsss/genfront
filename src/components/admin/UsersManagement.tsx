"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, UserMinus, X, Check, Loader2 } from "lucide-react";

interface Privilege {
  id: number;
  name: string;
  description?: string;
  category?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  privileges: Privilege[];
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [allPrivileges, setAllPrivileges] = useState<Privilege[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatingPrivilege, setUpdatingPrivilege] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("pyson_token");
    if (!token) return;

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
      .catch((err) => console.error("Error cargando datos:", err))
      .finally(() => setLoading(false));
  }, []);

  const togglePrivilege = async (userId: number, privilegeId: number, has: boolean) => {
    const token = localStorage.getItem("pyson_token");
    setUpdatingPrivilege(privilegeId);

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

      if (selectedUser?.id === userId) {
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                privileges: has
                  ? prev.privileges.filter((p) => p.id !== privilegeId)
                  : [...prev.privileges, allPrivileges.find((p) => p.id === privilegeId)!],
              }
            : null
        );
      }
    } catch (err) {
      console.error("Error al cambiar privilegio:", err);
    } finally {
      setUpdatingPrivilege(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
        <p className="text-muted-foreground mt-2">
          Administra los privilegios de los usuarios del sistema
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Buscar por nombre o correo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Usuarios ({filteredUsers.length})</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredUsers.map((user) => (
              <Card
                key={user.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedUser?.id === user.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={user.avatar || "/placeholder.svg?height=40&width=40"}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{user.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.privileges.length > 0 ? (
                          user.privileges.map((priv) => (
                            <Badge key={priv.id} variant="secondary" className="text-xs">
                              {priv.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin privilegios</span>
                        )}
                      </div>
                    </div>
                    {selectedUser?.id === user.id && (
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {selectedUser ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Privilegios de {selectedUser.name}</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Privilegios Actuales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedUser.privileges.length > 0 ? (
                    selectedUser.privileges.map((priv) => (
                      <div
                        key={priv.id}
                        className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">{priv.name}</p>
                          {priv.description && (
                            <p className="text-xs text-muted-foreground mt-1">{priv.description}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => togglePrivilege(selectedUser.id, priv.id, true)}
                          disabled={updatingPrivilege === priv.id}
                        >
                          {updatingPrivilege === priv.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <UserMinus className="w-4 h-4 mr-1" />
                              Quitar
                            </>
                          )}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Este usuario no tiene privilegios asignados
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Privilegios Disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {allPrivileges
                    .filter((priv) => !selectedUser.privileges.some((p) => p.id === priv.id))
                    .map((priv) => (
                      <div
                        key={priv.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">{priv.name}</p>
                          {priv.description && (
                            <p className="text-xs text-muted-foreground mt-1">{priv.description}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => togglePrivilege(selectedUser.id, priv.id, false)}
                          disabled={updatingPrivilege === priv.id}
                        >
                          {updatingPrivilege === priv.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-1" />
                              Asignar
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Selecciona un usuario de la lista para gestionar sus privilegios
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}