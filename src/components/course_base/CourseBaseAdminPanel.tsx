"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { ArrowLeft, BookOpen, Copy, History } from "lucide-react";
import CourseBaseEdit from "./course-base-units";
import CourseBaseViewer, { CourseData } from "./CourseBaseViewer";
import { getCourseBaseById } from "@/services/courseBase";
import {
  getActiveCourse,
  getInactiveCourse,
  getHistoricCourses,
  cloneActiveCourse,
  activateInactiveCourse,
  type AdminCourseBase
} from "@/services/adminCourseBase";
import type { Unit } from "@/services/units";
import { useToast } from "@/hooks/use-toast";

type CourseBase = AdminCourseBase;

export default function CourseBaseAdminPanel() {
  const { toast } = useToast();
  const [historicMode, setHistoricMode] = useState<null | { courses: CourseBase[]; selected?: CourseBase }>(null);
  const [historicView, setHistoricView] = useState<{ course: CourseData } | null>(null);
  const [activeCourse, setActiveCourse] = useState<CourseBase | null>(null);
  const [inactiveCourse, setInactiveCourse] = useState<CourseBase | null>(null);
  const [historicCourses, setHistoricCourses] = useState<CourseBase[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<null | { id: number; status: string }>(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const [active, inactive, historics] = await Promise.all([
        getActiveCourse(),
        getInactiveCourse(),
        getHistoricCourses(),
      ]);
      setActiveCourse(active);
      setInactiveCourse(inactive);
      setHistoricCourses(historics);
    } catch {
      setError("No se pudieron cargar los cursos base.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchCourses(); }, []);

  const handleEdit = (course: CourseBase) => {
    if (course.status === 'activo' || course.status === 'inactivo') {
      setEditMode({ id: course.id, status: course.status });
    }
  };
  const handleClone = async () => {
    setActionLoading(true);
    try {
      await cloneActiveCourse();
      await fetchCourses();
      toast({
        title: "Copia creada",
        description: "Se creó la copia del curso activo correctamente.",
        variant: "success",
      });
    } catch (e: unknown) {
      let errorMsg = "No se pudo clonar el curso activo. ¿Ya existe un curso inactivo?";
      if (typeof e === "object" && e !== null && "response" in e) {
        const err = e as { response?: { data?: { message?: string } } };
        errorMsg = err.response?.data?.message || errorMsg;
      }
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };
  const handleActivate = async () => {
    setActionLoading(true);
    try {
      await activateInactiveCourse();
      await fetchCourses();
      toast({
        title: "Curso activado",
        description: "El curso inactivo fue activado correctamente.",
        variant: "success",
      });
    } catch (e: unknown) {
      let errorMsg = "No se pudo activar el curso inactivo. ¿Existe uno inactivo?";
      if (typeof e === "object" && e !== null && "response" in e) {
        const err = e as { response?: { data?: { message?: string } } };
        errorMsg = err.response?.data?.message || errorMsg;
      }
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };
  const handleViewHistorics = () => {
    setHistoricMode({ courses: historicCourses });
  };

  if (loading) {
    return <Loading />;
  }
  if (historicView) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <Button 
            variant="default" 
            size="lg"
            onClick={() => { setHistoricView(null); setHistoricMode(h => h ? { courses: h.courses } : null); }}
            className="mb-4"
            >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
        </Button>
        <CourseBaseViewer course={historicView.course} />
      </div>
    );
  }

  if (historicMode) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <Button 
            variant="default" 
            size="lg"
            onClick={() => setHistoricMode(null)} 
            className="mb-4"
            >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
        </Button>
        <Card className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur">
          <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 animate-pulse" />
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                <History className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl">Cursos Históricos</CardTitle>
                <CardDescription>Selecciona un curso histórico para visualizarlo</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
        <div className="flex flex-wrap justify-center gap-6">
          {historicMode.courses.length === 0 ? (
            <Card className="w-full max-w-xs"><CardContent className="py-8 text-center">No hay cursos históricos.</CardContent></Card>
          ) : (
            historicMode.courses.map((course) => (
              <Card
                key={course.id}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl cursor-pointer w-full max-w-xs"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const data = await getCourseBaseById(course.id);
                    const safeUnits: Unit[] = (data.units ?? []).map((u: unknown) => {
                      if (typeof u === 'object' && u !== null && 'lessons' in u) {
                        const unit = u as Unit;
                        return { ...unit, lessons: unit.lessons ?? [] };
                      }
                      return u as Unit;
                    });
                    setHistoricView({ course: { id: data.id, title: data.title, units: safeUnits } });
                  } catch {
                    toast({ title: "Error", description: "No se pudo cargar el curso histórico.", variant: "destructive" });
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CardContent className="flex flex-col items-center gap-4 p-6 animate-in fade-in slide-in-from-bottom-2">
                  <History className="w-10 h-10 text-primary mb-2" />
                  <div className="text-center font-semibold text-foreground text-lg">{course.title}</div>
                  <span className="mt-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Histórico</span>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  if (editMode) {
    return <CourseBaseEdit courseId={editMode.id} status={editMode.status} onBack={(wasUpdated?: boolean) => {
      setEditMode(null);
      if (wasUpdated) {
        fetchCourses();
      }
    }} />;
  }

  return (
    loading ? <Loading /> : (
      <div className="space-y-8 max-w-6xl mx-auto">
        <Card className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur">
          <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 animate-pulse" />
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl">Gestión de Curso Base</CardTitle>
                <CardDescription>Administra el curso base activo, inactivo e históricos</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-stretch w-full">
          <Button
            variant="default"
            className="rounded-xl px-8 py-3 font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
            onClick={handleClone}
            disabled={actionLoading || !!inactiveCourse}
          >
            Crear copia del curso
          </Button>
          {inactiveCourse && (
            <Button
              variant="default"
              size="lg"
              className="rounded-xl px-8 py-3 font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
              onClick={handleActivate}
              disabled={actionLoading}
            >
              Activar curso inactivo
            </Button>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {historicCourses.length > 0 && (
            <Card
              key="historic"
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl cursor-pointer w-full max-w-xs"
              onClick={handleViewHistorics}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardContent className="flex flex-col items-center gap-4 p-6 animate-in fade-in slide-in-from-bottom-2">
                <History className="w-10 h-10 text-primary mb-2" />
                <div className="text-center font-semibold text-foreground text-lg">Cursos Históricos</div>
                <span className="mt-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Históricos</span>
              </CardContent>
            </Card>
          )}
          {activeCourse && (
            <Card
              key="active"
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl cursor-pointer w-full max-w-xs"
              onClick={() => handleEdit(activeCourse)}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardContent className="flex flex-col items-center gap-4 p-6 animate-in fade-in slide-in-from-bottom-2">
                <BookOpen className="w-10 h-10 text-primary mb-2" />
                <div className="text-center font-semibold text-foreground text-lg">{activeCourse.title}</div>
                <span className="mt-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Curso activo</span>
              </CardContent>
            </Card>
          )}
          {inactiveCourse && (
            <Card
              key="inactive"
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl cursor-pointer w-full max-w-xs"
              onClick={() => handleEdit(inactiveCourse)}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardContent className="flex flex-col items-center gap-4 p-6 animate-in fade-in slide-in-from-bottom-2">
                <Copy className="w-10 h-10 text-muted-foreground mb-2" />
                <div className="text-center font-semibold text-foreground text-lg">{inactiveCourse.title}</div>
                <span className="mt-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">Curso inactivo</span>
              </CardContent>
            </Card>
          )}
        </div>

        {error && (
          <Card className="w-full mb-4"><CardContent className="text-destructive">{error}</CardContent></Card>
        )}
      </div>
    )
  );
}