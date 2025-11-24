"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { ContentDocument } from "@/types/content-blocks"

export interface Topic {
  id: string
  title: string
  description: string
  content?: ContentDocument
}

export interface Lesson {
  id: string
  title: string
  topics: Topic[]
}

export interface Unit {
  id: string
  title: string
  lessons: Lesson[]
}

export interface Course {
  id: string
  title: string
  units: Unit[]
}

interface CourseContextType {
  course: Course
  currentUnitIndex: number
  currentLessonIndex: number
  currentTopicIndex: number
  setCurrentTopic: (unitIndex: number, lessonIndex: number, topicIndex: number) => void
  goToNextTopic: () => void
  goToPreviousTopic: () => void
  updateCourse: (course: Course) => void
}

const CourseContext = createContext<CourseContextType | undefined>(undefined)

const defaultCourse: Course = {
  id: "5",
  title: "Introducción a Ciencias de la Computación",
  units: [
    {
      id: "unit-1",
      title: "UNIDAD 1",
      lessons: [
        {
          id: "lesson-1",
          title: "Lección 1: Expresiones aritméticas",
          topics: [
            {
              id: "topic-1",
              title: "Operadores aritméticos",
              description:
                "Aprende sobre los operadores básicos de Python para realizar cálculos matemáticos. Los operadores aritméticos incluyen suma (+), resta (-), multiplicación (*), división (/), módulo (%), exponenciación (**) y división entera (//).",
            },
            {
              id: "topic-2",
              title: "Funciones integradas",
              description:
                "Explora las funciones matemáticas integradas en Python como abs(), round(), pow(), min(), max() y sum(). Estas funciones te permiten realizar operaciones matemáticas comunes de manera eficiente.",
            },
            {
              id: "topic-3",
              title: "Rastreo de expresiones",
              description:
                "Aprende a evaluar expresiones paso a paso siguiendo el orden de operaciones. Comprende cómo Python procesa las expresiones matemáticas complejas y la precedencia de operadores.",
            },
          ],
        },
      ],
    },
  ],
}

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [course, setCourse] = useState<Course>(defaultCourse)
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0)
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0)

  useEffect(() => {
    const savedCourse = localStorage.getItem("course-data")
    const savedPosition = localStorage.getItem("course-position")

    if (savedCourse) {
      setCourse(JSON.parse(savedCourse))
    }

    if (savedPosition) {
      const position = JSON.parse(savedPosition)
      setCurrentUnitIndex(position.unitIndex)
      setCurrentLessonIndex(position.lessonIndex)
      setCurrentTopicIndex(position.topicIndex)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("course-data", JSON.stringify(course))
  }, [course])

  useEffect(() => {
    localStorage.setItem(
      "course-position",
      JSON.stringify({
        unitIndex: currentUnitIndex,
        lessonIndex: currentLessonIndex,
        topicIndex: currentTopicIndex,
      }),
    )
  }, [currentUnitIndex, currentLessonIndex, currentTopicIndex])

  const setCurrentTopic = (unitIndex: number, lessonIndex: number, topicIndex: number) => {
    setCurrentUnitIndex(unitIndex)
    setCurrentLessonIndex(lessonIndex)
    setCurrentTopicIndex(topicIndex)
  }

  const goToNextTopic = () => {
    const currentUnit = course.units[currentUnitIndex]
    const currentLesson = currentUnit.lessons[currentLessonIndex]

    if (currentTopicIndex < currentLesson.topics.length - 1) {
      setCurrentTopicIndex(currentTopicIndex + 1)
    }
    else if (currentLessonIndex < currentUnit.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1)
      setCurrentTopicIndex(0)
    }
    else if (currentUnitIndex < course.units.length - 1) {
      setCurrentUnitIndex(currentUnitIndex + 1)
      setCurrentLessonIndex(0)
      setCurrentTopicIndex(0)
    }
  }

  const goToPreviousTopic = () => {
    if (currentTopicIndex > 0) {
      setCurrentTopicIndex(currentTopicIndex - 1)
    }
    else if (currentLessonIndex > 0) {
      const prevLesson = course.units[currentUnitIndex].lessons[currentLessonIndex - 1]
      setCurrentLessonIndex(currentLessonIndex - 1)
      setCurrentTopicIndex(prevLesson.topics.length - 1)
    }
    else if (currentUnitIndex > 0) {
      const prevUnit = course.units[currentUnitIndex - 1]
      const lastLesson = prevUnit.lessons[prevUnit.lessons.length - 1]
      setCurrentUnitIndex(currentUnitIndex - 1)
      setCurrentLessonIndex(prevUnit.lessons.length - 1)
      setCurrentTopicIndex(lastLesson.topics.length - 1)
    }
  }

  const updateCourse = (newCourse: Course) => {
    setCourse(newCourse)
    setCurrentUnitIndex(0)
    setCurrentLessonIndex(0)
    setCurrentTopicIndex(0)
  }

  return (
    <CourseContext.Provider
      value={{
        course,
        currentUnitIndex,
        currentLessonIndex,
        currentTopicIndex,
        setCurrentTopic,
        goToNextTopic,
        goToPreviousTopic,
        updateCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  )
}

export function useCourse() {
  const context = useContext(CourseContext)
  if (context === undefined) {
    throw new Error("useCourse must be used within a CourseProvider")
  }
  return context
}
