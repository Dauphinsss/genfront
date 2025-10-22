"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import axios, { AxiosError } from "axios"

type Lesson = {
  id: number
  title: string
  unitId: number
}

type Unit = {
  id: number
  title: string
  lessons: Lesson[]
}

type Course = {
  id: number
  title: string
}

export default function CourseBaseEdit() {
  const [courseTitle, setCourseTitle] = useState<string>("")
  const [units, setUnits] = useState<Unit[]>([])
  const [editingUnit, setEditingUnit] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(false)
  const [editingLesson, setEditingLesson] = useState<number | null>(null)
  const [editLessonTitle, setEditLessonTitle] = useState("")

  const COURSE_ID = 1

  useEffect(() => {
    const fetchCourseTitle = async () => {
      try {
        const { data } = await axios.get<Course>(`http://localhost:4000/courses/${COURSE_ID}`)
        setCourseTitle(data.title)
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error("Error al obtener título del curso:", error.response?.data || error.message)
        } else {
          console.error(error)
        }
      }
    }
    fetchCourseTitle()
  }, [])

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const { data } = await axios.get<Unit[]>(`http://localhost:4000/courses/${COURSE_ID}/units`)
        const unitsWithLessons: Unit[] = data.map(u => ({ ...u, lessons: [] }))
        setUnits(unitsWithLessons)
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error("Error al obtener unidades:", error.response?.data || error.message)
        } else {
          console.error(error)
        }
      }
    }
    fetchUnits()
  }, [])

  // UNITS CRUD 
  const addUnit = async () => {
    try {
      const { data: newUnit } = await axios.post<Unit>(`http://localhost:4000/units`, {
        courseBaseId: COURSE_ID,
        title: `UNIDAD ${units.length + 1}`,
        index: units.length + 1,
      })
      setUnits(prev => [...prev, { ...newUnit, lessons: [] }])
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error creando unidad:", error.response?.data || error.message)
      } else {
        console.error(error)
      }
    }
  }

  const saveEdit = async (unitId: number) => {
    if (!editTitle.trim()) return
    try {
      const { data: updatedUnit } = await axios.patch<Unit>(`http://localhost:4000/units/${unitId}`, {
        title: editTitle,
      })
      setUnits(prev => prev.map(u => (u.id === unitId ? { ...updatedUnit, lessons: u.lessons } : u)))
      setEditingUnit(null)
      setEditTitle("")
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error editando unidad:", error.response?.data || error.message)
      } else {
        console.error(error)
      }
    }
  }

  const deleteUnit = async (unitId: number) => {
    try {
      await axios.delete(`http://localhost:4000/units/${unitId}`)
      setUnits(prev => prev.filter(u => u.id !== unitId))
      if (selectedUnitId === unitId) {
        setSelectedUnitId(null)
        setLessons([])
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error eliminando unidad:", error.response?.data || error.message)
      } else {
        console.error(error)
      }
    }
  }

  const startEdit = (unitId: number, currentTitle: string) => {
    setEditingUnit(unitId)
    setEditTitle(currentTitle)
  }

  const cancelEdit = () => {
    setEditingUnit(null)
    setEditTitle("")
  }

  // LESSONS CRUD 
  const fetchLessons = async (unitId: number) => {
    try {
      setLoading(true)
      const { data } = await axios.get<Lesson[]>(`http://localhost:4000/lessons?unitId=${unitId}`)
      setLessons(data)
      setUnits(prev => prev.map(u => (u.id === unitId ? { ...u, lessons: data } : u)))
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error al obtener lecciones:", error.response?.data || error.message)
      } else {
        console.error(error)
      }
    } finally {
      setLoading(false)
    }
  }

  const addLesson = async () => {
    if (!selectedUnitId) return
    try {
      setLoading(true)
      const { data: newLesson } = await axios.post<Lesson>(`http://localhost:4000/lessons`, {
        title: `Lección ${lessons.length + 1}`,
        unitId: selectedUnitId,
        index: lessons.length + 1,
      })
      setLessons(prev => [...prev, newLesson])
      setUnits(prev =>
        prev.map(u => (u.id === selectedUnitId ? { ...u, lessons: [...u.lessons, newLesson] } : u))
      )
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error al agregar lección:", error.response?.data || error.message)
      } else {
        console.error(error)
      }
    } finally {
      setLoading(false)
    }
  }

  const deleteLesson = async (lessonId: number) => {
    if (!selectedUnitId) return
    try {
      setLoading(true)
      await axios.delete(`http://localhost:4000/lessons/${lessonId}`)
      setLessons(prev => prev.filter(l => l.id !== lessonId))
      setUnits(prev =>
        prev.map(u =>
          u.id === selectedUnitId ? { ...u, lessons: u.lessons.filter(l => l.id !== lessonId) } : u
        )
      )
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error al eliminar lección:", error.response?.data || error.message)
      } else {
        console.error(error)
      }
    } finally {
      setLoading(false)
    }
  }

  const saveEditLesson = async (lessonId: number) => {
    if (!editLessonTitle.trim()) return
    try {
      setLoading(true)
      const { data: updatedLesson } = await axios.patch<Lesson>(
        `http://localhost:4000/lessons/${lessonId}`,
        { title: editLessonTitle }
      )
      setLessons(prev => prev.map(l => (l.id === lessonId ? updatedLesson : l)))
      setUnits(prev =>
        prev.map(u =>
          u.id === selectedUnitId
            ? {
                ...u,
                lessons: u.lessons.map(l => (l.id === lessonId ? { ...l, title: updatedLesson.title } : l)),
              }
            : u
        )
      )
      setEditingLesson(null)
      setEditLessonTitle("")
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error al actualizar lección:", error.response?.data || error.message)
      } else {
        console.error(error)
      }
    } finally {
      setLoading(false)
    }
  }

  const startEditLesson = (lessonId: number, currentTitle: string) => {
    setEditingLesson(lessonId)
    setEditLessonTitle(currentTitle)
  }

  const cancelEditLesson = () => {
    setEditingLesson(null)
    setEditLessonTitle("")
  }

  // RENDER 
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b border-sidebar-border p-4 md:p-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Gestión de Contenido</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Organiza unidades y lecciones de tu curso{" "}
                <span className="font-semibold text-primary">
                  {courseTitle || "(Cargando curso...)"}
                </span>
              </p>
            </div>
            <Button
              onClick={addUnit}
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/80 font-medium"
            >
              <Plus className="w-4 h-4" />
              Nueva Unidad
            </Button>
          </div>
        </div>

        {/* Unidades */}
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => {
              const unitId = unit.id
              const displayCount = selectedUnitId === unitId ? lessons.length : unit.lessons.length

              return (
                <div
                  key={unitId}
                  className="border border-sidebar-border rounded-lg p-4 hover:border-sidebar-ring transition-colors bg-card"
                >
                  {editingUnit === unitId ? (
                    <div className="space-y-3">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-card-foreground text-foreground border-border"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => saveEdit(unitId)}
                          size="sm"
                          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/80"
                        >
                          Guardar
                        </Button>
                        <Button
                          onClick={cancelEdit}
                          size="sm"
                          variant="outline"
                          className="flex-1 border-border text-foreground hover:bg-white/10 bg-transparent"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg">{unit.title}</h3>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(unitId, unit.title)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteUnit(unitId)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        {displayCount} {displayCount === 1 ? "lección" : "lecciones"}
                      </p>

                      <Button
                        onClick={() => {
                          setSelectedUnitId(unitId)
                          fetchLessons(unitId)
                        }}
                        variant="outline"
                        className="w-full border-sidebar-border text-foreground hover:bg-primary hover:text-primary-foreground"
                      >
                        Ver Lecciones
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {units.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No hay unidades creadas. Haz clic en Nueva Unidad para comenzar.</p>
            </div>
          )}
        </div>

        {/* Lecciones */}
        {selectedUnitId && (
          <div className="border-t border-sidebar-border p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                Lecciones de{" "}
                {units.find((u) => u.id === selectedUnitId)?.title}
              </h2>
              <Button
                onClick={addLesson}
                className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/80 font-medium"
              >
                <Plus className="w-4 h-4" />
                Nueva Lección
              </Button>
            </div>

            {loading ? (
              <p className="text-muted-foreground">Cargando...</p>
            ) : lessons.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay lecciones aún. Crea una nueva para comenzar.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="border border-sidebar-border rounded-lg p-4 bg-card hover:border-sidebar-ring transition-colors"
                  >
                    {editingLesson === lesson.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editLessonTitle}
                          onChange={(e) => setEditLessonTitle(e.target.value)}
                          className="bg-card-foreground text-foreground border-border"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => saveEditLesson(lesson.id)}
                            size="sm"
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/80"
                          >
                            Guardar
                          </Button>
                          <Button
                            onClick={cancelEditLesson}
                            size="sm"
                            variant="outline"
                            className="flex-1 border-border text-foreground hover:bg-white/10 bg-transparent"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg">{lesson.title}</h3>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditLesson(lesson.id, lesson.title)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteLesson(lesson.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
