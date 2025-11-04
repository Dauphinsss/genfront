"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Cursos Históricos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Selecciona un curso histórico para visualizarlo
            </p>
          </div>
        </div>
        
        {historicMode.courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in-50">
            <History className="h-10 w-10 text-muted-foreground/60 mb-3" />
            <p className="text-sm text-muted-foreground">No hay cursos históricos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {historicMode.courses.map((course, index) => (
              <Card
                key={course.id}
                variant="interactive"
                className="group cursor-pointer transition-all duration-200 hover:shadow-lg"
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
                <CardContent 
                  className="flex flex-col items-center text-center p-5 gap-3 animate-in fade-in-50" 
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="relative">
                    <div className="flex h-18 w-18 items-center justify-center rounded-full bg-primary/10 transition-transform duration-200 group-hover:scale-105">
                      <History className="h-9 w-9 text-primary" />
                    </div>
                  </div>

                  <div className="w-full space-y-1.5">
                    <h3 className="text-lg font-medium text-foreground truncate">
                      {course.title}
                    </h3>
                    <Badge variant="outline" className="border-primary/30 text-xs text-primary">
                      Histórico
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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

  const coursesToRender = [];
  if (historicCourses.length > 0) {
    coursesToRender.push({ type: 'historic', data: null });
  }
  if (activeCourse) {
    coursesToRender.push({ type: 'active', data: activeCourse });
  }
  if (inactiveCourse) {
    coursesToRender.push({ type: 'inactive', data: inactiveCourse });
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Gestión de Curso Base
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra el curso base activo, inactivo e históricos
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-stretch w-full">
        <Button
          variant="default"
          className="rounded-xl px-8 py-3 font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
          onClick={handleClone}
          disabled={actionLoading || !!inactiveCourse}
        >
          <Copy className="h-4 w-4 mr-2" />
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
            <BookOpen className="h-4 w-4 mr-2" />
            Activar curso inactivo
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {coursesToRender.map((item, index) => {
          if (item.type === 'historic') {
            return (
              <Card
                key="historic"
                variant="interactive"
                className="group cursor-pointer transition-all duration-200 hover:shadow-lg"
                onClick={handleViewHistorics}
              >
                <CardContent 
                  className="flex flex-col items-center text-center p-5 gap-3 animate-in fade-in-50" 
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="relative">
                    <div className="flex h-18 w-18 items-center justify-center rounded-full bg-primary/10 transition-transform duration-200 group-hover:scale-105">
                      <History className="h-9 w-9 text-primary" />
                    </div>
                    {historicCourses.length > 0 && (
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {historicCourses.length}
                      </div>
                    )}
                  </div>

                  <div className="w-full space-y-1.5">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      Cursos Históricos
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      Ver historial completo
                    </p>
                    <Badge variant="outline" className="border-primary/30 text-xs text-primary">
                      {historicCourses.length} curso{historicCourses.length === 1 ? '' : 's'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          }

          if (item.type === 'active' && item.data) {
            return (
              <Card
                key="active"
                variant="interactive"
                className="group cursor-pointer transition-all duration-200 hover:shadow-lg"
                onClick={() => handleEdit(item.data!)}
              >
                <CardContent 
                  className="flex flex-col items-center text-center p-5 gap-3 animate-in fade-in-50" 
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="relative">
                    <div className="flex h-18 w-18 items-center justify-center rounded-full bg-primary/10 transition-transform duration-200 group-hover:scale-105">
                      <BookOpen className="h-9 w-9 text-primary" />
                    </div>
                  </div>

                  <div className="w-full space-y-1.5">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {item.data.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      Curso actual en uso
                    </p>
                    <Badge variant="outline" className="border-primary/30 text-xs text-primary">
                      Activo
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          }

          if (item.type === 'inactive' && item.data) {
            return (
              <Card
                key="inactive"
                variant="interactive"
                className="group cursor-pointer transition-all duration-200 hover:shadow-lg"
                onClick={() => handleEdit(item.data!)}
              >
                <CardContent 
                  className="flex flex-col items-center text-center p-5 gap-3 animate-in fade-in-50" 
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="relative">
                    <div className="flex h-18 w-18 items-center justify-center rounded-full bg-muted/50 transition-transform duration-200 group-hover:scale-105">
                      <Copy className="h-9 w-9 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="w-full space-y-1.5">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {item.data.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      En edición o revisión
                    </p>
                    <Badge variant="outline" className="border-primary/30 text-xs text-primary">
                      Inactivo
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          }

          return null;
        })}
      </div>

      {coursesToRender.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in-50">
          <BookOpen className="h-10 w-10 text-muted-foreground/60 mb-3" />
          <p className="text-sm text-muted-foreground">No hay cursos disponibles</p>
        </div>
      )}

      {error && (
        <Card className="w-full border-destructive/50 bg-destructive/10">
          <CardContent className="py-4 text-destructive text-center">
            {error}
          </CardContent>
        </Card>
      )}
    </div>
  );
}