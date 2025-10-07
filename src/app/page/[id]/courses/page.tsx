"use client";

import { useParams } from "next/navigation";
import CourseView from "@/components/course/course-view";

export default function CoursePage() {
  const { id } = useParams<{ id: string }>(); 
  if (!id) return <div className="p-6">cargando…</div>;
  return <CourseView courseId={id} />;
}
