"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CourseCard } from "./course-card"
import { Header } from "./header"
import { Plus, BookOpen } from "lucide-react"

interface DashboardProps {
  user: {
    name: string
    email: string
    avatar: string
  }
  onLogout: () => void
  onToggleTheme?: () => void
  isDark?: boolean
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
]

export function Dashboard({ user, onLogout, onToggleTheme, isDark }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showJoinCourse, setShowJoinCourse] = useState(false)
  const [courseCode, setCourseCode] = useState("")
  const [currentView, setCurrentView] = useState<"inicio" | "perfil">("inicio")
  
  // Estados para configuración
  const [displayName, setDisplayName] = useState(user.name)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [language, setLanguage] = useState("es")
  const [privacy, setPrivacy] = useState("public")
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpeg)$/.test(file.type) || file.size > 2 * 1024 * 1024) {
      alert("Por favor selecciona una imagen PNG o JPEG menor a 2MB.");
      return;
    }
    setAvatarPreview(URL.createObjectURL(file));
  };

  const filteredCourses = mockCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const studentCourses = filteredCourses.filter((c) => c.role === "student")
  const teacherCourses = filteredCourses.filter((c) => c.role === "teacher")

  const handleEnterCourse = (courseId: string) => {
    console.log("[v0] Entering course:", courseId)
  }

  const handleJoinCourse = () => {
    if (courseCode.trim()) {
      console.log("[v0] Joining course with code:", courseCode)
      setCourseCode("")
      setShowJoinCourse(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        currentView={currentView}
        onViewChange={setCurrentView}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout} // Pass onLogout to Header
        isDark={isDark}
      />

      <main className="container mx-auto px-4 py-8">
        {currentView === "perfil" && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header del Perfil */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
              <p className="text-muted-foreground mt-2">Administra tu cuenta y preferencias</p>
            </div>

            {/* Estadísticas del Usuario */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <img
                    src={avatarPreview || user.avatar || "/placeholder.svg?height=48&width=48"}
                    alt={user.name}
                    className="w-12 h-12 rounded-full border border-border"
                  />
                  <div>
                    <h2 className="text-xl text-foreground">{displayName}</h2>
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
                        studentCourses.reduce((acc, course) => acc + (course.progress || 0), 0) / studentCourses.length,
                      ) || 0}
                      %
                    </p>
                    <p className="text-sm text-muted-foreground">Progreso promedio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información Personal */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <p className="text-sm text-muted-foreground">Actualiza tu información de perfil</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <img
                    src={avatarPreview || user.avatar || "/placeholder.svg?height=80&width=80"}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border border-border"
                  />
                  <div>
                    <label
                      htmlFor="file"
                      className="inline-flex items-center px-3 py-2 rounded-md border cursor-pointer hover:bg-secondary text-sm"
                    >
                      Cambiar foto
                    </label>
                    <input id="file" type="file" accept="image/png,image/jpeg" className="hidden" onChange={onPickAvatar} />
                    <p className="text-xs text-muted-foreground mt-1">PNG/JPG, máx. 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="name" className="text-sm font-medium">Nombre para mostrar</label>
                    <Input
                      id="name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Escribe tu nombre"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="email" className="text-sm font-medium">Correo electrónico</label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-muted text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    disabled={saving}
                    onClick={() => {
                      setSaving(true)
                      setTimeout(() => setSaving(false), 2000)
                    }}
                    className="bg-foreground text-background hover:bg-foreground/90"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Apariencia */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Apariencia</CardTitle>
                <p className="text-sm text-muted-foreground">Personaliza cómo se ve la aplicación</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Tema oscuro</h3>
                    <p className="text-xs text-muted-foreground">Cambiar entre tema claro y oscuro</p>
                  </div>
                  <button
                    onClick={onToggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDark ? 'bg-foreground' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                        isDark ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-1">
                  <label htmlFor="language" className="text-sm font-medium">Idioma</label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 bg-background"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Notificaciones */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Notificaciones</CardTitle>
                <p className="text-sm text-muted-foreground">Configura cómo recibir notificaciones</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Notificaciones por email</h3>
                    <p className="text-xs text-muted-foreground">Recibir actualizaciones por correo</p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      emailNotifications ? 'bg-foreground' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                        emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Notificaciones push</h3>
                    <p className="text-xs text-muted-foreground">Recibir notificaciones en el navegador</p>
                  </div>
                  <button
                    onClick={() => setPushNotifications(!pushNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      pushNotifications ? 'bg-foreground' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                        pushNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Privacidad */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Privacidad y Seguridad</CardTitle>
                <p className="text-sm text-muted-foreground">Controla la visibilidad de tu información</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="privacy" className="text-sm font-medium">Visibilidad del perfil</label>
                  <select
                    id="privacy"
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 bg-background"
                  >
                    <option value="public">Público</option>
                    <option value="friends">Solo compañeros de curso</option>
                    <option value="private">Privado</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    Cambiar contraseña
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cerrar Sesión */}
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Cerrar sesión</h3>
                    <p className="text-xs text-muted-foreground">Salir de tu cuenta en este dispositivo</p>
                  </div>
                  <Button variant="outline" onClick={onLogout} className="border-border">
                    Cerrar sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
                  <p className="text-muted-foreground mb-6">Únete a tu primer curso con el código de tu instructor</p>
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
  )
}
