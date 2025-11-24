"use client"

import { BookOpen, CheckCircle2, Settings, ChevronLeft, ChevronRight, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCourse } from "@/lib/course-context"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { StudentTopicView } from "./StudentTopicView"

export default function CourseBase() {
  const { course, currentUnitIndex, currentLessonIndex, currentTopicIndex, setCurrentTopic, goToNextTopic } =
    useCourse()

  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const currentUnit = course.units[currentUnitIndex]
  const currentLesson = currentUnit?.lessons[currentLessonIndex]
  const currentTopic = currentLesson?.topics[currentTopicIndex]

  const hasAnyContent = course.units.some((unit) => unit.lessons.some((lesson) => lesson.topics.length > 0))

  const hasNext =
    currentTopicIndex < currentLesson?.topics.length - 1 ||
    currentLessonIndex < currentUnit?.lessons.length - 1 ||
    currentUnitIndex < course.units.length - 1

  const getNextTopicInfo = () => {
    if (currentTopicIndex < currentLesson?.topics.length - 1) {
      return currentLesson.topics[currentTopicIndex + 1].title
    } else if (currentLessonIndex < currentUnit?.lessons.length - 1) {
      return currentUnit.lessons[currentLessonIndex + 1].topics[0]?.title || "Siguiente lección"
    } else if (currentUnitIndex < course.units.length - 1) {
      return course.units[currentUnitIndex + 1].lessons[0]?.topics[0]?.title || "Siguiente unidad"
    }
    return "Finalizado"
  }

  const goToPreviousLesson = () => {
    let targetUnitIndex = currentUnitIndex
    let targetLessonIndex = currentLessonIndex - 1

    if (targetLessonIndex < 0) {
      if (currentUnitIndex > 0) {
        targetUnitIndex = currentUnitIndex - 1
        targetLessonIndex = course.units[targetUnitIndex].lessons.length - 1
      } else {
        return
      }
    }

    while (targetUnitIndex >= 0) {
      const targetUnit = course.units[targetUnitIndex]
      while (targetLessonIndex >= 0) {
        const targetLesson = targetUnit.lessons[targetLessonIndex]
        if (targetLesson.topics.length > 0) {
          setCurrentTopic(targetUnitIndex, targetLessonIndex, 0)
          return
        }
        targetLessonIndex--
      }
      targetUnitIndex--
      if (targetUnitIndex >= 0) {
        targetLessonIndex = course.units[targetUnitIndex].lessons.length - 1
      }
    }
  }

  const goToNextLesson = () => {
    let targetUnitIndex = currentUnitIndex
    let targetLessonIndex = currentLessonIndex + 1

    if (targetLessonIndex >= currentUnit.lessons.length) {
      if (currentUnitIndex < course.units.length - 1) {
        targetUnitIndex = currentUnitIndex + 1
        targetLessonIndex = 0
      } else {
        return
      }
    }

    while (targetUnitIndex < course.units.length) {
      const targetUnit = course.units[targetUnitIndex]
      while (targetLessonIndex < targetUnit.lessons.length) {
        const targetLesson = targetUnit.lessons[targetLessonIndex]
        if (targetLesson.topics.length > 0) {
          setCurrentTopic(targetUnitIndex, targetLessonIndex, 0)
          return
        }
        targetLessonIndex++
      }
      targetUnitIndex++
      targetLessonIndex = 0
    }
  }

  const getAllTopicsInLesson = () => currentLesson?.topics || []

  const bg = "bg-[var(--background)]"
  const fg = "text-[var(--foreground)]"
  const border = "border-[var(--border)]"
  const sidebarBg = "bg-[var(--sidebar)]"

  if (!hasAnyContent) {
    return (
      <div className={`h-screen overflow-hidden ${bg} ${fg} flex flex-col relative`}>
        {/* Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`border-b ${border} p-4 md:p-8 flex items-center justify-between`}>
            <div className="h-8 bg-gray-500/30 rounded w-64 animate-pulse"></div>
          </div>
          <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
            <div className="text-center space-y-4">
              <p className="text-gray-500 text-2xl font-medium">SIN CONTENIDO</p>
              <p className="text-gray-600 text-sm">Agrega contenido desde el panel de administración</p>
            </div>
          </div>
          <div className={`border-t ${border} p-4 md:p-6 flex items-center justify-end`}>
            <Button className="bg-gray-700/30 text-gray-600 cursor-not-allowed text-sm md:text-base" disabled>
              Siguiente
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-2 flex-shrink-0" />
            </Button>
          </div>
        </div>

        {/* Sidebar compacto flotante */}
        <div className={`fixed top-4 right-4 z-50 w-[320px] ${sidebarBg} border ${border} rounded-xl shadow-2xl transition-all duration-300 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[400px] pointer-events-none'}`}>
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-black" />
              </div>
              <h2 className="text-sm font-medium line-clamp-1">{course.title}</h2>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg p-3 bg-gray-800/30 animate-pulse">
                  <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-border/50 p-3">
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => router.push("/admin")}>
              <Settings className="w-3 h-3 mr-1" />
              Administrar
            </Button>
          </div>
        </div>

        {/* Botón flotante para abrir el sidebar */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`fixed top-4 right-4 z-50 ${sidebarBg} border ${border} rounded-lg p-3 shadow-lg hover:scale-110 transition-transform`}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`h-screen overflow-hidden ${bg} ${fg} flex flex-col relative`}>
      {/* Contenido principal - ocupa toda la pantalla */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Título del tópico */}
        <div className={`border-b ${border} p-4 md:p-8 flex items-center justify-between`}>
          <h1 className="text-lg md:text-2xl font-semibold pr-4">{currentTopic?.title}</h1>
        </div>

        {/* Vista del contenido del tópico */}
        <div className="flex-1 overflow-hidden">
          <StudentTopicView
            title={currentTopic?.title || ''}
            description={currentTopic?.description}
            content={currentTopic?.content}
          />
        </div>

        {/* Botón siguiente */}
        <div className={`border-t ${border} p-4 md:p-6 flex items-center justify-end`}>
          <Button
            className="bg-gray-700/70 hover:bg-gray-600/70 text-white text-sm md:text-base disabled:bg-gray-800/30 disabled:text-gray-600"
            onClick={goToNextTopic}
            disabled={!hasNext}
          >
            <span className="truncate">Siguiente: {getNextTopicInfo()}</span>
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-2 flex-shrink-0" />
          </Button>
        </div>
      </div>

      {/* Sidebar compacto flotante en la esquina superior derecha */}
      <div className={`fixed top-4 right-4 z-50 w-[320px] ${sidebarBg} border ${border} rounded-xl shadow-2xl transition-all duration-300 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[400px] pointer-events-none'}`}>
        {/* Header compacto */}
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-black" />
            </div>
            <h2 className="text-sm font-medium line-clamp-1">{course.title}</h2>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navegación de lección */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <button className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed p-1" onClick={goToPreviousLesson} disabled={currentUnitIndex === 0 && currentLessonIndex === 0}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center flex-1 px-2 min-w-0">
              <div className="text-xs font-semibold mb-0.5">{currentUnit.title}</div>
              <div className="text-xs text-muted-foreground truncate">{currentLesson.title}</div>
            </div>
            <button className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed p-1" onClick={goToNextLesson} disabled={currentUnitIndex === course.units.length - 1 && currentLessonIndex === currentUnit.lessons.length - 1}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lista de tópicos - máximo 300px de alto con scroll */}
        <div className="max-h-[300px] overflow-y-auto p-4">
          <div className="space-y-1">
            {getAllTopicsInLesson().map((topic, index) => {
              const isActive = index === currentTopicIndex
              return (
                <div
                  key={topic.id}
                  className={`rounded-lg p-2.5 flex items-center gap-2 cursor-pointer transition-colors text-sm ${isActive ? "bg-[var(--sidebar-primary)]" : "hover:bg-[var(--sidebar-accent)]"}`}
                  onClick={() => {
                    setCurrentTopic(currentUnitIndex, currentLessonIndex, index)
                  }}
                >
                  <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[var(--sidebar-primary-foreground)]" : "text-[var(--sidebar-foreground)]"}`} />
                  <span className={`${isActive ? "text-[var(--sidebar-primary-foreground)] font-medium" : "text-[var(--sidebar-foreground)]"} line-clamp-2`}>{topic.title}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Botón administrar */}
        <div className="border-t border-border/50 p-3">
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => router.push("/admin")}>
            <Settings className="w-3 h-3 mr-1" />
            Administrar
          </Button>
        </div>
      </div>

      {/* Botón flotante para abrir el sidebar cuando está cerrado */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`fixed top-4 right-4 z-50 ${sidebarBg} border ${border} rounded-lg p-3 shadow-lg hover:scale-110 transition-transform`}
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
