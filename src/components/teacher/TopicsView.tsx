"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Calendar, FileText, Trash2, Loader2 } from "lucide-react";
import { TopicEditor } from "./TopicEditor";
import { CreateTopicModal } from "./CreateTopicModal";
import type { Topic, CreateTopicDto } from "@/types/topic";
import { getAllTopics, deleteTopic } from "@/services/topics";

export function TopicsView() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | undefined>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNewTopic, setIsNewTopic] = useState(false);

  // Cargar topics al montar
  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setIsLoading(true);
      const data = await getAllTopics("content"); // Solo mostrar tipo content
      setTopics(data);
    } catch (error) {
      console.error("Error loading topics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (data: CreateTopicDto & { description?: string }) => {
    // Crear un tópico "vacío" con placeholder en htmlContent
    const tempTopic: Topic = {
      id: 0,
      name: data.name,
      type: data.type,
      createdAt: new Date().toISOString(),
      content: {
      id: 0,
      topicId: 0,
      description: data.description || '',
      htmlContent: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resources: []
      }
    };

    setEditingTopic(tempTopic);
    setIsNewTopic(true);
    setIsEditing(true);
  };

  const handleEdit = async (topic: Topic) => {
    try {
      const { getTopicById } = await import("@/services/topics");
      const fullTopic = await getTopicById(topic.id);
      setEditingTopic(fullTopic);
      setIsNewTopic(false);
      setIsEditing(true);
    } catch (error) {
      console.error("Error loading topic:", error);
      alert("Error al cargar el tópico");
    }
  };

  const handleSave = async () => {
    // Recargar la lista después de guardar
    await loadTopics();
    setIsEditing(false);
    setEditingTopic(undefined);
    setIsNewTopic(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingTopic(undefined);
    setIsNewTopic(false);
  };

  const handleDelete = (topicId: number, event: React.MouseEvent) => {
    event.stopPropagation();
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
    } catch (error) {
      console.error("Error deleting topic:", error);
      alert("Error al eliminar el tópico");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setTopicToDelete(null);
  };

  if (isEditing) {
    return (
      <TopicEditor 
        topic={editingTopic}
        isNewTopic={isNewTopic}
        onSave={handleSave} 
        onCancel={handleCancel} 
      />
    );
  }

  return (
    <>
      <CreateTopicModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header con botón de crear */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Tópicos</h1>
            <p className="text-muted-foreground">Crea y administra tópicos modulares para tus cursos</p>
          </div>
          <Button 
            onClick={handleCreateNew}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Tópico
          </Button>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : topics.length === 0 ? (
        // Estado vacío
        <Card className="border border-border/50 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No hay tópicos aún
            </h3>
            
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Los tópicos son unidades modulares de contenido que puedes reutilizar en diferentes cursos. 
              Comienza creando tu primer tópico.
            </p>

            <Button 
              onClick={handleCreateNew}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Tópico
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Grid de cards de tópicos
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <Card 
              key={topic.id}
              className="border border-border/50 hover:border-border transition-colors cursor-pointer group"
              onClick={() => handleEdit(topic)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground">
                      Contenido
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => handleDelete(topic.id, e)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                  {topic.name}
                </h3>
                
                {topic.content?.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {topic.content.description}
                  </p>
                )}
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {topic.createdAt ? new Date(topic.createdAt).toLocaleDateString() : 'Hoy'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>

      {/* Modal de confirmación personalizado */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    ¿Eliminar tópico?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Esta acción no se puede deshacer. El tópico y todo su contenido serán eliminados permanentemente.
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
                    'Eliminar'
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
