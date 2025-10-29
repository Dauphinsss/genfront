"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLessonTopics } from "@/services/lessons";
import { getTopicById } from "@/services/topics";
import type { LessonTopic } from "@/services/lessons";

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
  const [topicContent, setTopicContent] = useState<{ content?: { htmlContent?: string } } | null>(null);
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

  if (!course.units || !course.units.length) {
    return <div className="min-h-screen flex items-center justify-center">SIN CONTENIDO</div>;
  }

  const currentUnit = course.units[currentUnitIndex];
  const currentLesson = currentUnit?.lessons?.[currentLessonIndex];
  const Sidebar = ({ inDialog = false }: { inDialog?: boolean }) => (
    <Card
      className={[
        inDialog ? "w-full" : "w-full md:w-60 lg:w-72",
        "max-h-[80vh] border border-border/60 bg-card/80 shadow-sm rounded-none lg:rounded-l-2xl rounded-t-2xl flex flex-col",
      ].join(' ')}
    >
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl font-bold text-foreground truncate">{course.title}</div>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <Button variant="ghost" size="icon" onClick={goToPreviousLesson} disabled={currentUnitIndex === 0 && currentLessonIndex === 0}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 px-2 min-w-0 text-center">
            <div className="text-xs text-muted-foreground font-semibold mb-1 truncate">{currentUnit?.title}</div>
            <div className="text-sm text-foreground truncate font-bold">{currentLesson?.title}</div>
          </div>
          <Button variant="ghost" size="icon" onClick={goToNextLesson} disabled={!course.units || currentUnitIndex === course.units.length - 1 && currentLesson && currentLessonIndex === (currentUnit?.lessons?.length ?? 0) - 1}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(80vh - 144px)' }}>
          <h2 className="text-base font-semibold mb-2">Tópicos de la lección</h2>
          {topicsLoading ? (
            <div className="text-sm text-muted-foreground">Cargando tópicos…</div>
          ) : lessonTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay tópicos asociados.</p>
          ) : (
            <ul className="space-y-2">
              {lessonTopics.map(topic => (
                <li
                  key={topic.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedTopic?.id === topic.id ? "bg-primary/10" : "hover:bg-muted"}`}
                  onClick={() => setSelectedTopic(topic)}
                >
                  <span className="font-medium">{topic.topic.name}</span>
                  <p className="text-xs text-muted-foreground">{topic.topic.content?.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        {isMobile && inDialog && (
          <div className="p-4 border-t border-border flex justify-end">
            <Button variant="outline" onClick={() => setShowSidebarMobile(false)}>Cerrar</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={`flex flex-col ${!isMobile ? 'lg:flex-row' : ''} bg-background text-foreground min-h-screen lg:h-screen`}>
      {isMobile && (
        <div className="w-full sticky top-0 z-20 bg-background border-b border-border px-4 py-3">
          <button
            className="w-full text-lg font-bold truncate text-left focus:outline-none"
            onClick={() => setShowSidebarMobile(true)}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            {selectedTopic ? selectedTopic.topic.name : lessonTopics.length > 0 ? 'Sin tópico actual' : 'Sin tópico actual'}
          </button>
        </div>
      )}
  <main className="flex-1 flex flex-col p-4 sm:p-8 transition-all duration-200 lg:max-w-[700px] xl:max-w-[900px] 2xl:max-w-[1100px] mx-auto w-full">
        {!isMobile && (
          <div className="mb-6">
            <div className="text-xl font-bold text-muted-foreground mb-1">{currentUnit?.title}</div>
            <h1 className="text-3xl font-bold mb-0">{currentLesson?.title}</h1>
          </div>
        )}
        {selectedTopic ? (
          <Card className="mb-6 border border-border/60 bg-card/80 shadow-sm rounded-2xl animate-in fade-in slide-in-from-bottom-2">
            <CardContent className="py-6">
              {isMobile && (
                <h3 className="text-xl font-bold mb-4 text-foreground">{selectedTopic.topic.name}</h3>
              )}
              {topicLoading ? (
                <div className="text-muted-foreground">Cargando contenido…</div>
              ) : topicError ? (
                <div className="text-destructive">{topicError}</div>
              ) : topicContent ? (
                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: topicContent.content?.htmlContent || "<p>Sin contenido disponible</p>" }}
                />
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 border border-border/60 bg-card/80 shadow-sm rounded-2xl animate-in fade-in slide-in-from-bottom-2">
            <CardContent className="py-16 flex items-center justify-center">
              <span className="text-muted-foreground text-lg">Selecciona un tópico para ver su contenido.</span>
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
        <div className="hidden lg:flex flex-col h-full min-w-0 lg:min-w-[288px] lg:max-w-[288px] w-full">
          <Sidebar />
        </div>
      )}
      {isMobile && (
        <Dialog open={showSidebarMobile} onOpenChange={setShowSidebarMobile}>
          <DialogContent
            className="p-0 w-full bg-background rounded-2xl shadow-xl overflow-hidden flex flex-col sm:max-w-md"
            style={{ maxHeight: '90dvh', height: 'fit-content' }}
          >
            <DialogTitle asChild>
              <VisuallyHidden>Navegación de lecciones y tópicos</VisuallyHidden>
            </DialogTitle>
            <DialogDescription asChild>
              <VisuallyHidden>Usa este diálogo para navegar entre lecciones y tópicos del curso.</VisuallyHidden>
            </DialogDescription>
            <Sidebar inDialog />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}