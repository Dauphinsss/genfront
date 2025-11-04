"use client"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, ChevronUp, ChevronDown, BookOpen, FileText } from "lucide-react"
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
  const [previewTopic, setPreviewTopic] = useState<null | LessonTopic>(null);
  const [previewTopicData, setPreviewTopicData] = useState<Topic | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
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

      const sorted = lessonTopicsData.sort((a, b) => (a.order || 0) - (b.order || 0))
      setAssociatedTopics(sorted)

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

      await Promise.all([
        updateTopicOrder(lesson.id, current.topicId, above.order || 0),
        updateTopicOrder(lesson.id, above.topicId, current.order || 0)
      ])

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

      await Promise.all([
        updateTopicOrder(lesson.id, current.topicId, below.order || 0),
        updateTopicOrder(lesson.id, below.topicId, current.order || 0)
      ])

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
    return <Loading size="sm" />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="glass" className="animate-in fade-in-50 slide-in-from-left-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5" />
              Tópicos en esta Lección
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {associatedTopics.length} tópico{associatedTopics.length !== 1 ? 's' : ''} asociado{associatedTopics.length !== 1 ? 's' : ''}
            </p>
          </CardHeader>
          <CardContent>
            {associatedTopics.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground animate-in fade-in-50">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No hay tópicos asociados aún.</p>
                <p className="text-xs mt-1">Agrega tópicos desde la lista disponible →</p>
              </div>
            ) : (
              <div className="space-y-2">
                {associatedTopics.map((lessonTopic, index) => (
                  <Card
                    key={lessonTopic.id}
                    variant="interactive"
                    className="group cursor-pointer transition-all duration-200 hover:shadow-lg"
                    onClick={() => setPreviewTopic(lessonTopic)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Ver tópico ${lessonTopic.topic.name}`}
                  >
                    <CardContent className="flex items-center gap-3 p-4 animate-in fade-in-50" style={{ animationDelay: `${index * 30}ms` }}>
                      <span className="text-xs font-mono bg-muted px-2 py-1 rounded shrink-0">
                        #{index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">
                          {lessonTopic.topic.name}
                        </h4>
                        {lessonTopic.topic.content?.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {lessonTopic.topic.content.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0 || processing}
                          tabIndex={-1}
                          title="Mover arriba"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === associatedTopics.length - 1 || processing}
                          tabIndex={-1}
                          title="Mover abajo"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDissociateTopic(lessonTopic.topicId)}
                          disabled={processing}
                          title="Desasociar tópico"
                          tabIndex={-1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="glass" className="animate-in fade-in-50 slide-in-from-right-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5" />
              Catálogo de Tópicos
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {availableTopics.length} tópico{availableTopics.length !== 1 ? 's' : ''} disponible{availableTopics.length !== 1 ? 's' : ''}
            </p>
          </CardHeader>
          <CardContent>
            {availableTopics.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground animate-in fade-in-50">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No hay más tópicos disponibles.</p>
                <p className="text-xs mt-1">Todos los tópicos ya están asociados.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {availableTopics.map((topic, index) => (
                  <Card
                    key={topic.id}
                    variant="interactive"
                    className="group transition-all duration-200 hover:shadow-lg"
                  >
                    <CardContent className="flex items-center gap-3 p-4 animate-in fade-in-50" style={{ animationDelay: `${index * 30}ms` }}>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">
                          {topic.name}
                        </h4>
                        {topic.content?.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!previewTopic} onOpenChange={open => { if (!open) setPreviewTopic(null) }}>
        <DialogContent className="w-full max-w-2xl md:max-w-4xl p-0 bg-background rounded-2xl shadow-xl overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
          <DialogTitle className="sr-only">Vista previa de tópico</DialogTitle>
          <div>
            {previewLoading && (
              <div className="p-8">
                <Loading size="sm" />
              </div>
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