"use client";
import { useEffect, useState } from "react";
import { getActiveCourseBase } from "@/services/courseBase";
import type { Unit } from "@/services/units";
import { Loading } from "@/components/ui/loading";
import CourseBaseViewer, { CourseData } from "./CourseBaseViewer";

export default function CourseBaseView() {
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      setError(null);
      try {
        const data = await getActiveCourseBase();
        const safeUnits: Unit[] = (data.units ?? [])
          .filter((u: unknown): u is Unit =>
            typeof u === "object" &&
            u !== null &&
            "id" in u &&
            "title" in u &&
            "index" in u &&
            "courseBaseId" in u
          )
          .map((unit) => ({
            ...unit,
            lessons: Array.isArray((unit as Unit).lessons) ? (unit as Unit).lessons : [],
          }));
        setCourse({ id: data.id, title: data.title, units: safeUnits });
      } catch {
        setError("No se pudo cargar el curso desde el backend.");
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, []);

  if (loading) {
    return <Loading />;
  }
  if (error || !course || !course.units || !course.units.length) {
    return <div className="min-h-screen flex items-center justify-center">{error || "SIN CONTENIDO"}</div>;
  }

  return <CourseBaseViewer course={course} />;
}