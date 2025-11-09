"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  MoreVertical,
  FileText,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import type { Topic } from "@/types/topic";
import type { ContentDocument } from "@/types/content-blocks";
import {
  getAllTopics,
  deleteTopic,
} from "@/services/topics";

export function TopicsGridView() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Detectar si estamos en el dashboard o en la página standalone
  const isInDashboard = typeof window !== 'undefined' && window.location.pathname === '/';

  const loadTopics = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllTopics("content");
      setTopics(data);
    } catch (error) {
      console.error("Error loading topics:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tópicos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  const handleCreateNew = () => {
    const returnUrl = isInDashboard ? '/?view=teacher-topics' : '/teacher/topics';
    router.push(`/teacher/topics/new?return=${encodeURIComponent(returnUrl)}`);
  };

  const handleEdit = async (topicId: number) => {
    router.push(`/teacher/topics/${topicId}/edit`);
  };

  const handleDelete = (topicId: number) => {
    setTopicToDelete(topicId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (topicToDelete === null) return;

    try {
      setIsDeleting(true);
      await deleteTopic(topicToDelete);
      await loadTopics();
      setShowDeleteConfirm(false);
      setTopicToDelete(null);
      toast({
        title: "Tópico eliminado",
        description: "El tópico fue eliminado correctamente.",
        variant: "success",
      });
    } catch (error) {
      console.error("Error deleting topic:", error);
      toast({
        title: "Error",
        description: "Error al eliminar el tópico",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setTopicToDelete(null);
  };

  // Función para renderizar la previsualización del layout
  const renderTopicPreview = (topic: Topic) => {
    if (!topic.content?.blocksJson) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted/30">
          <FileText className="w-12 h-12 text-muted-foreground/40" />
        </div>
      );
    }

    try {
      const document = topic.content.blocksJson as unknown as ContentDocument;
      const gridCols = document.layout.columns;
      const gridRows = document.layout.rows;

      return (
        <div
          className="w-full h-full grid gap-1 p-2 bg-muted/20"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gridTemplateRows: `repeat(${gridRows}, 1fr)`,
          }}
        >
          {document.layout.areas.map((area) => (
            <div
              key={area.id}
              className="bg-card border border-border/50 rounded-sm"
              style={{
                gridColumn: area.gridColumn,
                gridRow: area.gridRow,
              }}
            />
          ))}
        </div>
      );
    } catch {
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted/30">
          <FileText className="w-12 h-12 text-muted-foreground/40" />
        </div>
      );
    }
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Mis Tópicos
              </h1>
              <p className="text-muted-foreground text-lg">
                Gestiona y organiza tus tópicos de contenido
              </p>
            </div>
            <Button
              onClick={handleCreateNew}
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear Tópico
            </Button>
          </div>
        </div>

        {/* Grid de tópicos */}
        {topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">
              No hay tópicos aún
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              Comienza creando tu primer tópico. Los tópicos son unidades
              modulares de contenido que puedes reutilizar en diferentes cursos.
            </p>
            <Button
              onClick={handleCreateNew}
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear Primer Tópico
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Preview del layout */}
                <div className="aspect-video bg-muted/50 border-b border-border relative overflow-hidden">
                  {renderTopicPreview(topic)}
                  
                  {/* Overlay con acciones */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(topic.id)}
                      className="shadow-lg"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>

                {/* Información del tópico */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground text-lg line-clamp-2 flex-1 pr-2">
                      {topic.name}
                    </h3>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(topic.id)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(topic.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {topic.content?.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {topic.content.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {topic.createdAt
                        ? new Date(topic.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        : "Hoy"}
                    </div>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                      Contenido
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    ¿Eliminar tópico?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Esta acción no se puede deshacer. El tópico y todo su
                    contenido serán eliminados permanentemente.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
