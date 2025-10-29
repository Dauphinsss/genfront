"use client"

import { BookOpen, CheckCircle2, Settings, ChevronLeft, ChevronRight, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCourse } from "@/lib/course-context"
import { useRouter } from "next/navigation"
import { useState } from "react"

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
  const sidebarFg = "text-[var(--sidebar-foreground)]"

  if (!hasAnyContent) {
    return (
      <div className={`min-h-screen ${bg} ${fg} flex flex-col lg:flex-row relative`}>
        {}
        <div className={`flex-1 flex flex-col border-b lg:border-b-0 lg:border-r ${border} transition-all duration-300 ${isSidebarOpen ? "lg:mr-[400px]" : "lg:mr-0"}`}>
          <div className={`border-b ${border} p-4 md:p-8 flex items-center justify-between`}>
            <div className="h-8 bg-gray-500/30 rounded w-64 animate-pulse"></div>
            <button className="text-gray-400 hover:text-white lg:hidden flex-shrink-0" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
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

        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

        {}
        <div className={`fixed lg:fixed inset-y-0 right-0 z-50 w-full sm:w-[380px] lg:w-[400px] flex flex-col ${sidebarBg} transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "translate-x-full"} border-l ${border}`}>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden lg:block absolute -left-8 top-1/2 -translate-y-1/2 bg-[var(--background)] border ${border} rounded-l-lg p-2 hover:bg-gray-800 transition-colors z-10">
            {isSidebarOpen ? <ChevronRight className="w-4 h-4 text-gray-400" /> : <ChevronLeft className="w-4 h-4 text-gray-400" />}
          </button>
          <div className="p-4 md:p-6 border-b ${border}">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-black" />
              </div>
              <div className={`${sidebarFg} text-sm md:text-base font-medium line-clamp-2`}>{course.title}</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg p-3 md:p-4 bg-gray-800/30 animate-pulse">
                  <div className="h-5 bg-gray-700/50 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t ${border} p-4">
            <Button variant="outline" className={`w-full border-white/20 ${sidebarFg} hover:bg-white hover:text-black bg-transparent`} onClick={() => router.push("/admin")}>
              <Settings className="w-4 h-4 mr-2" />
              Administrar Curso
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bg} ${fg} flex flex-col lg:flex-row relative`}>
      {}
      <div className={`flex-1 flex flex-col border-b lg:border-b-0 lg:border-r ${border}`}>
        {}
        <div className={`border-b ${border} p-4 md:p-8 flex items-center justify-between`}>
          <h1 className="text-lg md:text-2xl font-semibold pr-4">{currentTopic?.title}</h1>
          <button className="text-gray-400 hover:text-white lg:hidden flex-shrink-0" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <p className="text-[var(--foreground)] text-base md:text-lg leading-relaxed">{currentTopic?.description}</p>
        </div>

        {}
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

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {}
      <div className={`transition-all duration-300 overflow-hidden ${isSidebarOpen ? "w-full sm:w-[380px] lg:w-[400px]" : "w-0"} flex flex-col ${sidebarBg} border-l ${border} lg:rounded-l-2xl rounded-t-2xl`}>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden lg:block absolute -left-8 top-1/2 -translate-y-1/2 bg-[var(--background)] border ${border} rounded-l-lg p-2 hover:bg-gray-800 transition-colors z-10">
          {isSidebarOpen ? <ChevronRight className="w-4 h-4 text-gray-400" /> : <ChevronLeft className="w-4 h-4 text-gray-400" />}
        </button>

        {}
        <div className="p-4 md:p-6 border-b ${border}">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-black" />
            </div>
            <h2 className="text-sm md:text-base font-medium line-clamp-2">{course.title}</h2>
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <button className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed p-1" onClick={goToPreviousLesson} disabled={currentUnitIndex === 0 && currentLessonIndex === 0}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center flex-1 px-2 min-w-0">
              <div className="text-[var(--sidebar-accent-foreground)] text-xs md:text-sm font-semibold mb-1">{currentUnit.title}</div>
              <div className="text-xs md:text-sm text-[var(--sidebar-foreground)] truncate">{currentLesson.title}</div>
            </div>
            <button className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed p-1" onClick={goToNextLesson} disabled={currentUnitIndex === course.units.length - 1 && currentLessonIndex === currentUnit.lessons.length - 1}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {getAllTopicsInLesson().map((topic, index) => {
              const isActive = index === currentTopicIndex
              return (
                <div
                  key={topic.id}
                  className={`rounded-lg p-3 md:p-4 flex items-center gap-3 cursor-pointer transition-colors ${isActive ? "bg-[var(--sidebar-primary)]" : "hover:bg-[var(--sidebar-accent)]"}`}
                  onClick={() => {
                    setCurrentTopic(currentUnitIndex, currentLessonIndex, index)
                    setIsSidebarOpen(false)
                  }}
                >
                  <CheckCircle2 className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 ${isActive ? "text-[var(--sidebar-primary-foreground)]" : "text-[var(--sidebar-foreground)]"}`} />
                  <span className={`text-sm md:text-base ${isActive ? "text-[var(--sidebar-primary-foreground)] font-medium" : "text-[var(--sidebar-foreground)]"}`}>{topic.title}</span>
                </div>
              )
            })}
          </div>
        </div>

        {}
        <div className={`border-t border-[var(--sidebar)] p-4`}>
          <Button variant="outline" className={`w-full text-white hover:bg-white hover:text-black bg-transparent`} onClick={() => router.push("/admin")}>
            <Settings className="w-4 h-4 mr-2" />
            Administrar Curso
          </Button>
        </div>
      </div>
    </div>
  )
}
