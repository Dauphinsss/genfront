'use client';

import { useEffect, useMemo } from 'react';
import { BlockNoteEditor, PartialBlock } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';

interface BlockNoteEditorProps {
  initialContent?: PartialBlock[];
  onChange?: (blocks: PartialBlock[]) => void;
  editable?: boolean;
}

export function BlockNoteEditorComponent({ 
  initialContent, 
  onChange, 
  editable = true 
}: BlockNoteEditorProps) {
  // Memoizar el contenido inicial válido
  const validInitialContent = useMemo(() => {
    // Si no hay contenido, o es un array vacío, retornar undefined
    if (!initialContent || initialContent.length === 0) {
      return undefined;
    }
    
    // Validar que sea un array con bloques válidos
    try {
      return initialContent.filter(block => 
        block && typeof block === 'object' && 'type' in block
      );
    } catch {
      return undefined;
    }
  }, [initialContent]);

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: validInitialContent,
  });

  useEffect(() => {
    if (onChange && editable) {
      const handleChange = async () => {
        const blocks = editor.document;
        onChange(blocks);
      };

      // Listen to document changes
      editor.onChange(handleChange);
    }
  }, [editor, onChange, editable]);

  return (
    <div className="border rounded-md p-4 min-h-[400px] bg-white">
      <BlockNoteView 
        editor={editor} 
        editable={editable}
        theme="light"
      />
    </div>
  );
}
