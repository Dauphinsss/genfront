"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CourseCard } from "./course-card";
import { Header } from "./header";
import { Sidebar } from "./sidebar/Sidebar";
import { Plus, BookOpen } from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import { UsersManagement } from "./admin/UsersManagement";
import { PrivilegesManagement } from "./admin/PrivilegesManagement";

interface DashboardProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  onLogout: () => void;
  onToggleTheme?: () => void;
  isDark?: boolean;
}

const mockCourses = [
  {
    id: "1",
    title: "Python Básico",
    description: "Fundamentos de Python desde cero",
    instructor: "Prof. María García",
    students: 24,
    progress: 65,
    role: "student" as const,
    lastActivity: "Hace 2 días",
  },
  {
    id: "2",
    title: "Estructuras de Datos",
    description: "Listas, diccionarios y más",
    instructor: "Prof. Carlos López",
    students: 18,
    progress: 30,
    role: "student" as const,
    lastActivity: "Hace 1 semana",
  },
  {
    id: "3",
    title: "Python Avanzado",
    description: "POO y conceptos avanzados",
    instructor: "Tú",
    students: 32,
    role: "teacher" as const,
    lastActivity: "Hace 3 horas",
  },
];

export type DashboardView = "inicio" | "perfil" | "admin-users" | "admin-privileges";

export function Dashboard({ user, onLogout, onToggleTheme, isDark }: DashboardProps) {
  const { privileges, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showJoinCourse, setShowJoinCourse] = useState(false);
  const [courseCode, setCourseCode] = useState("");
  const [currentView, setCurrentView] = useState<DashboardView>("inicio");

  const filteredCourses = mockCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const studentCourses = filteredCourses.filter((c) => c.role === "student");
  const teacherCourses = filteredCourses.filter((c) => c.role === "teacher");

  const handleEnterCourse = (courseId: string) => {
    console.log("[v0] Entering course:", courseId);
  };

  const handleJoinCourse = () => {
    if (courseCode.trim()) {
      console.log("[v0] Joining course with code:", courseCode);
      setCourseCode("");
      setShowJoinCourse(false);
    }
  };

  const hasAdminPrivileges = privileges.some((p) => 
    p.name === "manage_users" || 
    p.name === "manage_privileges" || 
    p.name === "system_settings"
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando privilegios...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {hasAdminPrivileges && <Sidebar currentView={currentView} onViewChange={setCurrentView} />}

      <div className="flex-1 flex flex-col">
        <Header
          user={user}
          currentView={currentView === "admin-users" || currentView === "admin-privileges" ? "inicio" : currentView}
          onViewChange={setCurrentView}
          onToggleTheme={onToggleTheme}
          onLogout={onLogout}
          isDark={isDark}
        />

        <main className="flex-1 container mx-auto px-4 py-8">
          {currentView === "perfil" && (
            <div className="max-w-2xl mx-auto">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <img
                      src={user.avatar || "/placeholder.svg?height=48&width=48"}
                      alt={user.name}
                      className="w-12 h-12 rounded-full border border-border"
                    />
                    <div>
                      <h2 className="text-xl text-foreground">{user.name}</h2>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <p className="text-3xl font-bold text-foreground">{studentCourses.length}</p>
                      <p className="text-sm text-muted-foreground">Cursos como estudiante</p>
                    </div>
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <p className="text-3xl font-bold text-foreground">{teacherCourses.length}</p>
                      <p className="text-sm text-muted-foreground">Cursos como docente</p>
                    </div>
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <p className="text-3xl font-bold text-green-600">
                        {Math.round(
                          studentCourses.reduce((acc, course) => acc + (course.progress || 0), 0) /
                            studentCourses.length
                        ) || 0}
                        %
                      </p>
                      <p className="text-sm text-muted-foreground">Progreso promedio</p>
                    </div>
                  </div>

                  {privileges.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h3 className="text-sm font-medium text-foreground mb-3">Privilegios de Administrador</h3>
                      <div className="flex flex-wrap gap-2">
                        {privileges.map((priv) => (
                          <span
                            key={priv.id}
                            className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                          >
                            {priv.name}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Tienes acceso al panel de administración en el menú lateral
                      </p>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-border">
                    <Button variant="outline" onClick={onLogout} className="w-full rounded-lg bg-transparent">
                      Cerrar sesión
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentView === "admin-users" && <UsersManagement />}
          {currentView === "admin-privileges" && <PrivilegesManagement />}

          {currentView === "inicio" && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 text-foreground">Hola, {user.name}</h2>
                <p className="text-muted-foreground">Tus cursos de programación</p>
              </div>

              <div className="flex justify-end mb-6">
                <Button
                  onClick={() => setShowJoinCourse(!showJoinCourse)}
                  className="rounded-lg bg-foreground text-background hover:bg-foreground/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Unirse a curso
                </Button>
              </div>

              {showJoinCourse && (
                <Card className="mb-8 border-border">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Input
                        placeholder="Código del curso"
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                        className="flex-1 rounded-lg"
                      />
                      <Button
                        onClick={handleJoinCourse}
                        disabled={!courseCode.trim()}
                        className="rounded-lg bg-foreground text-background hover:bg-foreground/90"
                      >
                        Unirse
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {filteredCourses.length === 0 && (
                <Card className="text-center py-12 border-border">
                  <CardContent>
                    <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-foreground">No tienes cursos</h3>
                    <p className="text-muted-foreground mb-6">
                      Únete a tu primer curso con el código de tu instructor
                    </p>
                    <Button
                      onClick={() => setShowJoinCourse(true)}
                      className="rounded-lg bg-foreground text-background hover:bg-foreground/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Unirse a un curso
                    </Button>
                  </CardContent>
                </Card>
              )}

              {studentCourses.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Mis cursos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studentCourses.map((course) => (
                      <CourseCard key={course.id} course={course} onEnter={handleEnterCourse} />
                    ))}
                  </div>
                </div>
              )}

              {teacherCourses.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Mis clases</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teacherCourses.map((course) => (
                      <CourseCard key={course.id} course={course} onEnter={handleEnterCourse} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}