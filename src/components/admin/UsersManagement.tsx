"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, UserMinus, X, Check, Loader2, Shield } from "lucide-react";

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
    <>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-border"
              onClick={() => openModal(user)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <Image
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full border-2 border-border"
                    />
                    {user.privileges.length > 0 && (
                      <div className="absolute -bottom-1 -right-1 bg-neutral-800 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-semibold border-2 border-neutral-700 shadow-md
">
                        {user.privileges.length}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1 w-full">
                    <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center w-full min-h-[28px]">
                    {user.privileges.length > 0 ? (
                      <>
                        {user.privileges.slice(0, 3).map((priv) => (
                          <Badge key={priv.id} variant="secondary" className="text-xs">
                            {priv.name}
                          </Badge>
                        ))}
                        {user.privileges.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{user.privileges.length - 3}
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Sin privilegios
                      </Badge>
                    )}
                  </div>

                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(user);
                    }}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Gestionar privilegios
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No se encontraron usuarios que coincidan con tu búsqueda
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedUser && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={closeModal}
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-background border border-border rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Image
                    src={selectedUser.avatar || "/placeholder.svg"}
                    alt={selectedUser.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full border-2 border-border"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedUser.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                <div className="space-y-6">
                  {/* Privilegios Actuales */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-950 rounded-full">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Privilegios Activos
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        ({selectedUser.privileges.length})
                      </span>
                    </div>

                    {selectedUser.privileges.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedUser.privileges.map((priv) => (
                          <div
                            key={priv.id}
                            className="flex items-start justify-between p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg"
                          >
                            <div className="flex-1 min-w-0 mr-3">
                              <p className="font-medium text-sm text-foreground truncate">
                                {priv.name}
                              </p>
                              {priv.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {priv.description}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-shrink-0"
                              onClick={() => togglePrivilege(selectedUser.id, priv.id, true)}
                              disabled={updatingPrivilege === priv.id}
                            >
                              {updatingPrivilege === priv.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <UserMinus className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-secondary rounded-lg">
                        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Este usuario no tiene privilegios asignados
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Privilegios Disponibles */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-950 rounded-full">
                        <UserPlus className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Privilegios Disponibles
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        ({allPrivileges.filter((priv) => !selectedUser.privileges.some((p) => p.id === priv.id)).length})
                      </span>
                    </div>

                    {allPrivileges.filter((priv) => !selectedUser.privileges.some((p) => p.id === priv.id)).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {allPrivileges
                          .filter((priv) => !selectedUser.privileges.some((p) => p.id === priv.id))
                          .map((priv) => (
                            <div
                              key={priv.id}
                              className="flex items-start justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                            >
                              <div className="flex-1 min-w-0 mr-3">
                                <p className="font-medium text-sm text-foreground truncate">
                                  {priv.name}
                                </p>
                                {priv.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {priv.description}
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                className="flex-shrink-0"
                                onClick={() => togglePrivilege(selectedUser.id, priv.id, false)}
                                disabled={updatingPrivilege === priv.id}
                              >
                                {updatingPrivilege === priv.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <UserPlus className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-secondary rounded-lg">
                        <Check className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Este usuario ya tiene todos los privilegios disponibles
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4 flex justify-end">
                <Button onClick={closeModal} variant="outline">
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