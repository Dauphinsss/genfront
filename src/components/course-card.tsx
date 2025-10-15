"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { BookOpen, Users, Clock, ChevronRight } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  students: number;
  progress?: number;
  role: "student" | "teacher" | "admin";
  lastActivity: string;
}

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  
  const router = useRouter();
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {course.title}
            </CardTitle>
            <CardDescription className="text-sm">
              {course.role === "student"
                ? `Instructor: ${course.instructor}`
                : `${course.students} estudiantes`}
            </CardDescription>
          </div>
          <Badge
            variant={course.role === "teacher" ? "default" : "secondary"}
            className="ml-2"
          >
            {course.role === "teacher" ? "Docente" : "Estudiante"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {course.students} estudiantes
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {course.lastActivity}
          </div>
        </div>

        {course.role === "student" && course.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Progreso</span>
              <span>{course.progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}

        <Button
          onClick={() => {router.push(`/page/${course.id}/courses`); }}
          className="w-full bg-secondary text-primary
          group-hover:bg-primary group-hover:text-secondary transition-colors"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Entrar al curso
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
