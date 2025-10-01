"use client";

import { useRouter } from "next/navigation";
import { useBlocksEditor } from "@/hooks/use-blockEditor";
import BlockRow from "@/components/topics/editor/block-row";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Topic } from "@/types/editor";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

async function createTopicAPI({
  courseId,
  kind,
  title,
  text,
  imageUrl,
}: {
  courseId: string;
  kind: "TEXT" | "IMAGE";
  title: string;
  text?: string;
  imageUrl?: string;
}) {
  const res = await fetch(`${API}/api/topics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // si tu backend usa cookies/sesión:
    // credentials: "include",
    body: JSON.stringify({
      courseId,  
      title,
      kind,
      // evita mandar string vacío si el backend valida "required & non-empty"
      text: kind === "TEXT" ? (text?.trim() || undefined) : undefined,
      imageUrl: kind === "IMAGE" ? imageUrl : undefined,
      // si tu backend requiere courseId en el body además del path, inclúyelo:
      // courseId
    }),
  });

  if (!res.ok) {
    let msg = "Error al crear el tópico";
    try {
      const j = await res.json();
      msg = j?.error || j?.message || msg;
    } catch {}
    throw new Error(msg + ` (HTTP ${res.status})`);
  }
  return (await res.json()) as Topic;
}

async function uploadImageAPI(file: File) {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API}/api/uploads`, {
    method: "POST",
    // credentials: "include",
    body: fd,
  });
  if (!res.ok) {
    let msg = "Error al subir la imagen";
    try {
      const j = await res.json();
      msg = j?.error || j?.message || msg;
    } catch {}
    throw new Error(msg + ` (HTTP ${res.status})`);
  }
  const data = await res.json();
  return data.url as string;
}

export default function NewTopicEditor({
  courseId,
  onCreated,
}: {
  courseId: string;
  onCreated?: (t: Topic) => void;
}) {
  const router = useRouter();
  const {
    title, setTitle,
    blocks,
    saving, setSaving,
    error, setError,
    pageRef, textRefs,
    autoResize, updateBlock,
    removeBlock,
    handlePaste, handleDrop,
    onTextKeyDown, setFocusIndex,
    openPickerThenInsert,
  } = useBlocksEditor();

  async function onSave() {
    setError(null);
    if (!title.trim()) return setError("El título es obligatorio.");

    try {
      setSaving(true);

      // Subir imagenes 
      const withUrls = await Promise.all(
        blocks.map(async (b) => {
          if (b.kind === "IMAGE" && !b.uploadedUrl) {
            if (!b.file) throw new Error("Hay un bloque de IMAGEN sin archivo.");
            const url = await uploadImageAPI(b.file);
            return { ...b, uploadedUrl: url };
          }
          return b;
        })
      );

      let firstCreated: Topic | null = null;
      
      // Crear topicos 
      for (const b of withUrls) {
        if (b.kind === "TEXT") {
          const content = b.content?.trim();
          if (!content) continue;
          const created = await createTopicAPI({
            courseId,
            title,
            kind: "TEXT",
            text: content,
          });
          if (!firstCreated) firstCreated = created;
        } else {
          if (!b.uploadedUrl) throw new Error("Falta URL de imagen subida.");
          const created = await createTopicAPI({
            courseId,
            title,
            kind: "IMAGE",
            imageUrl: b.uploadedUrl,
          });
          if (!firstCreated) firstCreated = created;
        }
      }

      if (firstCreated && onCreated) {
        onCreated(firstCreated);
      }
    } catch (e: any) {
      setError(e.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4 sm:p-6 max-w-3xl mx-auto">
      <input
        placeholder="Título..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-2xl font-semibold bg-transparent outline-none placeholder:text-muted-foreground/70 mb-2"
      />

      <div
        ref={pageRef}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="bg-card text-card-foreground rounded-lg p-4 sm:p-6 min-h-[280px]"
      >
        {blocks.map((b, index) => (
          <BlockRow
            key={b.id}
            block={b}
            index={index}
            setFocusIndex={setFocusIndex}
            openPickerThenInsert={openPickerThenInsert}
            removeBlock={removeBlock}
            onTextKeyDown={onTextKeyDown}
            updateBlock={updateBlock}
            autoResize={autoResize}
            textRefs={textRefs}
          />
        ))}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex justify-start mt-4">
        <Button
          onClick={onSave}
          disabled={saving}
          variant="default"
          size="lg"
          className="px-6"
        >
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="animate-spin" /> Guardando...
            </span>
          ) : (
            "Guardar"
          )}
        </Button>
      </div>
    </div>
  );
}
