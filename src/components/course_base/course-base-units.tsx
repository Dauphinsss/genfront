"use client"

import { useCourse } from "@/lib/course-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit, ChevronRight, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import axios, { AxiosError } from "axios"
import { AdminSidebar } from "./course-base-sidebar"

export default function CourseBaseEdit() {
  const { course, updateCourse } = useCourse()

  const [editingUnit, setEditingUnit] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingLesson, setEditingLesson] = useState<number | null>(null)
  const [editLessonTitle, setEditLessonTitle] = useState("")

  //  CRUD DE UNIDADES

  const addUnit = async () => {
    try {
      const { data: newUnit } = await axios.post("http://localhost:4000/units", {
        courseBaseId: 1,
        title: `UNIDAD ${course.units.length + 1}`,
        index: course.units.length + 1,
      })

      updateCourse({
        ...course,
        units: [...course.units, { ...newUnit, lessons: [] }],
      })
    } catch (err) {
      const error = err as AxiosError<{ error: string }>
      console.error("Error creando unidad:", error.response?.data?.error || error.message)
    }
  }

  const saveEdit = async (unitId: number) => {
    if (!editTitle.trim()) return
    try {
      const { data: updatedUnit } = await axios.patch(`http://localhost:4000/units/${unitId}`, {
        title: editTitle,
      })

      updateCourse({
        ...course,
        units: course.units.map((u) =>
          Number(u.id) === unitId ? { ...updatedUnit, lessons: u.lessons } : u
        ),
      })

      setEditingUnit(null)
      setEditTitle("")
    } catch (err) {
      const error = err as AxiosError<{ error: string }>
      console.error("Error editando unidad:", error.response?.data?.error || error.message)
    }
  }

  const deleteUnit = async (unitId: number) => {
    try {
      await axios.delete(`http://localhost:4000/units/${unitId}`)
      updateCourse({
        ...course,
        units: course.units.filter((u) => Number(u.id) !== unitId),
      })
      if (selectedUnitId === unitId) {
        setSelectedUnitId(null)
        setLessons([])
      }
    } catch (err) {
      const error = err as AxiosError<{ error: string }>
      console.error("Error eliminando unidad:", error.response?.data?.error || error.message)
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


  // CRUD DE LECCIONES
 
   type Lesson = {
  id: number;
  title: string;
  unitId: number;
};
  const fetchLessons = async (unitId: number) => {
    try {
      setLoading(true)
      const { data } = await axios.get(`http://localhost:4000/lessons?unitId=${unitId}`)
      setLessons(data)
    } catch (error) {
      console.error("Error al obtener lecciones:", error)
    } finally {
      setLoading(false)
    }
  }

  const addLesson = async () => {
    if (!selectedUnitId) return
    try {
      setLoading(true)
      const { data: newLesson } = await axios.post(`http://localhost:4000/lessons`, {
        title: `Lección ${lessons.length + 1}`,
        unitId: selectedUnitId,
        index: course.units.length + 1,
      })
      setLessons([...lessons, newLesson])
    } catch (error) {
      console.error("Error al agregar lección:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteLesson = async (lessonId: number) => {
    try {
      setLoading(true)
      await axios.delete(`http://localhost:4000/lessons/${lessonId}`)
      setLessons(lessons.filter((l) => l.id !== lessonId))
    } catch (error) {
      console.error("Error al eliminar lección:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveEditLesson = async (lessonId: number) => {
    try {
      setLoading(true)
      const { data: updatedLesson } = await axios.patch(
        `http://localhost:4000/lessons/${lessonId}`,
        { title: editLessonTitle }
      )
      setLessons(lessons.map((l) => (l.id === lessonId ? updatedLesson : l)))
      setEditingLesson(null)
      setEditLessonTitle("")
    } catch (error) {
      console.error("Error al actualizar lección:", error)
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

  // Render

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <div className="flex-1 overflow-auto">
        {/* Header principal */}
        <div className="border-b border-sidebar-border p-4 md:p-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Gestión de Contenido</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Organiza unidades y lecciones de tu curso
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
            {course.units.map((unit) => {
              const unitId = Number(unit.id)
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
                        {unit.lessons.length}{" "}
                        {unit.lessons.length === 1 ? "lección" : "lecciones"}
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

          {course.units.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No hay unidades creadas. Haz clic en Nueva Unidad para comenzar.</p>
            </div>
          )}
        </div>

        {/* Sección de Lecciones */}
        {selectedUnitId && (
          <div className="border-t border-sidebar-border p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                Lecciones de{" "}
                {
                  course.units.find((u) => Number(u.id) === selectedUnitId)?.title
                }
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
                      <>
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
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AdminSidebar />
    </div>
  )
}
