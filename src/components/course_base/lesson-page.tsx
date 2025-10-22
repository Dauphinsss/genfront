"use client"

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { BookOpen, ChevronLeft, ChevronRight, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type Lesson = {
  id: number
  title: string
  description?: string
}

type Unit = {
  id: number
  title: string
  lessons: Lesson[]
}

type CourseData = {
  id: number
  title: string
  units: Unit[]
}

const API = "http://localhost:4000"
const COURSE_ID = 1

export default function CourseBase() {
  // UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const bg = "bg-[var(--background)]"
  const fg = "text-[var(--foreground)]"
  const border = "border-[var(--border)]"
  const sidebarBg = "bg-[var(--sidebar)]"

  // Data
  const [course, setCourse] = useState<CourseData>({ id: COURSE_ID, title: "", units: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentUnitIndex, setCurrentUnitIndex] = useState(0)
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)

  const currentUnit = course.units[currentUnitIndex]
  const currentLesson = currentUnit?.lessons[currentLessonIndex]

  const hasAnyContent = useMemo(
    () => course.units.some(u => (u.lessons?.length ?? 0) > 0),
    [course.units]
  )

  const hasNext =
    (currentUnit?.lessons && currentLessonIndex < (currentUnit.lessons.length ?? 0) - 1) ||
    currentUnitIndex < course.units.length - 1

  function getNextLessonInfo() {
    if (currentUnit && currentLessonIndex < currentUnit.lessons.length - 1) {
      return currentUnit.lessons[currentLessonIndex + 1].title
    }
    if (currentUnitIndex < course.units.length - 1) {
      return course.units[currentUnitIndex + 1].lessons?.[0]?.title || "Siguiente unidad"
    }
    return "Finalizado"
  }

  function goToNextLesson() {
    if (!currentUnit) return
    if (currentLessonIndex < currentUnit.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1)
      return
    }
    if (currentUnitIndex < course.units.length - 1) {
      setCurrentUnitIndex(currentUnitIndex + 1)
      setCurrentLessonIndex(0)
      return
    }
  }

  function goToPreviousLesson() {
    let u = currentUnitIndex
    let l = currentLessonIndex - 1
    if (l < 0) {
      if (u > 0) {
        u = u - 1
        l = (course.units[u].lessons?.length ?? 1) - 1
      } else return
    }
    while (u >= 0) {
      const unit = course.units[u]
      while (l >= 0) {
        const lesson = unit.lessons[l]
        if (lesson) {
          setCurrentUnitIndex(u)
          setCurrentLessonIndex(l)
          return
        }
        l--
      }
      u--
      if (u >= 0) l = (course.units[u].lessons?.length ?? 1) - 1
    }
  }

  async function fetchUnits(courseId: number): Promise<Unit[]> {
    const { data } = await axios.get(`${API}/courses/${courseId}/units`)
    return (data ?? []).map((u: any) => ({ id: u.id, title: u.title, lessons: [] }))
  }

  async function fetchLessons(unitId: number): Promise<Lesson[]> {
    const { data } = await axios.get(`${API}/lessons`, { params: { unitId } })
    return (data ?? []).map((l: any) => ({
      id: l.id,
      title: l.title,
      description: l.description ?? "",
    }))
  }

  async function hydrateCourse(courseId: number) {
    setLoading(true)
    setError(null)
    try {
      const { data: courseData } = await axios.get(`${API}/courses/${courseId}`)
      const units = await fetchUnits(courseId)
      const unitsWithLessons: Unit[] = await Promise.all(
        units.map(async (u) => {
          const lessons = await fetchLessons(u.id)
          return { ...u, lessons }
        })
      )

      setCourse({ id: courseId, title: courseData.title, units: unitsWithLessons })

      let uIdx = 0
      let lIdx = 0
      outer: for (let i = 0; i < unitsWithLessons.length; i++) {
            if ((unitsWithLessons[i].lessons?.length ?? 0) > 0) {
              uIdx = i; lIdx = 0
              break outer
            }
          }
      setCurrentUnitIndex(uIdx)
      setCurrentLessonIndex(lIdx)
    } catch (e: any) {
      console.error(e)
      setError("No se pudo cargar el curso desde el backend.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    hydrateCourse(COURSE_ID)
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsSidebarOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  // SIDEBAR  (desktop) 
  const SidebarContent = () => (
    <>
      <div className={`sticky top-0 z-10 p-4 md:p-6 border-b ${border} ${sidebarBg} relative`}>
        <div className="flex items-center gap-3 pr-12">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-black" />
          </div>
          <h2 className="text-sm md:text-base font-medium line-clamp-2">
            {course.title || "Curso"}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <button
            className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed p-1"
            onClick={goToPreviousLesson}
            disabled={currentUnitIndex === 0 && currentLessonIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-1 px-2 min-w-0">
            <div className="text-[var(--sidebar-accent-foreground)] text-xs md:text-sm font-semibold mb-1">
              {currentUnit?.title || "—"}
            </div>
            <div className="text-xs md:text-sm text-[var(--sidebar-foreground)] truncate">
              {currentLesson?.title || "—"}
            </div>
          </div>
          <button
            className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed p-1"
            onClick={goToNextLesson}
            disabled={
              currentUnitIndex === course.units.length - 1 &&
              currentLesson &&
              currentLessonIndex === (currentUnit?.lessons.length ?? 0) - 1
            }
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-[var(--sidebar-foreground)]/70">
            No hay contenido por ahora.
          </p>
        </div>
      </div>
    </>
  )

  //  MOBILE BOTTOM-SHEET 
  function MobileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Bottom sheet */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center">
        <div
          className={`${sidebarBg} border-t ${border} rounded-t-2xl shadow-xl w-full sm:w-[480px] max-h-[86vh] overflow-hidden translate-y-0 transition-transform duration-300`}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg grid place-items-center">
                <BookOpen className="w-5 h-5 text-black" />
              </div>
              <h2 className="text-base font-semibold truncate">{course.title || "Curso"}</h2>
            </div>
          </div>

          {/* Navegación */}
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <button
              className="p-2 rounded-md hover:bg-white/10 text-gray-300 disabled:opacity-40"
              onClick={goToPreviousLesson}
              disabled={currentUnitIndex === 0 && currentLessonIndex === 0}
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center flex-1 px-2 min-w-0">
              <div className="text-[var(--sidebar-accent-foreground)] text-xs md:text-sm font-semibold mb-1 truncate">
                {currentUnit?.title || "—"}
              </div>
              <div className="text-xs md:text-sm text-[var(--sidebar-foreground)] truncate">
                {currentLesson?.title || "—"}
              </div>
            </div>

            <button
              className="p-2 rounded-md hover:bg-white/10 text-gray-300 disabled:opacity-40"
              onClick={goToNextLesson}
              disabled={
                currentUnitIndex === course.units.length - 1 &&
                currentLesson &&
                currentLessonIndex === (currentUnit?.lessons.length ?? 0) - 1
              }
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Contenido scrolleable */}
          <div className="px-4 pb-2">
            <div className={`h-[48vh] sm:h-[56vh] overflow-y-auto rounded-lg border ${border} bg-black/10 grid place-items-center`}>
              <div className="p-6 text-center text-sm opacity-80">
                No hay contenido por ahora.
              </div>
            </div>
          </div>

          {/* Cerrar */}
          <div className={`p-4 border-t ${border} flex justify-center`}>
            <button
              onClick={onClose}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


  // STATES 
  if (loading) {
    return (
      <div className={`min-h-screen ${bg} ${fg} flex items-center justify-center`}>
        <p className="opacity-70">Cargando curso…</p>
      </div>
    )
  }

  if (error || !hasAnyContent) {
    return (
      <div className={`min-h-screen ${bg} ${fg} flex flex-col lg:flex-row relative`}>
        <div className={`flex-1 flex flex-col border-b lg:border-b-0 lg:border-r ${border} transition-all duration-300`}>
          <div className={`border-b ${border} p-4 md:p-8 flex items-center justify-between`}>
            <h1 className="text-lg md:text-2xl font-semibold pr-4">{course.title || "Curso"}</h1>
            <button
              className="text-gray-400 hover:text-white lg:hidden flex-shrink-0"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-xl font-medium">{error ? error : "SIN CONTENIDO"}</p>
              {!error && <p className="text-gray-600 text-sm mt-2">Agrega unidades y lecciones desde el panel de administración.</p>}
            </div>
          </div>
        </div>

        {/* Bottom-sheet */}
        <MobileSheet open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
    )
  }

  // VIEW PRINCIPAL
  return (
    <div className={`min-h-screen ${bg} ${fg} flex flex-col lg:flex-row relative`}>
      <div className={`flex-1 flex flex-col border-b lg:border-b-0 lg:border-r ${border}`}>
        <div className={`border-b ${border} p-4 md:p-8 flex items-center justify-between`}>
          <h1 className="text-lg md:text-2xl font-semibold pr-4">{currentLesson?.title || "Lección"}</h1>
          <button
            className="text-gray-400 hover:text-white lg:hidden flex-shrink-0"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <p className="text-[var(--foreground)] text-base md:text-lg leading-relaxed">
            Sin contenido.
          </p>
        </div>

        <div className={`border-t ${border} p-4 md:p-6 flex items-center justify-end`}>
          <Button
            className="bg-gray-700/70 hover:bg-gray-600/70 text-white text-sm md:text-base disabled:bg-gray-800/30 disabled:text-gray-600"
            onClick={goToNextLesson}
            disabled={!hasNext}
          >
            <span className="truncate">Siguiente: {getNextLessonInfo()}</span>
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Bottom-sheet */}
      <MobileSheet open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Sidebar desktop */}
      <div className="relative hidden lg:flex">
        <aside className={`relative flex flex-col ${sidebarBg} border-l ${border} lg:rounded-l-2xl rounded-t-2xl transition-all duration-300 ${isSidebarOpen ? "w-[400px]" : "w-0"}`}>
          <div className={`transition-opacity duration-300 overflow-hidden ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
            <SidebarContent />
          </div>
        </aside>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden lg:flex items-center justify-center absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 bg-[var(--background)] border border-[var(--border)] rounded-l-md w-10 h-10 hover:bg-gray-800 transition-colors shadow-md z-50"
        >
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  )
}
