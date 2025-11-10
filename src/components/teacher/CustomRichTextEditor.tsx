"use client";

import { useRef, useEffect, useState } from "react";
import {
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Minus,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomRichTextEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  editable?: boolean;
  placeholder?: string;
}

interface SlashCommand {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  command: () => void;
  keywords: string[];
}

export function CustomRichTextEditor({
  initialContent = "",
  onChange,
  editable = true,
  placeholder = 'Escribe "/" para comandos...',
}: CustomRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const [slashSearch, setSlashSearch] = useState("");
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  useEffect(() => {
    if (editorRef.current && initialContent && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  const handleChange = () => {
    if (!editorRef.current || !onChange) return;
    onChange(editorRef.current.innerHTML);
  };

  const insertElement = (tagName: string) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    if (!range) return;

    // Crear el nuevo elemento
    const element = document.createElement(tagName);
    element.textContent = "\u00A0"; // Non-breaking space para hacer el elemento editable

    // Insertar el elemento
    range.deleteContents();
    range.insertNode(element);

    // Colocar el cursor dentro del nuevo elemento
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);

    editorRef.current.focus();
    handleChange();
  };

  const insertList = (ordered: boolean) => {
    if (!editorRef.current) return;

    const listTag = ordered ? "ol" : "ul";
    const list = document.createElement(listTag);
    const listItem = document.createElement("li");
    listItem.textContent = "\u00A0";
    list.appendChild(listItem);

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(list);

      // Colocar cursor dentro del li
      range.selectNodeContents(listItem);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    editorRef.current.focus();
    handleChange();
  };

  const insertHR = () => {
    if (!editorRef.current) return;

    const hr = document.createElement("hr");
    const br = document.createElement("br");

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(hr);

      // Insertar un br después del hr para poder continuar escribiendo
      hr.after(br);

      // Colocar cursor después del hr
      range.setStartAfter(hr);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    editorRef.current.focus();
    handleChange();
  };

  const slashCommands: SlashCommand[] = [
    {
      label: "Texto",
      icon: Type,
      command: () => insertElement("p"),
      keywords: ["texto", "parrafo", "text", "paragraph"],
    },
    {
      label: "Encabezado 1",
      icon: Heading1,
      command: () => insertElement("h1"),
      keywords: ["h1", "encabezado", "titulo", "heading"],
    },
    {
      label: "Encabezado 2",
      icon: Heading2,
      command: () => insertElement("h2"),
      keywords: ["h2", "encabezado", "subtitulo", "heading"],
    },
    {
      label: "Encabezado 3",
      icon: Heading3,
      command: () => insertElement("h3"),
      keywords: ["h3", "encabezado", "heading"],
    },
    {
      label: "Lista con viñetas",
      icon: List,
      command: () => insertList(false),
      keywords: ["lista", "viñetas", "bullet", "list"],
    },
    {
      label: "Lista numerada",
      icon: ListOrdered,
      command: () => insertList(true),
      keywords: ["lista", "numerada", "numbered", "ordered"],
    },
    {
      label: "Cita",
      icon: Quote,
      command: () => insertElement("blockquote"),
      keywords: ["cita", "quote", "blockquote"],
    },
    {
      label: "Código",
      icon: Code,
      command: () => insertElement("pre"),
      keywords: ["codigo", "code", "pre"],
    },
    {
      label: "Separador",
      icon: Minus,
      command: () => insertHR(),
      keywords: ["separador", "linea", "divider", "hr"],
    },
  ];

  const filteredCommands = slashCommands.filter(
    (cmd) =>
      cmd.keywords.some((keyword) =>
        keyword.includes(slashSearch.toLowerCase())
      ) || cmd.label.toLowerCase().includes(slashSearch.toLowerCase())
  );

  const getCaretCoordinates = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return { top: 0, left: 0 };

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    return {
      top: rect.bottom,
      left: rect.left,
    };
  };

  const handleInput = () => {
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textBeforeCursor =
        range.startContainer.textContent?.slice(0, range.startOffset) || "";

      // Detectar si se escribió "/"
      const slashMatch = textBeforeCursor.match(/\/(\w*)$/);

      if (slashMatch) {
        setSlashSearch(slashMatch[1]);
        setShowSlashMenu(true);
        setSelectedCommandIndex(0);
        const coords = getCaretCoordinates();
        setSlashMenuPosition(coords);
      } else {
        setShowSlashMenu(false);
      }
    }

    handleChange();
  };

  const executeSlashCommand = (command: SlashCommand) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textNode = range.startContainer;
      const textBeforeCursor =
        textNode.textContent?.slice(0, range.startOffset) || "";
      const slashMatch = textBeforeCursor.match(/\/(\w*)$/);

      if (slashMatch && textNode.nodeType === Node.TEXT_NODE) {
        const slashIndex = range.startOffset - slashMatch[0].length;

        // Crear un nuevo rango que seleccione desde el "/" hasta el cursor actual
        const deleteRange = document.createRange();
        deleteRange.setStart(textNode, slashIndex);
        deleteRange.setEnd(textNode, range.startOffset);

        // Eliminar el contenido seleccionado (el "/" y el texto de búsqueda)
        deleteRange.deleteContents();

        // Actualizar el rango y la selección
        range.setStart(textNode, slashIndex);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    setShowSlashMenu(false);
    setSlashSearch("");

    // Ejecutar el comando después de limpiar
    setTimeout(() => {
      command.command();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!showSlashMenu) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedCommandIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedCommandIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCommands[selectedCommandIndex]) {
          executeSlashCommand(filteredCommands[selectedCommandIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowSlashMenu(false);
        setSlashSearch("");
        break;
    }
  };

  if (!editable) {
    return (
      <div
        className="prose prose-sm dark:prose-invert max-w-none p-4 dark:text-white text-black overflow-y-auto h-full"
        dangerouslySetInnerHTML={{ __html: initialContent }}
      />
    );
  }

  return (
    <div className="overflow-visible bg-background relative h-full flex flex-col">
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={editable}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "flex-1 p-4 outline-none overflow-y-auto",
          "prose prose-sm dark:prose-invert max-w-none",
          "dark:text-white text-black",
          "focus:outline-none",
          !editorRef.current?.innerHTML &&
            !isFocused &&
            "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
        )}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      {/* Slash Command Menu */}
      {showSlashMenu && filteredCommands.length > 0 && (
        <div
          className="fixed z-9999 w-64 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
          style={{
            top: `${slashMenuPosition.top + 4}px`,
            left: `${slashMenuPosition.left}px`,
          }}
        >
          <div className="py-1">
            {filteredCommands.map((cmd, index) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={index}
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 flex items-center gap-3 text-left text-sm hover:bg-accent transition-colors",
                    index === selectedCommandIndex && "bg-accent"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    executeSlashCommand(cmd);
                  }}
                  onMouseEnter={() => setSelectedCommandIndex(index)}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{cmd.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
