"use client"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, ChevronUp, ChevronDown, Loader2, BookOpen, FileText } from "lucide-react"
import { TopicPreview } from "@/components/teacher"
import { useToast } from "@/hooks/use-toast"
import { getAllTopics, getTopicById } from "@/services/topics"
import { Loading } from "@/components/ui/loading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import {
  getLessonTopics,
  associateTopicToLesson,
  dissociateTopicFromLesson,
  updateTopicOrder,
  type Lesson,
  type LessonTopic
} from "@/services/lessons"
import type { Topic } from "@/types/topic"

interface ManageLessonTopicsProps {
  lesson: Lesson;
  onBack: () => void;
}

export function ManageLessonTopics({ lesson }: ManageLessonTopicsProps) {
  // Estado para el preview de tópico
  const [previewTopic, setPreviewTopic] = useState<null | LessonTopic>(null);
  const [previewTopicData, setPreviewTopicData] = useState<Topic | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  // Cargar datos completos del tópico al abrir el preview
  useEffect(() => {
    if (previewTopic) {
      setPreviewLoading(true);
      setPreviewError(null);
      setPreviewTopicData(null);
      getTopicById(previewTopic.topic.id)
        .then(topic => setPreviewTopicData(topic))
        .catch(() => setPreviewError('No se pudo cargar el tópico.'))
        .finally(() => setPreviewLoading(false));
    } else {
      setPreviewTopicData(null);
      setPreviewLoading(false);
      setPreviewError(null);
    }
  }, [previewTopic]);
  const { toast } = useToast()
  const [associatedTopics, setAssociatedTopics] = useState<LessonTopic[]>([])
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [lessonTopicsData, allTopics] = await Promise.all([
        getLessonTopics(lesson.id),
        getAllTopics()
      ])

      // Ordenar topics asociados por el campo 'order'
      const sorted = lessonTopicsData.sort((a, b) => (a.order || 0) - (b.order || 0))
      setAssociatedTopics(sorted)

      // El backend ya devuelve solo los disponibles, no necesitamos filtrar
      setAvailableTopics(allTopics)
    } catch (error: unknown) {
      console.error("Error loading topics:", error)
    } finally {
      setLoading(false)
    }
  }, [lesson.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAssociateTopic = async (topicId: number) => {
    try {
      setProcessing(true)
      const nextOrder = associatedTopics.length > 0 
        ? Math.max(...associatedTopics.map(t => t.order || 0)) + 1 
        : 0

      await associateTopicToLesson(lesson.id, topicId, nextOrder)
      
      await loadData()
    } catch (error: unknown) {
      console.error("Error associating topic:", error)
      toast({
        title: "Error",
        description: "No se pudo asociar el tópico",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const [showDissociateDialog, setShowDissociateDialog] = useState(false);
  const [topicToDissociate, setTopicToDissociate] = useState<number | null>(null);

  const handleDissociateTopic = (topicId: number) => {
    setTopicToDissociate(topicId);
    setShowDissociateDialog(true);
  };

  const confirmDissociate = async () => {
    if (topicToDissociate === null) return;
    try {
      setProcessing(true);
      await dissociateTopicFromLesson(lesson.id, topicToDissociate);
      await loadData();
      setShowDissociateDialog(false);
      setTopicToDissociate(null);
    } catch (error: unknown) {
      console.error("Error dissociating topic:", error);
      toast({
        title: "Error",
        description: "No se pudo desasociar el tópico",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const cancelDissociate = () => {
    setShowDissociateDialog(false);
    setTopicToDissociate(null);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return

    try {
      setProcessing(true)
      const current = associatedTopics[index]
      const above = associatedTopics[index - 1]

      // Intercambiar órdenes
      await Promise.all([
        updateTopicOrder(lesson.id, current.topicId, above.order || 0),
        updateTopicOrder(lesson.id, above.topicId, current.order || 0)
      ])

      // Actualizar estado local
      const newTopics = [...associatedTopics]
      newTopics[index] = { ...current, order: above.order || 0 }
      newTopics[index - 1] = { ...above, order: current.order || 0 }
      setAssociatedTopics(newTopics.sort((a, b) => (a.order || 0) - (b.order || 0)))
    } catch (error: unknown) {
      console.error("Error reordering:", error)
      toast({
        title: "Error",
        description: "No se pudo reordenar los tópicos",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleMoveDown = async (index: number) => {
    if (index === associatedTopics.length - 1) return

    try {
      setProcessing(true)
      const current = associatedTopics[index]
      const below = associatedTopics[index + 1]

      // Intercambiar órdenes
      await Promise.all([
        updateTopicOrder(lesson.id, current.topicId, below.order || 0),
        updateTopicOrder(lesson.id, below.topicId, current.order || 0)
      ])

      // Actualizar estado local
      const newTopics = [...associatedTopics]
      newTopics[index] = { ...current, order: below.order || 0 }
      newTopics[index + 1] = { ...below, order: current.order || 0 }
      setAssociatedTopics(newTopics.sort((a, b) => (a.order || 0) - (b.order || 0)))
    } catch (error: unknown) {
      console.error("Error reordering:", error)
      toast({
        title: "Error",
        description: "No se pudo reordenar los tópicos",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
        <Loading size="sm" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Columna izquierda: Tópicos asociados */}
  <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Tópicos en esta Lección
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {associatedTopics.length} tópico{associatedTopics.length !== 1 ? 's' : ''} asociado{associatedTopics.length !== 1 ? 's' : ''}
          </p>
        </CardHeader>
        <CardContent>
          {associatedTopics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No hay tópicos asociados aún.</p>
              <p className="text-xs mt-1">Agrega tópicos desde la lista disponible →</p>
            </div>
          ) : (
            <div className="space-y-2">
              {associatedTopics.map((lessonTopic, index) => (
                <div
                  key={lessonTopic.id}
                  className={
                    `group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ` +
                    `hover:translate-y-[-4px] hover:shadow-xl hover:border-primary/60 cursor-pointer`
                  }
                  style={{ animationDelay: `${index * 40}ms` }}
                  onClick={() => setPreviewTopic(lessonTopic)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Ver tópico ${lessonTopic.topic.name}`}
                >
                  <div className="flex items-center gap-3 p-4 md:p-5">
                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded self-start mt-1">
                      #{index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base truncate mb-0.5">
                        {lessonTopic.topic.name}
                      </h4>
                      {lessonTopic.topic.content?.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {lessonTopic.topic.content.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 items-end" onClick={e => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0 || processing}
                        tabIndex={-1}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === associatedTopics.length - 1 || processing}
                        tabIndex={-1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDissociateTopic(lessonTopic.topicId)}
                        disabled={processing}
                        title="Desasociar tópico"
                        tabIndex={-1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para TopicPreview */}
      <Dialog open={!!previewTopic} onOpenChange={open => { if (!open) setPreviewTopic(null) }}>
  <DialogContent className="w-full max-w-2xl md:max-w-4xl p-0 bg-background rounded-2xl shadow-xl overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
    <DialogTitle className="sr-only">Vista previa de tópico</DialogTitle>
    {/* Elimina grow y overflow-y-auto para que el Dialog se adapte al contenido */}
    <div>
      {previewLoading && (
        <Loading size="sm" />
      )}
      {previewError && (
        <div className="p-8 text-center text-destructive">{previewError}</div>
      )}
      {!previewLoading && !previewError && previewTopicData && (
        <TopicPreview
          topic={previewTopicData}
          onClose={() => setPreviewTopic(null)}
          hideFooter
        />
      )}
    </div>
  </DialogContent>
      </Dialog>

      {/* Columna derecha: Catálogo de tópicos disponibles */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Catálogo de Tópicos
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {availableTopics.length} tópico{availableTopics.length !== 1 ? 's' : ''} disponible{availableTopics.length !== 1 ? 's' : ''}
          </p>
        </CardHeader>
        <CardContent>
          {availableTopics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No hay más tópicos disponibles.</p>
              <p className="text-xs mt-1">Todos los tópicos ya están asociados.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {availableTopics.map((topic, index) => (
                <div
                  key={topic.id}
                  className={
                    `group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ` +
                    `hover:translate-y-[-4px] hover:shadow-xl hover:border-primary/60`
                  }
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className="flex items-center gap-3 p-4 md:p-5">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base truncate mb-0.5">
                        {topic.name}
                      </h4>
                      {topic.content?.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {topic.content.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {topic.type}
                        </span>
                        {topic.content?.resources && topic.content.resources.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {topic.content.resources.length} recurso{topic.content.resources.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="shrink-0"
                      onClick={() => handleAssociateTopic(topic.id)}
                      disabled={processing}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    {/* Dialog de confirmación para desasociar tópico */}
    <Dialog open={showDissociateDialog} onOpenChange={setShowDissociateDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Desasociar este tópico de la lección?</DialogTitle>
          <DialogDescription>
            Esta acción solo quitará el tópico de la lección, pero no lo eliminará del sistema.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={cancelDissociate} disabled={processing}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={confirmDissociate} disabled={processing}>
            {processing ? "Desasociando..." : "Desasociar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  )
}