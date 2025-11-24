"use client";
import { useEffect, useState } from "react";
import {
  getAllUsers,
  getAllPrivileges,
  assignPrivilege,
  removePrivilege,
  type User,
  type Privilege
} from "@/services/users";
import { Button } from "@/components/ui/button";
import { AuthenticatedAvatar } from "@/components/AuthenticatedAvatar";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  UserPlus,
  UserMinus,
  X,
  Loader2,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";

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
    Promise.all([
      getAllUsers(),
      getAllPrivileges(),
    ])
      .then(([users, privileges]) => {
        setUsers(users);
        setAllPrivileges(privileges);
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
    setUpdatingPrivilege(privilegeId);
    try {
      if (has) {
        await removePrivilege(userId, privilegeId);
      } else {
        await assignPrivilege(userId, privilegeId);
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
    return <Loading />;
  }

  return (
    <>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Gestión de Usuarios</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Selecciona un usuario para gestionar sus privilegios
            </p>
          </div>
        </div>

        <div className="group relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 pl-10 bg-background border-border/50 focus-visible:border-primary transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUsers.map((user, index) => (
            <Card
              key={user.id}
              variant="interactive"
              className="group cursor-pointer transition-all duration-200 hover:shadow-lg"
              onClick={() => openModal(user)}
            >
              <CardContent className="flex flex-col items-center text-center p-5 gap-3 animate-in fade-in-50" style={{ animationDelay: `${index * 30}ms` }}>
                <div className="relative">
                  <AuthenticatedAvatar
                    src={user.avatar}
                    alt={user.name}
                    width={72}
                    height={72}
                    className="h-18 w-18 rounded-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  {user.privileges.length > 0 && (
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {user.privileges.length}
                    </div>
                  )}
                </div>

                <div className="w-full space-y-1.5">
                  <h3 className="text-sm font-medium text-foreground truncate">
                    {user.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                  {user.privileges.length === 0 ? (
                    <Badge variant="secondary" className="text-xs">
                      Sin privilegios
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-primary/30 text-xs text-primary">
                      {user.privileges.length} privilegio{user.privileges.length === 1 ? "" : "s"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in-50">
            <Search className="h-10 w-10 text-muted-foreground/60 mb-3" />
            <p className="text-sm text-muted-foreground">No se encontraron usuarios</p>
          </div>
        )}
      </div>

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
              <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AuthenticatedAvatar
                    src={selectedUser.avatar}
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
                  size="icon"
                  onClick={closeModal}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-5 overflow-y-auto max-h-[calc(90vh-100px)]">
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-3">
                      Privilegios Activos ({selectedUser.privileges.length})
                    </h3>

                    {selectedUser.privileges.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedUser.privileges.map((priv) => (
                          <div
                            key={priv.id}
                            className="flex items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 transition-colors duration-200 hover:bg-primary/10"
                          >
                            <p className="flex-1 text-sm text-foreground truncate">
                              {priv.name}
                            </p>
                            <Button
                              size="icon"
                              variant="destructive"
                              className="flex-shrink-0 h-8 w-8"
                              onClick={() =>
                                togglePrivilege(selectedUser.id, priv.id, true)
                              }
                              disabled={updatingPrivilege === priv.id}
                            >
                              {updatingPrivilege === priv.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <UserMinus className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        Sin privilegios asignados
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-3">
                      Privilegios Disponibles ({allPrivileges.filter((priv) =>!selectedUser.privileges.some((p) => p.id === priv.id)).length})
                    </h3>

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
                              className="flex items-center justify-between gap-2 rounded-lg border border-border/50 p-3 transition-colors duration-200 hover:border-primary/50 hover:bg-muted/50"
                            >
                              <p className="flex-1 text-sm text-foreground truncate">
                                {priv.name}
                              </p>
                              <Button
                                size="icon"
                                className="flex-shrink-0 h-8 w-8"
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
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <UserPlus className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        Todos los privilegios asignados
                      </div>
                    )}
                  </div>
                </div>
              </div>

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