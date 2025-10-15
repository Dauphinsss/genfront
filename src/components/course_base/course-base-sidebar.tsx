"use client"

import { useCourse } from "@/lib/course-context"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

export function AdminSidebar() {
  const { course } = useCourse()
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set())
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())

  const toggleUnit = (unitId: string) => {
    const newExpanded = new Set(expandedUnits)
    if (newExpanded.has(unitId)) newExpanded.delete(unitId)
    else newExpanded.add(unitId)
    setExpandedUnits(newExpanded)
  }

  const toggleLesson = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons)
    if (newExpanded.has(lessonId)) newExpanded.delete(lessonId)
    else newExpanded.add(lessonId)
    setExpandedLessons(newExpanded)
  }

  if (!course) return <div className="w-80 p-4 text-sm text-muted-foreground">Cargando curso...</div>

  return (
    <div className="w-80 border-l border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col h-screen sticky top-0">
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-sm font-semibold text-sidebar-accent-foreground mb-4 uppercase tracking-wider">
          Estructura del Curso
        </h2>

        <div className="space-y-2">
          {course.units.map((unit) => (
            <div key={unit.id}>
              <button
                onClick={() => toggleUnit(unit.id)}
                className="w-full flex items-center gap-2 p-2 rounded hover:bg-sidebar-accent/20 transition-colors text-left"
              >
                {expandedUnits.has(unit.id) ? (
                  <ChevronDown className="w-4 h-4 text-sidebar-accent-foreground flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-sidebar-accent-foreground flex-shrink-0" />
                )}
                <span className="text-sm font-medium truncate">{unit.title}</span>
                <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                  {unit.lessons.length}
                </span>
              </button>

              {expandedUnits.has(unit.id) && (
                <div className="ml-6 mt-1 space-y-1">
                  {unit.lessons.map((lesson) => (
                    <div key={lesson.id}>
                      <button
                        onClick={() => toggleLesson(lesson.id)}
                        className="w-full flex items-center gap-2 p-2 rounded hover:bg-sidebar-accent/10 transition-colors text-left"
                      >
                        {expandedLessons.has(lesson.id) ? (
                          <ChevronDown className="w-3 h-3 text-sidebar-accent-foreground flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-sidebar-accent-foreground flex-shrink-0" />
                        )}
                        <span className="text-xs text-muted-foreground truncate">
                          {lesson.title}
                        </span>
                      </button>

                      {expandedLessons.has(lesson.id) && (
                        <div className="ml-5 mt-1 space-y-1">
                          {lesson.topics.length
                            ? lesson.topics.map((topic, idx) => (
                                <div
                                  key={topic.id}
                                  className="flex items-center gap-2 p-1.5 pl-3 rounded hover:bg-sidebar-accent/10 transition-colors"
                                >
                                  <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                                  <span className="text-xs truncate">{topic.title}</span>
                                </div>
                              ))
                            : (
                              <div className="p-1.5 pl-3">
                                <span className="text-xs text-muted-foreground italic">Sin tópicos</span>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
                  {unit.lessons.length === 0 && (
                    <div className="p-2 pl-4">
                      <span className="text-xs text-muted-foreground italic">Sin lecciones</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {course.units.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-xs">No hay unidades creadas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
