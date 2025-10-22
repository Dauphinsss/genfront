"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  UserPlus,
  UserMinus,
  X,
  Check,
  Loader2,
  Shield,
} from "lucide-react";

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
  const [updatingPrivilege, setUpdatingPrivilege] = useState<number | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const openModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedUser(null), 300);
  };

  const togglePrivilege = async (
    userId: number,
    privilegeId: number,
    has: boolean
  ) => {
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
                  : [
                      ...u.privileges,
                      allPrivileges.find((p) => p.id === privilegeId)!,
                    ],
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
                  : [
                      ...prev.privileges,
                      allPrivileges.find((p) => p.id === privilegeId)!,
                    ],
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
    <>
      <div className="space-y-8 max-w-6xl mx-auto">
        <Card className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur">
          <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl">Gestión de Usuarios</CardTitle>
                  <CardDescription>
                    Toca un usuario para ver y modificar sus privilegios
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="rounded-full border-border/70 px-3 py-1 text-xs uppercase tracking-wide">
                Panel Administrativo
              </Badge>
            </div>
            <Separator className="opacity-60" />
            <div className="group relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 rounded-xl border-border/70 bg-background/60 pl-11 transition-colors focus-visible:border-primary focus-visible:ring-primary/30"
              />
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUsers.map((user, index) => (
            <Card
              key={user.id}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl"
              onClick={() => openModal(user)}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardContent
                className="flex items-start gap-4 p-5 md:flex-col md:items-center md:text-center animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Image
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full border border-border/80 object-cover shadow-sm transition-transform duration-300 group-hover:scale-105"
                  />
                  {user.privileges.length > 0 && (
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground shadow-lg">
                      {user.privileges.length}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1 md:w-full">
                  <h3 className="truncate text-sm font-semibold text-foreground">
                    {user.name}
                  </h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                  {user.privileges.length === 0 ? (
                    <Badge variant="secondary" className="mt-2 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide">
                      sin privilegios
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="mt-2 rounded-full border-primary/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-primary">
                      {user.privileges.length} privilegio{user.privileges.length === 1 ? "" : "s"}
                    </Badge>
                  )}
                </div>

                {/* Button */}
                <Button
                  size="sm"
                  variant="secondary"
                  className="hidden w-full rounded-lg text-xs font-medium transition-all duration-300 hover:scale-[1.02] hover:bg-primary hover:text-primary-foreground md:flex"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(user);
                  }}
                >
                  <Shield className="mr-1.5 h-3.5 w-3.5" />
                  Gestionar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="rounded-2xl border border-dashed bg-card/70">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-2">
              <Search className="h-12 w-12 text-muted-foreground/80" />
              <p>No se encontraron usuarios que coincidan con tu búsqueda</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedUser && (
        <>
          <div
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={closeModal}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-background border border-border rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src={selectedUser.avatar || "/placeholder.svg"}
                    alt={selectedUser.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full border-2 border-border"
                  />
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      {selectedUser.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  {/* Privilegios Actuales */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center justify-center w-7 h-7 text-secondary  bg-primary rounded-full">
                        <Check className="w-3.5 h-3.5 " />
                      </div>
                      <h3 className="text-base font-semibold text-foreground">
                        Privilegios Activos
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        ({selectedUser.privileges.length})
                      </span>
                    </div>

                    {selectedUser.privileges.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedUser.privileges.map((priv) => (
                          <div
                            key={priv.id}
                            className="flex items-start justify-between gap-3 rounded-lg border border-primary/30 bg-primary/10 p-3 shadow-sm transition-all duration-200 hover:border-primary hover:bg-primary/15 dark:border-primary/40 dark:bg-primary/15"
                          >
                            <div className="flex-1 min-w-0 mr-2">
                              <p className="font-medium text-xs text-foreground truncate">
                                {priv.name}
                              </p>
                              {priv.description && (
                                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                                  {priv.description}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-shrink-0 h-7 w-7 p-0"
                              onClick={() =>
                                togglePrivilege(selectedUser.id, priv.id, true)
                              }
                              disabled={updatingPrivilege === priv.id}
                            >
                              {updatingPrivilege === priv.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <UserMinus className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-secondary rounded-lg">
                        <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">
                          Este usuario no tiene privilegios asignados
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Privilegios Disponibles */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center justify-center w-7 h-7 bg-primary rounded-full">
                        <UserPlus className="w-3.5 h-3.5 text-secondary" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground">
                        Privilegios Disponibles
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        (
                        {
                          allPrivileges.filter(
                            (priv) =>
                              !selectedUser.privileges.some(
                                (p) => p.id === priv.id
                              )
                          ).length
                        }
                        )
                      </span>
                    </div>

                    {allPrivileges.filter(
                      (priv) =>
                        !selectedUser.privileges.some((p) => p.id === priv.id)
                    ).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {allPrivileges
                          .filter(
                            (priv) =>
                              !selectedUser.privileges.some(
                                (p) => p.id === priv.id
                              )
                          )
                          .map((priv) => (
                            <div
                              key={priv.id}
                              className="flex items-start justify-between gap-3 rounded-lg border border-border p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10"
                            >
                              <div className="flex-1 min-w-0 mr-2">
                                <p className="font-medium text-xs text-foreground truncate">
                                  {priv.name}
                                </p>
                                {priv.description && (
                                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                                    {priv.description}
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                className="flex-shrink-0 h-7 w-7 p-0"
                                onClick={() =>
                                  togglePrivilege(
                                    selectedUser.id,
                                    priv.id,
                                    false
                                  )
                                }
                                disabled={updatingPrivilege === priv.id}
                              >
                                {updatingPrivilege === priv.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <UserPlus className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-secondary rounded-lg">
                        <Check className="w-10 h-10 text-primary mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">
                          Este usuario ya tiene todos los privilegios
                          disponibles
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-background border-t border-border px-4 py-3 flex justify-end">
                <Button onClick={closeModal} variant="outline" size="sm">
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
