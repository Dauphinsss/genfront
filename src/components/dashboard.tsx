"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CourseCard } from "./course-card"
import { Header } from "./header"
import { Plus, BookOpen } from "lucide-react"
import { getProfile, updateProfile } from "@/services/profile"
import axios from "axios"

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

const mockCourses: any[] = []

export function Dashboard({ user, onLogout, onToggleTheme, isDark }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showJoinCourse, setShowJoinCourse] = useState(false)
  const [courseCode, setCourseCode] = useState("")
  const [currentView, setCurrentView] = useState<"inicio" | "perfil">("inicio")
  
  const [currentUser, setCurrentUser] = useState(user)
  const [displayName, setDisplayName] = useState(user.name)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [language, setLanguage] = useState("es")
  const [privacy, setPrivacy] = useState("public")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  // Estados originales para cancelar cambios
  const [originalUser, setOriginalUser] = useState(user)
  const [originalDisplayName, setOriginalDisplayName] = useState(user.name)
  const [originalEmailNotifications, setOriginalEmailNotifications] = useState(true)
  const [originalPushNotifications, setOriginalPushNotifications] = useState(true)
  const [originalLanguage, setOriginalLanguage] = useState("es")
  const [originalPrivacy, setOriginalPrivacy] = useState("public")

  const [profile, setProfile] = useState(null);
  const token = localStorage.getItem('pyson_token') || '';

  useEffect(() => {
    if (token) {
      getProfile(token).then(data => setProfile(data)).catch(err => console.error(err)); 
    }
  }, [token]);

  useEffect(() => {
    if (currentView === "perfil") {
      setOriginalUser(currentUser);
      setOriginalDisplayName(displayName);
      setOriginalEmailNotifications(emailNotifications);
      setOriginalPushNotifications(pushNotifications);
      setOriginalLanguage(language);
      setOriginalPrivacy(privacy);
    }
  }, [currentView]);

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

  // Guardar cambios y volver al inicio
  const handleSaveChanges = async () => {
    setSaving(true);
    const updatedProfile = await updateProfile(token, { name: displayName });
    setCurrentUser(updatedProfile);
    setDisplayName(updatedProfile.name);
    localStorage.setItem('pyson_user', JSON.stringify(updatedProfile));

    try {
      setOriginalUser(currentUser);
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
        user={currentUser}
        currentView={currentView}
        onViewChange={setCurrentView}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
        isDark={isDark}
      />

      <main className="container mx-auto px-4 py-8">
        {currentView === "perfil" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
              <p className="text-muted-foreground mt-2">Administra tu cuenta y preferencias</p>
            </div>

            {/* Información Personal */}
            <Card className="border-border mx-auto">
              <CardHeader className="flex flex-col items-center pb-2">
                <img
                  src={avatarPreview || currentUser.avatar || "/placeholder.svg?height=80&width=80"}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border border-border mb-2"
                />
                <label
                  htmlFor="file"
                  className={`block text-xs px-3 py-1 rounded bg-foreground text-background cursor-pointer hover:bg-foreground/90 mb-1 ${
                    uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {uploading ? "Subiendo..." : "Cambiar foto"}
                  <input
                    id="file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onPickAvatar}
                    disabled={uploading}
                  />
                </label>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium mb-1">Nombre para mostrar</label>
                  <Input
                    id="name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Escribe tu nombre"
                    className="w-full"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Correo electrónico</label>
                  <Input
                    id="email"
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full bg-muted text-muted-foreground"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    disabled={saving}
                    onClick={handleSaveChanges}
                    className="bg-foreground text-background hover:bg-foreground/70 cursor-pointer"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelChanges}
                    className="border-border hover:bg-secondary cursor-pointer"
                  >
                    Cancelar cambios
                  </Button>
                </div>
              </CardContent>
            </Card>


            {/* Cerrar Sesión */}
            <Card className="border-border">
              <CardContent className="pt-1">
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
              <h2 className="text-3xl font-bold mb-2 text-foreground">Hola, {currentUser.name}</h2>
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
