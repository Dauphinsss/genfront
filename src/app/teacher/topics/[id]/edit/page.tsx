"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { TopicEditorResizable } from "@/components/teacher/TopicEditorResizable";
import { getTopicById } from "@/services/topics";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import type { Topic } from "@/types/topic";

export default function EditTopicPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const theme = document.documentElement.classList.contains("dark");
    setIsDark(theme);

    // Prevent body scroll when editor is mounted
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      // Re-enable scrolling when editor unmounts
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const loadTopic = async () => {
      try {
        setIsLoading(true);
        const topicId = Number(params.id);
        if (isNaN(topicId)) {
          throw new Error("ID de tópico inválido");
        }
        const data = await getTopicById(topicId);
        setTopic(data);
      } catch (error) {
        console.error("Error loading topic:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar el tópico",
          variant: "destructive",
        });
        router.push("/teacher/topics");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadTopic();
    }
  }, [params.id, router, toast]);

  const handleToggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSave = async () => {
    toast({
      title: "Cambios guardados",
      description: "El tópico fue actualizado correctamente",
      variant: "success",
    });
    router.push("/teacher/topics");
  };

  const handleCancel = () => {
    router.push("/teacher/topics");
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!topic) {
    return null;
  }

  return (
    <TopicEditorResizable
      topic={topic}
      isNewTopic={false}
      onSave={handleSave}
      onCancel={handleCancel}
      onToggleTheme={handleToggleTheme}
      isDark={isDark}
    />
  );
}
