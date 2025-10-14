"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Header } from "./header";
import { Sidebar, MobileSidebar, DashboardView } from "./sidebar";
import { Plus, BookOpen, GraduationCap, History } from "@/lib/icons";
import { updateProfile } from "@/services/profile";
import { UsersManagement } from "@/components/admin/UsersManagement";
import { PrivilegesManagement } from "@/components/admin/PrivilegesManagement";
import { TopicsView } from "@/components/teacher/TopicsView";
import axios from "axios";

interface DashboardProps {
  user: {
    name: string;
    email: string;
    avatar: string;
    isTeacher?: boolean;
  };
  onLogout: () => void;
  onToggleTheme?: () => void;
  isDark?: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar: string;
  students: number;
  progress?: number;
  role: "student" | "teacher";
  lastActivity: string;
  completed?: boolean;
}

const mockCourses: Course[] = [
  {
    id: "1",
    title: "Python Básico",
    description: "Fundamentos de Python desde cero",
    instructor: "Prof. María García",
    instructorAvatar: "/placeholder.svg",
    students: 24,
    progress: 65,
    role: "student",
    lastActivity: "Hace 2 días",
  },
  {
    id: "2",
    title: "Estructuras de Datos",
    description: "Listas, diccionarios y más",
    instructor: "Prof. Carlos López",
    instructorAvatar: "/placeholder.svg",
    students: 18,
    progress: 30,
    role: "student",
    lastActivity: "Hace 1 semana",
  },
  {
    id: "3",
    title: "Python Avanzado",
    description: "POO y conceptos avanzados",
    instructor: "Tú",
    instructorAvatar: "/placeholder.svg",
    students: 32,
    role: "teacher",
    lastActivity: "Hace 3 horas",
  },
];

const mockPastCourses: Course[] = [
  {
    id: "past-1",
    title: "Introducción a la Programación",
    description: "Conceptos básicos de programación",
    instructor: "Prof. Ana Martínez",
    instructorAvatar: "/placeholder.svg",
    students: 30,
    progress: 100,
    role: "student",
    lastActivity: "Hace 3 meses",
    completed: true,
  },
  {
    id: "past-2",
    title: "Algoritmos I",
    description: "Fundamentos de algoritmos",
    instructor: "Prof. Roberto Silva",
    instructorAvatar: "/placeholder.svg",
    students: 25,
    progress: 100,
    role: "student",
    lastActivity: "Hace 6 meses",
    completed: true,
  },
];

