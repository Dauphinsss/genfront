"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Plus, Loader2, Trash2, CheckCircle2 } from "lucide-react";

interface Privilege {
  id: number;
  name: string;
  description?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function PrivilegesManagement() {
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newPrivilege, setNewPrivilege] = useState({
    name: "",
    description: "",
    category: "admin",
  });

  useEffect(() => {
    loadPrivileges();
  }, []);

  const loadPrivileges = async () => {
    const token = localStorage.getItem("pyson_token");
    if (!token) return;

    try {
      const { data } = await axios.get("http://localhost:4000/privileges", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrivileges(data);
    } catch (err) {
      console.error("Error cargando privilegios:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrivilege = async () => {
    if (!newPrivilege.name.trim()) return;

    const token = localStorage.getItem("pyson_token");
    setCreating(true);

    try {
      const { data } = await axios.post(
        "http://localhost:4000/privileges",
        {
          name: newPrivilege.name.trim(),
          description: newPrivilege.description.trim() || undefined,
          category: newPrivilege.category,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPrivileges([...privileges, data]);
      setNewPrivilege({ name: "", description: "", category: "admin" });
      setShowCreateForm(false);
    } catch (err) {
      console.error("Error creando privilegio:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePrivilege = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este privilegio?")) return;

    const token = localStorage.getItem("pyson_token");
    try {
      await axios.delete(`http://localhost:4000/privileges/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrivileges(privileges.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error eliminando privilegio:", err);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "admin":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "teacher":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Privilegios</h1>
          <p className="text-muted-foreground mt-2">
            Catálogo de privilegios del sistema ({privileges.length} total)
          </p>
        </div>

        <div className="w-full md:w-auto mt-4 md:mt-0">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="rounded-lg w-full md:w-auto flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Privilegio
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Crear Nuevo Privilegio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del privilegio *</Label>
                <Input
                  id="name"
                  placeholder="ej: manage_courses"
                  value={newPrivilege.name}
                  onChange={(e) =>
                    setNewPrivilege({ ...newPrivilege, name: e.target.value })
                  }
                  className="rounded-lg"
                />
                <p className="text-xs text-muted-foreground">
                  Usa snake_case (ej: manage_users, create_courses)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <select
                  id="category"
                  value={newPrivilege.category}
                  onChange={(e) =>
                    setNewPrivilege({ ...newPrivilege, category: e.target.value })
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="admin">Administrador</option>
                  <option value="teacher">Maestro</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                placeholder="Describe qué permite hacer este privilegio"
                value={newPrivilege.description}
                onChange={(e) =>
                  setNewPrivilege({ ...newPrivilege, description: e.target.value })
                }
                className="rounded-lg"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewPrivilege({ name: "", description: "", category: "admin" });
                }}
                disabled={creating}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreatePrivilege}
                disabled={!newPrivilege.name.trim() || creating}
                className="w-full sm:w-auto"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Crear Privilegio
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {privileges.map((priv) => (
          <Card key={priv.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">{priv.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePrivilege(priv.id)}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {priv.description && (
                <p className="text-sm text-muted-foreground">{priv.description}</p>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Badge
                  variant="outline"
                  className={`${getCategoryColor(priv.category || "admin")} border`}
                >
                  {priv.category === "admin" ? "Administrador" : "Maestro"}
                </Badge>
                <span className="text-xs text-muted-foreground">ID: {priv.id}</span>
              </div>

              {priv.createdAt && (
                <p className="text-xs text-muted-foreground">
                  Creado: {new Date(priv.createdAt).toLocaleDateString("es-ES")}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {privileges.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              No hay privilegios en el sistema
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Privilegio
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}