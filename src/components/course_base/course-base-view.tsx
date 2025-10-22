"use client";
import { useEffect, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLessonTopics } from "@/services/lessons";
import { getTopicById } from "@/services/topics";
import type { LessonTopic } from "@/services/lessons";
import { getActiveCourseBase } from "@/services/courseBase";

type Lesson = {
  id: number;
  title: string;
  description?: string;
};
type Unit = {
  id: number;
  title: string;
  lessons?: Lesson[];
};
type CourseData = {
  id: number;
  title: string;
  units?: Unit[];
};

export default function CourseBaseView() {
  const [course, setCourse] = useState<CourseData>({ id: 0, title: "", units: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [lessonTopics, setLessonTopics] = useState<LessonTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<LessonTopic | null>(null);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicContent, setTopicContent] = useState<{ content?: { htmlContent?: string } } | null>(null);
  const [topicLoading, setTopicLoading] = useState(false);
  const [topicError, setTopicError] = useState<string | null>(null);

  // Cargar curso activo completo
  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      setError(null);
      try {
        const data = await getActiveCourseBase();
  const safeUnits = (data.units ?? []).map((u: Unit) => ({
          ...u,
          lessons: u.lessons ?? [],
        }));
        setCourse({ id: data.id, title: data.title, units: safeUnits });
        let uIdx = 0, lIdx = 0;
        outer: for (let i = 0; i < safeUnits.length; i++) {
          if ((safeUnits[i].lessons?.length ?? 0) > 0) {
            uIdx = i; lIdx = 0; break outer;
          }
        }
        setCurrentUnitIndex(uIdx);
        setCurrentLessonIndex(lIdx);
      } catch {
        setError("No se pudo cargar el curso desde el backend.");
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, []);

  // Cargar tópicos asociados a la lección actual usando el endpoint y ordenarlos por 'order'
  useEffect(() => {
    async function fetchTopics() {
      if (!course.units || !course.units.length) return;
      const currentUnit = course.units[currentUnitIndex];
      const currentLesson = currentUnit?.lessons?.[currentLessonIndex];
      if (!currentLesson) {
        setLessonTopics([]);
        return;
      }
      setTopicsLoading(true);
      setSelectedTopic(null);
      setTopicContent(null);
      setTopicError(null);
      try {
        let topics = await getLessonTopics(currentLesson.id);
        // Ordenar por 'order' ascendente
        topics = topics.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setLessonTopics(topics);
      } catch {
        setLessonTopics([]);
      } finally {
        setTopicsLoading(false);
      }
    }
    fetchTopics();
  }, [course, currentUnitIndex, currentLessonIndex]);

  // Cargar el contenido completo del tópico seleccionado (como en edición)
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

  // Navegación tipo Khan Academy
  function goToNextLesson() {
    if (!course.units || !course.units.length) return;
    const currentUnit = course.units[currentUnitIndex];
    if (!currentUnit || !currentUnit.lessons) return;
    if (currentLessonIndex < currentUnit.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      return;
    }
    if (currentUnitIndex < course.units.length - 1) {
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
        l = (course.units[u].lessons?.length ?? 1) - 1;
      } else return;
    }
    while (u >= 0) {
      const unit = course.units[u];
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
      if (u >= 0) l = (course.units[u].lessons?.length ?? 1) - 1;
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando curso…</div>;
  }
  if (error || !course.units || !course.units.length) {
    return <div className="min-h-screen flex items-center justify-center">{error || "SIN CONTENIDO"}</div>;
  }

  const currentUnit = course.units[currentUnitIndex];
  const currentLesson = currentUnit?.lessons?.[currentLessonIndex];

  // Sidebar a la derecha (estilo Card, colores naturales)
  const Sidebar = (
    <Card className="w-full lg:w-96 max-h-[80vh] border border-border/60 bg-card/80 shadow-sm rounded-none rounded-l-2xl flex flex-col">
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground font-semibold truncate">{course.title}</div>
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
          <Button variant="ghost" size="icon" onClick={goToNextLesson} disabled={currentUnitIndex === course.units.length - 1 && currentLesson && currentLessonIndex === (currentUnit?.lessons?.length ?? 0) - 1}>
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
      </CardContent>
    </Card>
  );

  // Contenido principal a la izquierda
  return (
    <div className="flex flex-col lg:flex-row bg-background text-foreground min-h-screen lg:h-screen">
            <main className="flex-1 flex flex-col p-8">
        <div className="mb-6">
          <div className="text-xs text-muted-foreground mb-1">{currentUnit?.title}</div>
          <h1 className="text-2xl font-bold mb-0">{currentLesson?.title}</h1>
        </div>
        {selectedTopic ? (
          <Card className="mb-6 border border-border/60 bg-card/80 shadow-sm rounded-2xl animate-in fade-in slide-in-from-bottom-2">
            <CardContent className="py-6">
              <h3 className="text-xl font-bold mb-4 text-foreground">{selectedTopic.topic.name}</h3>
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
      </main>
      {/* Sidebar a la derecha */}
      <div className="w-full lg:w-96 flex flex-col">
        {Sidebar}
      </div>
    </div>
  );
}