export function Dashboard({
  user,
  onLogout,
  onToggleTheme,
  isDark,
}: DashboardProps) {
  const [courseCode, setCourseCode] = useState("");
  const [currentView, setCurrentView] = useState<DashboardView>("inicio");
  const [enrolledCourse, setEnrolledCourse] = useState<
    (typeof mockCourses)[0] | null
  >(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Inicia colapsado
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Función para manejar el toggle del menú
  const handleMenuToggle = () => {
    // En móvil: abrir/cerrar sidebar móvil
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      // En desktop: toggle pin del sidebar
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  console.debug('Available courses:', mockCourses.length);
  const [currentUser, setCurrentUser] = useState(user)
  const [displayName, setDisplayName] = useState(user.name)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const token = localStorage.getItem('pyson_token') || '';

  const [originalUser, setOriginalUser] = useState(user)
  const [originalDisplayName, setOriginalDisplayName] = useState(user.name)

  const onPickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Solo se permiten imágenes JPG, PNG, WebP o GIF');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen debe ser menor a 10MB');
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('pyson_token');
      
      const response = await axios.post(
        'http://localhost:4000/api/me/avatar',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const result = response.data;
      
      if (result.success && result.user) {
        setCurrentUser((prev) => ({
          ...prev,
          avatar: result.user.avatar,
        }));
        localStorage.setItem('pyson_user', JSON.stringify({
          ...currentUser,
          avatar: result.user.avatar,
        }));
        setAvatarPreview(null);
      } else {
        alert('Error al subir avatar: ' + (result.message || ''));
        setAvatarPreview(null);
      }

    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al subir avatar');
      setAvatarPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleJoinCourse = async () => {
    if (courseCode.trim() && !enrolledCourse) {
      try {
        const token = localStorage.getItem("pyson_token");

        const response = await axios.post(
          "http://localhost:4000/courses/join",
          {
            courseCode: courseCode.trim(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Inscripción exitosa:", response.data);

        const newCourse = {
          id: response.data.courseId || Date.now().toString(),
          title: response.data.title || "Nuevo Curso",
          description:
            response.data.description || "Curso al que te acabas de unir",
          instructor: response.data.instructor || "Prof. Juan Pérez",
          instructorAvatar: "/placeholder.svg?height=40&width=40",
          students: response.data.students || 15,
          progress: 0,
          role: "student" as const,
          lastActivity: "Ahora",
        };

        setEnrolledCourse(newCourse);
        setCourseCode("");
      } catch (error) {
        console.error(
          "Error:",
          axios.isAxiosError(error) ? error.response?.data?.message : error
        );
      }
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    const updatedProfile = await updateProfile(token, { name: displayName });
    setCurrentUser(updatedProfile);
    setDisplayName(updatedProfile.name);
    localStorage.setItem('pyson_user', JSON.stringify(updatedProfile));

    try {
      setOriginalUser(updatedProfile);
      setOriginalDisplayName(displayName);

      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentView("inicio");
      
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelChanges = () => {
    setCurrentUser(originalUser);
    setDisplayName(originalDisplayName);
  };

  useEffect(() => {
    if (currentView === "perfil") {
      setOriginalUser(currentUser);
      setOriginalDisplayName(displayName);
    }
  }, [currentView, currentUser, displayName]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={currentUser}
        currentView={currentView}
        onViewChange={setCurrentView}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
        isDark={isDark}
        onMenuToggle={handleMenuToggle}
      />

      {/* Desktop Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <main
        className={`
          min-h-[calc(100vh-4rem)] pt-8 pb-16 px-4
          transition-all duration-200
          md:ml-16
        `}
      >
        <div className="container mx-auto">
          {currentView === "perfil" && (
            <div className="max-w-2xl mx-auto py-8 flex flex-col items-center">
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-xl font-medium text-foreground mb-1">Mi Perfil</h1>
                <p className="text-xs text-muted-foreground">Información personal</p>
              </div>

              {/* Carnet Principal */}
              <Card className="w-full max-w-xl border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  {/* Header del carnet */}
                  <div className="bg-gradient-to-r from-foreground/5 to-foreground/10 px-6 py-4 border-b border-border/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-semibold text-foreground">Configuración personal</h2>
                        <p className="text-xs text-muted-foreground">Información de la cuenta</p>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Contenido del carnet */}
                  <div className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Avatar section */}
                      <div className="flex-shrink-0">
                        <div className="relative group">
                          <div className="relative">
                            <Image
                              src={avatarPreview || currentUser.avatar || "/placeholder.svg"}
                              alt="Avatar"
                              width={80}
                              height={80}
                              className="w-31 h-31 rounded-lg object-cover border-2 border-border/30 shadow-sm"
                            />
                            {uploading && (
                              <div className="absolute inset-0 bg-background/90 rounded-lg flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                          <label
                            htmlFor="file"
                            className={`absolute -bottom-1 -right-1 w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center cursor-pointer hover:bg-foreground/90 transition-all duration-200 shadow-sm text-xs ${
                              uploading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            ✏️
                            <input
                              id="file"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={onPickAvatar}
                              disabled={uploading}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Información */}
                      <div className="flex-1 space-y-4">
                        {/* Nombre */}
                        <div>
                          <label className="text-xs font-medium text-muted-foreground block mb-1">
                            Nombre
                          </label>
                          <Input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="border-border/30 bg-background/50 focus:bg-background text-sm h-8 rounded-lg"
                            placeholder="Tu nombre"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="text-xs font-medium text-muted-foreground block mb-1">
                            Email
                          </label>
                            <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border/20 cursor-not-allowed select-none">
                            {currentUser.email}
                            </div>
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2 mt-6 pt-4 border-t border-border/20">
                      <Button
                        onClick={handleSaveChanges}
                        disabled={saving}
                        className="flex-1 h-8 text-xs bg-foreground text-background hover:bg-foreground/90"
                      >
                        {saving ? "Guardando..." : "Guardar cambios"}
                      </Button>
                      <Button
                        onClick={handleCancelChanges}
                        variant="outline"
                        className="flex-1 h-8 text-xs border-border/30 hover:bg-muted/50"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cerrar sesión */}
              <div className="mt-6 w-full max-w-xl">
                <Button 
                  variant="outline" 
                  onClick={onLogout}
                  className="w-full h-11 text-base font-medium border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg"
                >
                  Cerrar sesión
                </Button>
              </div>
            </div>
          )}

          {currentView === "pasados" && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 text-foreground">
                  Cursos pasados
                </h2>
                <p className="text-muted-foreground">
                  Cursos que completaste anteriormente
                </p>
              </div>

              {mockPastCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockPastCourses.map((course) => (
                    <Card
                      key={course.id}
                      className="border-border hover:border-foreground/20 transition-colors"
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {course.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {course.description}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                          <Image
                            src={course.instructorAvatar || "/placeholder.svg"}
                            alt={course.instructor}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full border border-border"
                          />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {course.instructor}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {course.lastActivity}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-600 font-semibold">
                            Completado
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {course.progress}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-border text-center py-12">
                  <CardContent>
                    <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-foreground">
                      No hay cursos pasados
                    </h3>
                    <p className="text-muted-foreground">
                      Aún no has completado ningún curso
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {currentView === "teacher-topics" && (
            <div className="max-w-7xl mx-auto">
              <TopicsView />
            </div>
          )}

          {currentView === "admin-users" && (
            <div className="max-w-7xl mx-auto">
              <UsersManagement />
            </div>
          )}

          {currentView === "admin-privileges" && (
            <div className="max-w-7xl mx-auto">
              <PrivilegesManagement />
            </div>
          )}

          {currentView === "inicio" && (
            <>
              {!user.isTeacher && !enrolledCourse && (
                <div className="max-w-2xl mx-auto">
                  <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold mb-2 text-foreground">
                      Hola, {currentUser.name.split(" ")[0]}
                    </h2>
                    <p className="text-muted-foreground">
                      Únete a un curso para comenzar a aprender
                    </p>
                  </div>

                  <Card className="border-border text-center py-12">
                    <CardContent className="space-y-6">
                      <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto">
                        <BookOpen className="w-10 h-10 text-foreground" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2 text-foreground">
                          Unirse a un curso
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Ingresa el código que te proporcionó tu instructor
                          para unirte a un curso
                        </p>
                      </div>
                      <div className="max-w-md mx-auto space-y-4">
                        <Input
                          placeholder="Código del curso"
                          value={courseCode}
                          onChange={(e) =>
                            setCourseCode(e.target.value.toUpperCase())
                          }
                          className="text-center text-lg rounded-lg h-12"
                        />
                        <Button
                          onClick={handleJoinCourse}
                          disabled={!courseCode.trim()}
                          size="lg"
                          className="w-full rounded-lg bg-foreground text-background hover:bg-foreground/90"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Unirse
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-6 text-center">
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentView("pasados")}
                      className="rounded-lg hover:bg-secondary"
                    >
                      <History className="w-4 h-4 mr-2" />
                      Ver cursos pasados
                    </Button>
                  </div>
                </div>
              )}

              {!user.isTeacher && enrolledCourse && (
                <div className="max-w-4xl mx-auto">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2 text-foreground">
                      Hola, {user.name.split(" ")[0]}
                    </h2>
                    <p className="text-muted-foreground">Tu curso actual</p>
                  </div>

                  <Card className="border-border">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl mb-2">
                            {enrolledCourse.title}
                          </CardTitle>
                          <p className="text-muted-foreground">
                            {enrolledCourse.description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                        <Image
                          src={
                            enrolledCourse.instructorAvatar ||
                            "/placeholder.svg"
                          }
                          alt={enrolledCourse.instructor}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full border border-border"
                        />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Docente
                          </p>
                          <p className="font-semibold text-foreground">
                            {enrolledCourse.instructor}
                          </p>
                        </div>
                      </div>

                      <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                        <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2 text-foreground">
                          Curso vacío
                        </h3>
                        <p className="text-muted-foreground">
                          Aún no se ha añadido material a este curso. El docente
                          agregará contenido pronto.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-6 text-center">
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentView("pasados")}
                      className="rounded-lg hover:bg-secondary"
                    >
                      <History className="w-4 h-4 mr-2" />
                      Ver cursos pasados
                    </Button>
                  </div>
                </div>
              )}

              {user.isTeacher && (
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2 text-foreground">
                    Hola, {user.name.split(" ")[0]}
                  </h2>
                  <p className="text-muted-foreground">
                    Tus cursos de programación
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}