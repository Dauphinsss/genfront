"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plus,
  Trash2,
  Edit,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  Copy,
  CheckCircle,
  AlertCircle,
  Pencil,
  X,
  Check
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  createUnit,
  updateUnit,
  deleteUnit,
  type Unit
} from "@/services/units"
import {
  createLesson,
  updateLesson,
  deleteLesson,
  type Lesson
} from "@/services/lessons"
import {
  getEditableCourse,
  cloneCourse,
  activateCourse,
  updateCourseBase,
  type CourseBase,
  type EditableCourseResponse
} from "@/services/courseBase"
import { ManageLessonTopics } from "./manage-lesson-topics"
import { Loading } from "@/components/ui/loading";

type ViewMode = 'units' | 'lessons' | 'topics'

interface ViewState {
  mode: ViewMode
  selectedUnit?: Unit
  selectedLesson?: Lesson
}

export default function CourseBaseEdit() {
  const { toast } = useToast()
  
  const [editableData, setEditableData] = useState<EditableCourseResponse | null>(null)
  const [currentCourse, setCurrentCourse] = useState<CourseBase | null>(null)
  const [loadingSystem, setLoadingSystem] = useState(true)
  const [cloningCourse, setCloningCourse] = useState(false)
  const [activatingCourse, setActivatingCourse] = useState(false)
  const [units, setUnits] = useState<Unit[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [viewState, setViewState] = useState<ViewState>({ mode: 'units' })
  const [newTitle, setNewTitle] = useState("")
  const [editId, setEditId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [loading] = useState(false)
  const [newLessonTitle, setNewLessonTitle] = useState("")
  const [editLessonId, setEditLessonId] = useState<number | null>(null)
  const [editLessonTitle, setEditLessonTitle] = useState("")
  const [editingCourseTitle, setEditingCourseTitle] = useState(false)
  const [courseTitleValue, setCourseTitleValue] = useState("")
  
  const [deleteUnitDialog, setDeleteUnitDialog] = useState<{ open: boolean; unitId: number | null }>({
    open: false,
    unitId: null
  })
  const [deleteLessonDialog, setDeleteLessonDialog] = useState<{ open: boolean; lessonId: number | null }>({
    open: false,
    lessonId: null
  })
  // Dialogo de confirmación para activar curso
  const [activateDialogOpen, setActivateDialogOpen] = useState(false)
  const [pendingActivate, setPendingActivate] = useState(false)

  // Modales de agregar
  const [addUnitDialog, setAddUnitDialog] = useState(false)
  const [addLessonDialog, setAddLessonDialog] = useState(false)

  useEffect(() => {
    loadEditableData()
  }, [])

  useEffect(() => {
    if (currentCourse?.units) {
      setUnits(currentCourse.units)
    }
  }, [currentCourse])

  useEffect(() => {
    if (viewState.mode === 'lessons' && viewState.selectedUnit) {
      const unit = units.find(u => u.id === viewState.selectedUnit?.id)
      if (unit && 'lessons' in unit && unit.lessons) {
        setLessons(unit.lessons)
      } else {
        setLessons([])
      }
    } else if (viewState.mode === 'units') {
      // Limpiar lecciones cuando volvemos a la vista de unidades
      setLessons([])
    }
  }, [viewState.mode, viewState.selectedUnit, units])

  const loadEditableData = async () => {
    try {
      setLoadingSystem(true)
      const data = await getEditableCourse()
      setEditableData(data)
      
      if (data.editableCourse) {
        setCurrentCourse(data.editableCourse)
      }
    } catch (error: unknown) {
      console.error('Error al cargar datos editables:', error)
    } finally {
      setLoadingSystem(false)
    }
  };

  const handleCloneCourse = async () => {
    if (!editableData?.activeCourseId) return
    
    try {
      setCloningCourse(true)
      await cloneCourse(editableData.activeCourseId)
      await loadEditableData()
    } catch (error: unknown) {
      console.error('Error al clonar curso:', error)
      toast({
        title: "Error",
        description: "No se pudo crear la copia del curso",
        variant: "destructive",
      })
    } finally {
      setCloningCourse(false)
    }
  };

  const handleActivateCourse = async () => {
    if (!currentCourse?.id) return
    setPendingActivate(true)
    try {
      setActivatingCourse(true)
      await activateCourse(currentCourse.id)
      await loadEditableData()
      setActivateDialogOpen(false)
    } catch (error: unknown) {
      console.error('Error al activar curso:', error)
      toast({
        title: "Error",
        description: "No se pudo activar el curso",
        variant: "destructive",
      })
    } finally {
      setActivatingCourse(false)
      setPendingActivate(false)
    }
  };

  const handleUpdateCourseTitle = async () => {
    if (!currentCourse?.id || !courseTitleValue.trim()) return
    
    try {
      await updateCourseBase(currentCourse.id, { title: courseTitleValue.trim() })
      setEditingCourseTitle(false)
      await loadEditableData()
    } catch (error: unknown) {
      console.error('Error al actualizar título del curso:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el título del curso",
        variant: "destructive",
      })
    }
  };

  const startEditingCourseTitle = () => {
    if (currentCourse) {
      setCourseTitleValue(currentCourse.title)
      setEditingCourseTitle(true)
    }
  };

  const cancelEditingCourseTitle = () => {
    setEditingCourseTitle(false)
    setCourseTitleValue("")
  };

  const addUnit = async () => {
    if (!newTitle.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa un título para la unidad",
        variant: "warning",
      })
      return
    }
    if (!currentCourse?.id) return
    
    try {
      const newUnit = await createUnit({
        title: newTitle.trim(),
        index: units.length + 1,
        courseBaseId: currentCourse.id
      })
      setUnits([...units, newUnit])
      setNewTitle("")
      setAddUnitDialog(false)
    } catch (error: unknown) {
      console.error('Error creating unit:', error)
      toast({
        title: "Error",
        description: "No se pudo crear la unidad",
        variant: "destructive",
      })
    }
  };

  const updateUnitTitle = async (id: number) => {
    if (!editTitle.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa un título válido",
        variant: "warning",
      })
      return
    }
    try {
      const updatedUnit = await updateUnit(id, { title: editTitle.trim() })
      setUnits(units.map(u => u.id === id ? updatedUnit : u))
      setEditId(null)
      setEditTitle("")
    } catch (error: unknown) {
      console.error('Error updating unit:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la unidad",
        variant: "destructive",
      })
    }
  }

  const removeUnit = async (id: number) => {
    try {
      await deleteUnit(id)
      setUnits(units.filter(u => u.id !== id))
      setDeleteUnitDialog({ open: false, unitId: null })
    } catch (error: unknown) {
      console.error('Error deleting unit:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la unidad",
        variant: "destructive",
      })
    }
  };

  const addLesson = async () => {
    if (!newLessonTitle.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa un título para la lección",
        variant: "warning",
      })
      return
    }
    if (!viewState.selectedUnit) return
    
    try {
      const newLesson = await createLesson({
        title: newLessonTitle.trim(),
        index: lessons.length + 1,
        unitId: viewState.selectedUnit.id
      })
      
      // Actualizar el estado de lecciones
      setLessons([...lessons, newLesson])
      
      // También actualizar el array de units para incluir la nueva lección
      setUnits(units.map(u => {
        if (u.id === viewState.selectedUnit?.id) {
          return {
            ...u,
            lessons: [...(u.lessons || []), newLesson]
          }
        }
        return u
      }))
      
      setNewLessonTitle("")
      setAddLessonDialog(false)
    } catch (error: unknown) {
      console.error('Error creating lesson:', error)
      let errorMessage = "No se pudo crear la lección"
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        console.error('Response data:', axiosError.response?.data)
        errorMessage = axiosError.response?.data?.message || errorMessage
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  };

  const updateLessonTitle = async (id: number) => {
    if (!editLessonTitle.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa un título válido",
        variant: "warning",
      })
      return
    }
    try {
      const updatedLesson = await updateLesson(id, { title: editLessonTitle.trim() })
      
      // Actualizar estado de lecciones
      setLessons(lessons.map(l => l.id === id ? updatedLesson : l))
      
      // Actualizar en units también
      setUnits(units.map(u => {
        if (u.id === viewState.selectedUnit?.id && u.lessons) {
          return {
            ...u,
            lessons: u.lessons.map(l => l.id === id ? updatedLesson : l)
          }
        }
        return u
      }))
      
      setEditLessonId(null)
      setEditLessonTitle("")
    } catch (error: unknown) {
      console.error('Error updating lesson:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la lección",
        variant: "destructive",
      })
    }
  };

  const removeLesson = async (id: number) => {
    try {
      await deleteLesson(id)
      
      // Actualizar estado de lecciones
      setLessons(lessons.filter(l => l.id !== id))
      
      // Actualizar en units también
      setUnits(units.map(u => {
        if (u.id === viewState.selectedUnit?.id && u.lessons) {
          return {
            ...u,
            lessons: u.lessons.filter(l => l.id !== id)
          }
        }
        return u
      }))
      
      setDeleteLessonDialog({ open: false, lessonId: null })
    } catch (error: unknown) {
      console.error('Error deleting lesson:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la lección",
        variant: "destructive",
      })
    }
  };

  const goToLessons = (unit: Unit) => {
    setViewState({ mode: 'lessons', selectedUnit: unit })
  }

  const goToTopics = (lesson: Lesson) => {
    setViewState({ ...viewState, mode: 'topics', selectedLesson: lesson })
  }

  const goBackToUnits = () => {
    setViewState({ mode: 'units' })
    setLessons([])
  }

  const goBackToLessons = () => {
    setViewState({ mode: 'lessons', selectedUnit: viewState.selectedUnit })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Estado del Sistema */}
      {loadingSystem ? (
        <Card>
          <CardContent className="pt-6">
            <Loading size="sm" />
          </CardContent>
        </Card>
      ) : !editableData ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-destructive">Error al cargar el sistema</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* CASO C: Hay curso activo PERO NO existe copia */}
          {editableData.hasActiveCourse && !editableData.editableCourse && (
            <Card className="mb-4 border border-amber-400/60 bg-amber-50/60 dark:bg-amber-950/30 shadow-sm rounded-xl">
              <CardContent className="flex items-center gap-3 py-3 px-4">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-200" />
                <div className="flex-1">
                  <div className="font-semibold text-amber-900 dark:text-amber-100 text-base">Curso Activo en Uso</div>
                  <div className="text-xs text-amber-800 dark:text-amber-200">{editableData.message}</div>
                </div>
                <Button 
                  onClick={handleCloneCourse}
                  disabled={cloningCourse}
                  size="sm"
                  className="ml-2"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {cloningCourse ? 'Creando Copia...' : 'Crear Copia'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* CASO B: Hay curso activo Y existe copia editable */}
          {editableData.hasActiveCourse && editableData.editableCourse && (
            <Card className="mb-4 border border-sky-400/60 bg-sky-50/60 dark:bg-sky-950/30 shadow-sm rounded-xl">
              <CardContent className="flex items-center gap-3 py-3 px-4">
                <AlertCircle className="h-5 w-5 text-sky-600 dark:text-sky-100" />
                <div className="flex-1">
                  <div className="font-semibold text-sky-900 dark:text-sky-100 text-base">Editando Versión Temporal</div>
                  <div className="text-xs text-sky-800 dark:text-sky-200">{editableData.message}</div>
                </div>
                <Button 
                  onClick={() => setActivateDialogOpen(true)}
                  disabled={activatingCourse}
                  size="sm"
                  className="ml-2"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {activatingCourse ? 'Activando...' : 'Activar'}
                </Button>
                {/* Dialogo de confirmación para activar curso */}
                <Dialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>¿Activar esta versión del curso?</DialogTitle>
                      <DialogDescription>
                        Esto desactivará la versión actual y todos los cursos de profesores comenzarán a usar esta nueva versión.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setActivateDialogOpen(false)}
                        disabled={pendingActivate}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="default"
                        onClick={handleActivateCourse}
                        disabled={pendingActivate}
                      >
                        {pendingActivate ? 'Activando...' : 'Activar'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {/* CASO A: No hay curso activo - Edición directa */}
          {!editableData.hasActiveCourse && editableData.editableCourse && (
            <Card className="mb-4 border border-emerald-400/60 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-sm rounded-xl">
              <CardContent className="flex items-center gap-3 py-3 px-4">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-100" />
                <div className="flex-1">
                  <div className="font-semibold text-emerald-900 dark:text-emerald-100 text-base">Edición Directa Habilitada</div>
                  <div className="text-xs text-emerald-800 dark:text-emerald-200">{editableData.message}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Solo mostrar la UI de edición si hay un curso editable */}
          {currentCourse && (
            <>
              {/* Título del Curso - Card grande tipo UsersManagement */}
              <Card className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur mb-8 animate-in fade-in slide-in-from-bottom-2">
                <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                <CardHeader className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl md:text-3xl">Editar Curso Base</CardTitle>
                        <CardDescription>
                          Cambia el nombre del curso base y su estado.
                        </CardDescription>
                      </div>
                    </div>
                    <span className={`rounded-full border border-border/70 px-3 py-1 text-xs uppercase tracking-wide ${currentCourse.status === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {currentCourse.status === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="py-6">
                  {editingCourseTitle ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={courseTitleValue}
                        onChange={(e) => setCourseTitleValue(e.target.value)}
                        className="text-3xl font-bold h-14"
                        placeholder="Título del curso"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="default"
                        onClick={handleUpdateCourseTitle}
                        disabled={!courseTitleValue.trim()}
                      >
                        <Check className="h-5 w-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={cancelEditingCourseTitle}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-bold">
                        {currentCourse.title}
                      </h1>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={startEditingCourseTitle}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <button
          onClick={() => setViewState({ mode: 'units' })}
          className="hover:text-foreground"
        >
          Unidades
        </button>
        {viewState.selectedUnit && (
          <>
            <ChevronRight className="h-4 w-4" />
            <button
              onClick={() => setViewState({ mode: 'lessons', selectedUnit: viewState.selectedUnit })}
              className="hover:text-foreground"
            >
              {viewState.selectedUnit.title}
            </button>
          </>
        )}
        {viewState.selectedLesson && (
          <>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{viewState.selectedLesson.title}</span>
          </>
        )}
      </div>

      {/* Units View */}
      {viewState.mode === 'units' && (
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                <BookOpen className="w-6 h-6 mr-2 inline-block" />
                Unidades del Curso
              </h2>
              <p className="text-muted-foreground mt-2">
                Toca una unidad para gestionar sus lecciones
              </p>
            </div>
            <Button onClick={() => setAddUnitDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Unidad
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <Loading size="sm" />
            ) : units.length === 0 ? (
              <Card className="border-dashed col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    No hay unidades. Agrega la primera unidad para comenzar.
                  </p>
                  <Button onClick={() => setAddUnitDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Unidad
                  </Button>
                </CardContent>
              </Card>
            ) : (
              units.map((unit, index) => (
                <Card
                  key={unit.id}
                  className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm transition-all duration-300 ${
                    editId === unit.id
                      ? ''
                      : 'cursor-pointer hover:translate-y-[-4px] hover:shadow-xl'
                  }`}
                  style={{ animationDelay: `${index * 40}ms` }}
                  onClick={() => {
                    if (editId !== unit.id) {
                      goToLessons(unit)
                    }
                  }}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <CardContent className="flex items-start gap-4 p-5 md:flex-col md:items-center md:text-center animate-in fade-in slide-in-from-bottom-2 relative">
                    {editId === unit.id ? (
                      <div className="flex flex-col">
                        {/* Header */}
                        <div className="px-4 pt-4 pb-3 border-b border-border">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Edit className="w-4 h-4" />
                            <span>Editando unidad</span>
                          </div>
                        </div>

                        {/* Input Section */}
                        <div className="px-4 py-6">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && updateUnitTitle(unit.id)}
                            className="text-center text-base"
                            placeholder="Nombre de la unidad"
                            autoFocus
                          />
                        </div>

                        {/* Actions Section */}
                        <div className="px-4 pb-4">
                          <div className="flex gap-2 mb-4">
                            <Button 
                              onClick={(e) => {
                                e.stopPropagation()
                                updateUnitTitle(unit.id)
                              }} 
                              size="sm"
                              className="flex-1"
                              disabled={!editTitle.trim()}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Guardar
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditId(null)
                              }}
                              size="sm"
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                          </div>

                          {/* Danger Zone */}
                          <div className="pt-4 border-t border-border">
                            <p className="text-xs text-muted-foreground mb-2">Zona de peligro</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteUnitDialog({ open: true, unitId: unit.id })
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar Unidad
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center w-full">
                        {/* Icono grande */}
                        <div className="relative flex-shrink-0 mb-2">
                          <div className="h-16 w-16 rounded-full border-2 border-border bg-primary/10 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-primary" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold shadow-md">
                            {unit.index}
                          </div>
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0 w-full text-center space-y-1">
                          <h3 className="truncate text-base font-semibold text-foreground">
                            {unit.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {unit.lessons?.length || 0} lecciones
                          </p>
                        </div>
                        {/* Botón de edición */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-3 right-3 h-8 w-8 p-0 hover:bg-accent"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditId(unit.id)
                            setEditTitle(unit.title)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Lessons View */}
      {viewState.mode === 'lessons' && viewState.selectedUnit && (
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <Button 
                variant="default" 
                size="lg"
                onClick={goBackToUnits} 
                className="mb-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver
              </Button>
              <h2 className="text-2xl font-bold text-foreground">
                📚 Lecciones de: {viewState.selectedUnit.title}
              </h2>
              <p className="text-muted-foreground mt-2">
                Toca una lección para gestionar sus topics
              </p>
            </div>
            <Button onClick={() => setAddLessonDialog(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Crear Lección
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <Loading size="sm" />
            ) : lessons.length === 0 ? (
              <Card className="border-dashed col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    No hay lecciones. Agrega la primera lección para comenzar.
                  </p>
                  <Button onClick={() => setAddLessonDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Lección
                  </Button>
                </CardContent>
              </Card>
            ) : (
              lessons.map((lesson, index) => (
                <Card
                  key={lesson.id}
                  className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm transition-all duration-300 ${
                    editLessonId === lesson.id
                      ? ''
                      : 'cursor-pointer hover:translate-y-[-4px] hover:shadow-xl'
                  }`}
                  style={{ animationDelay: `${index * 40}ms` }}
                  onClick={() => {
                    if (editLessonId !== lesson.id) {
                      goToTopics(lesson)
                    }
                  }}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <CardContent className="flex items-start gap-4 p-5 md:flex-col md:items-center md:text-center animate-in fade-in slide-in-from-bottom-2 relative">
                    {editLessonId === lesson.id ? (
                      <div className="flex flex-col">
                        {/* Header */}
                        <div className="px-4 pt-4 pb-3 border-b border-border">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Edit className="w-4 h-4" />
                            <span>Editando lección</span>
                          </div>
                        </div>

                        {/* Input Section */}
                        <div className="px-4 py-6">
                          <Input
                            value={editLessonTitle}
                            onChange={(e) => setEditLessonTitle(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === 'Enter' && updateLessonTitle(lesson.id)
                            }
                            className="text-center text-base"
                            placeholder="Nombre de la lección"
                            autoFocus
                          />
                        </div>

                        {/* Actions Section */}
                        <div className="px-4 pb-4">
                          <div className="flex gap-2 mb-4">
                            <Button 
                              onClick={(e) => {
                                e.stopPropagation()
                                updateLessonTitle(lesson.id)
                              }} 
                              size="sm"
                              className="flex-1"
                              disabled={!editLessonTitle.trim()}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Guardar
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditLessonId(null)
                              }}
                              size="sm"
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                          </div>

                          {/* Danger Zone */}
                          <div className="pt-4 border-t border-border">
                            <p className="text-xs text-muted-foreground mb-2">Zona de peligro</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteLessonDialog({ open: true, lessonId: lesson.id })
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar Lección
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center w-full">
                        {/* Icono grande */}
                        <div className="relative flex-shrink-0 mb-2">
                          <div className="h-16 w-16 rounded-full border-2 border-border bg-primary/10 flex items-center justify-center">
                            <span className="text-3xl">📖</span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold shadow-md">
                            {lesson.index}
                          </div>
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0 w-full text-center space-y-1">
                          <h3 className="truncate text-base font-semibold text-foreground">
                            {lesson.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Lección #{lesson.index}
                          </p>
                        </div>
                        {/* Botón de edición */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-3 right-3 h-8 w-8 p-0 hover:bg-accent"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditLessonId(lesson.id)
                            setEditLessonTitle(lesson.title)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Topics View */}
      {viewState.mode === 'topics' && viewState.selectedLesson && (
        <div className="space-y-6">
          <Button 
            variant="default" 
            size="lg"
            onClick={goBackToLessons} 
            className="mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
          </Button>
          <ManageLessonTopics 
            lesson={viewState.selectedLesson} 
            onBack={goBackToLessons}
          />
        </div>
      )}
            </>
          )}
        </>
      )}

      {/* Diálogo de confirmación para eliminar unidad */}
      <Dialog open={deleteUnitDialog.open} onOpenChange={(open) => setDeleteUnitDialog({ open, unitId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar unidad?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la unidad y todas sus lecciones asociadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteUnitDialog({ open: false, unitId: null })}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteUnitDialog.unitId && removeUnit(deleteUnitDialog.unitId)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar lección */}
      <Dialog open={deleteLessonDialog.open} onOpenChange={(open) => setDeleteLessonDialog({ open, lessonId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar lección?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la lección y todas sus asociaciones con topics.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteLessonDialog({ open: false, lessonId: null })}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteLessonDialog.lessonId && removeLesson(deleteLessonDialog.lessonId)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para agregar unidad */}
      <Dialog open={addUnitDialog} onOpenChange={setAddUnitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Unidad</DialogTitle>
            <DialogDescription>
              Ingresa el título de la nueva unidad del curso.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Título de la unidad..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && newTitle.trim() && addUnit()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddUnitDialog(false)
                setNewTitle("")
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={addUnit}
              disabled={!newTitle.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Unidad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para agregar lección */}
      <Dialog open={addLessonDialog} onOpenChange={setAddLessonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Lección</DialogTitle>
            <DialogDescription>
              Ingresa el título de la nueva lección para la unidad: {viewState.selectedUnit?.title}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Título de la lección..."
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && newLessonTitle.trim() && addLesson()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddLessonDialog(false)
                setNewLessonTitle("")
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={addLesson}
              disabled={!newLessonTitle.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Lección
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}