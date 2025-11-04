"use client";
import { useEffect, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLessonTopics } from "@/services/lessons";
import { getTopicById } from "@/services/topics";
import { Topic } from "../../types/topic";
import type { LessonTopic } from "@/services/lessons";
import { ContentPreview } from "../teacher/ContentPreview";
import type { ContentDocument } from "@/types/content-blocks";
import { Loading } from "../ui/loading";

export type Lesson = {
  id: number;
  title: string;
  description?: string;
};
export type Unit = {
  id: number;
  title: string;
  lessons?: Lesson[];
};
export type CourseData = {
  id: number;
  title: string;
  units?: Unit[];
};

type Props = {
  course: CourseData;
  initialUnitIndex?: number;
  initialLessonIndex?: number;
};

export default function CourseBaseViewer({ course, initialUnitIndex = 0, initialLessonIndex = 0 }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 1024);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);
  const [currentUnitIndex, setCurrentUnitIndex] = useState(initialUnitIndex);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(initialLessonIndex);
  const [lessonTopics, setLessonTopics] = useState<LessonTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<LessonTopic | null>(null);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicContent, setTopicContent] = useState<Topic | null>(null);
  const [topicLoading, setTopicLoading] = useState(false);
  const [topicError, setTopicError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopics() {
      if (!course.units || !course.units.length) return;
      const currentUnit = course.units[currentUnitIndex];
      const currentLesson = currentUnit?.lessons?.[currentLessonIndex];
      if (!currentLesson) {
        setLessonTopics([]);
        setSelectedTopic(null);
        return;
      }
      setTopicsLoading(true);
      setSelectedTopic(null);
      setTopicContent(null);
      setTopicError(null);
      try {
        let topics = await getLessonTopics(currentLesson.id);
        topics = topics.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setLessonTopics(topics);
        if (topics.length > 0) {
          setSelectedTopic(topics[0]);
        } else {
          setSelectedTopic(null);
        }
      } catch {
        setLessonTopics([]);
        setSelectedTopic(null);
      } finally {
        setTopicsLoading(false);
      }
    }
    fetchTopics();
  }, [course, currentUnitIndex, currentLessonIndex]);

  useEffect(() => {
    if (!selectedTopic) {
      setTopicContent(null);
      setTopicError(null);
      setTopicLoading(false);
      return;
    }
    setTopicLoading(true);
    setTopicError(null);
    setTopicContent(null);
    getTopicById(selectedTopic.topic.id)
      .then(topic => setTopicContent(topic))
      .catch(() => setTopicError("No se pudo cargar el tópico."))
      .finally(() => setTopicLoading(false));
  }, [selectedTopic]);

  function goToNextLesson() {
    if (!course.units || !course.units.length) return;
    const currentUnit = course.units?.[currentUnitIndex];
    if (!currentUnit || !currentUnit.lessons) return;
    if (currentLessonIndex < currentUnit.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      return;
    }
    if (course.units && currentUnitIndex < course.units.length - 1) {
      setCurrentUnitIndex(currentUnitIndex + 1);
      setCurrentLessonIndex(0);
      return;
    }
  }
  function goToPreviousLesson() {
    if (!course.units || !course.units.length) return;
    let u = currentUnitIndex;
    let l = currentLessonIndex - 1;
    if (l < 0) {
      if (u > 0) {
        u = u - 1;
        l = (course.units?.[u]?.lessons?.length ?? 1) - 1;
      } else return;
    }
    while (u >= 0) {
      const unit = course.units?.[u];
      if (!unit) return;
      while (l >= 0) {
        const lesson = unit.lessons?.[l];
        if (lesson) {
          setCurrentUnitIndex(u);
          setCurrentLessonIndex(l);
          return;
        }
        l--;
      }
      u--;
      if (u >= 0) l = (course.units?.[u]?.lessons?.length ?? 1) - 1;
    }
  }

  const closeSidebarModal = () => {
    setShowSidebarMobile(false);
  };

  if (!course.units || !course.units.length) {
    return <div className="min-h-screen flex items-center justify-center">SIN CONTENIDO</div>;
  }

  const currentUnit = course.units[currentUnitIndex];
  const currentLesson = currentUnit?.lessons?.[currentLessonIndex];
  const Sidebar = ({ inDialog = false }: { inDialog?: boolean }) => (
    <Card
      className={[
        inDialog ? "w-full" : "w-full md:w-60 lg:w-72",
        "max-h-[80vh] border border-border/50 bg-background shadow-lg rounded-lg flex flex-col",
      ].join(' ')}
    >
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xl font-semibold text-foreground truncate">{course.title}</div>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goToPreviousLesson} 
            disabled={currentUnitIndex === 0 && currentLessonIndex === 0}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 px-2 min-w-0 text-center">
            <div className="text-xs text-muted-foreground font-medium mb-1 truncate">{currentUnit?.title}</div>
            <div className="text-sm text-foreground truncate font-semibold">{currentLesson?.title}</div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goToNextLesson} 
            disabled={!course.units || currentUnitIndex === course.units.length - 1 && currentLesson && currentLessonIndex === (currentUnit?.lessons?.length ?? 0) - 1}
            className="h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(80vh - 144px)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Tópicos de la lección</h2>
            {lessonTopics.length > 0 && (
              <Badge variant="outline" className="border-primary/30 text-xs text-primary">
                {lessonTopics.length}
              </Badge>
            )}
          </div>
          {topicsLoading ? (
            <Loading
              size="sm"
            />
          ) : lessonTopics.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No hay tópicos asociados
            </div>
          ) : (
            <ul className="space-y-2">
              {lessonTopics.map((topic, index) => (
                <li
                  key={topic.id}
                  className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 animate-in fade-in-50 ${
                    selectedTopic?.id === topic.id 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-muted/50 border border-transparent hover:border-border"
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                  onClick={() => setSelectedTopic(topic)}
                >
                  <span className="font-medium text-sm text-foreground block truncate">
                    {topic.topic.name}
                  </span>
                  {topic.topic.content?.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {topic.topic.content.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        {isMobile && inDialog && (
          <div className="p-4 border-t border-border flex justify-end">
            <Button variant="outline" size="sm" onClick={closeSidebarModal}>
              Cerrar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={`flex flex-col ${!isMobile ? 'lg:flex-row' : ''} bg-background text-foreground min-h-screen lg:h-screen max-w-6xl mx-auto`}>
      {isMobile && (
        <div className="w-full sticky top-0 z-20 bg-background border-b border-border px-4 py-3">
          <button
            className="w-full text-lg font-semibold truncate text-left focus:outline-none hover:text-primary transition-colors"
            onClick={() => setShowSidebarMobile(true)}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            {selectedTopic ? selectedTopic.topic.name : 'Selecciona un tópico'}
          </button>
        </div>
      )}
      <main className="flex-1 flex flex-col p-4 sm:p-8 transition-all duration-200 w-full">
        {!isMobile && (
          <div className="mb-6 animate-in fade-in-50">
            <div className="text-sm font-medium text-muted-foreground mb-1">{currentUnit?.title}</div>
            <h1 className="text-2xl font-semibold text-foreground">{currentLesson?.title}</h1>
          </div>
        )}
        {selectedTopic ? (
          <Card 
            variant="glass" 
            className="mb-6 animate-in fade-in-50 slide-in-from-bottom-2"
          >
            <CardContent className="py-6">
              {isMobile && (
                <h3 className="text-lg font-semibold mb-4 text-foreground">{selectedTopic.topic.name}</h3>
              )}
              {topicLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : topicError ? (
                <div className="text-destructive text-center py-8">{topicError}</div>
              ) : (() => {
                // Verificar la estructura del contenido
                const contentData = topicContent?.content?.blocksJson;
                
                // Verificar si blocksJson tiene la estructura de ContentDocument
                if (contentData && typeof contentData === 'object' && !Array.isArray(contentData) && 'blocks' in contentData) {
                  return <ContentPreview document={contentData as ContentDocument} />;
                }
                
                return <div className="text-muted-foreground text-center py-8">Sin contenido disponible</div>;
              })()
              }
            </CardContent>
          </Card>
        ) : (
          <Card 
            variant="dashed" 
            className="mb-6 animate-in fade-in-50 slide-in-from-bottom-2"
          >
            <CardContent className="py-16 flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Selecciona un tópico para ver su contenido</span>
            </CardContent>
          </Card>
        )}
        {isMobile && (
          <div className="fixed bottom-0 left-0 w-full z-30 bg-background border-t border-border p-2">
            <Button
              className="w-full"
              variant="default"
              onClick={() => {
                if (!lessonTopics.length || !selectedTopic) return;
                const idx = lessonTopics.findIndex(t => t.id === selectedTopic.id);
                if (idx < lessonTopics.length - 1) {
                  setSelectedTopic(lessonTopics[idx + 1]);
                } else {
                  goToNextLesson();
                }
              }}
              disabled={!lessonTopics.length || !selectedTopic}
            >
              {selectedTopic && lessonTopics.findIndex(t => t.id === selectedTopic.id) < lessonTopics.length - 1 ? 'Siguiente' : 'Continuar'}
            </Button>
          </div>
        )}
      </main>
      {!isMobile && (
        <div className="hidden lg:flex flex-col h-full min-w-0 lg:min-w-[288px] lg:max-w-[288px] w-full p-4">
          <Sidebar />
        </div>
      )}
      {isMobile && showSidebarMobile && (
        <>
          <div
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={closeSidebarModal}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-background border border-border rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">Navegación</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeSidebarModal}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 60px)' }}>
                <Sidebar inDialog />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}