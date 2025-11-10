"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Moon, Sun } from "lucide-react";
import { createTopic, getTopicById } from "@/services/topics";
import { useToast } from "@/hooks/use-toast";
import { TopicEditorResizable } from "@/components/teacher/TopicEditorResizable";
import { TemplateSelector } from "@/components/teacher/TemplateSelector";
import type { Topic } from "@/types/topic";
import type { TemplateType } from "@/types/content-blocks";
import Link from "next/link";

export default function NewTopicPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "editor">("form");
  const [isCreating, setIsCreating] = useState(false);
  const [topicName, setTopicName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<
    TemplateType | undefined
  >();
  const [createdTopic, setCreatedTopic] = useState<Topic | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Detectar de dónde viene el usuario
  const returnUrl = searchParams.get("return") || "/teacher/topics";

  useEffect(() => {
    // Check initial theme
    const theme = document.documentElement.classList.contains("dark");
    setIsDark(theme);

    // Prevent body scroll
    if (step === "editor") {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }

    return () => {
      // Re-enable scrolling when component unmounts
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [step]);

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

  const handleCreate = async () => {
    if (!topicName.trim()) {
      toast({
        title: "Error",
        description: "El nombre del tópico es requerido",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Debes seleccionar una plantilla",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const newTopic = await createTopic({
        name: topicName,
        type: "content",
      });

      // Cargar el topic completo
      const fullTopic = await getTopicById(newTopic.id);
      setCreatedTopic(fullTopic);
      setStep("editor");
    } catch (error) {
      console.error("Error creating topic:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al crear el tópico",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveFromEditor = () => {
    toast({
      title: "Tópico creado",
      description: "El tópico fue creado correctamente",
      variant: "success",
    });
    router.push(returnUrl);
  };

  const handleCancel = () => {
    router.push(returnUrl);
  };

  if (step === "editor" && createdTopic) {
    return (
      <TopicEditorResizable
        topic={createdTopic}
        isNewTopic={true}
        initialTemplate={selectedTemplate}
        onSave={handleSaveFromEditor}
        onCancel={handleCancel}
        onToggleTheme={handleToggleTheme}
        isDark={isDark}
      />
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      {/* Logo y controles superiores */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/"
          className="text-2xl font-bold text-foreground hover:text-foreground/80 transition-colors"
        >
          Pyson
        </Link>
      </div>

      <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleTheme}
          title={isDark ? "Modo claro" : "Modo oscuro"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={isCreating || !topicName.trim() || !selectedTemplate}
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creando...
            </>
          ) : (
            "Crear Tópico"
          )}
        </Button>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-5xl space-y-6">
          {/* Nombre del tópico */}
          <div className="w-full flex flex-col items-center space-y-3 pb-10">
            <h2 className="text-2xl font-bold text-foreground">
              ¿Cómo se llamará tu tópico?
            </h2>
            <Input
              id="topic-name"
              type="text"
              placeholder="Ej: Introducción a Python"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              className="text-center text-base h-10 w-full max-w-lg"
              autoFocus
              disabled={isCreating}
            />
          </div>

          {/* Selector de plantillas */}
          <div className="w-full">
            <TemplateSelector
              selected={selectedTemplate}
              onSelect={setSelectedTemplate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
