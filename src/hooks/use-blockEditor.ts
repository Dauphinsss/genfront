import { useEffect, useRef, useState } from "react";
import { Block, ImageBlock, TextBlock } from "@/types/editor";
import { uid } from "@/lib/uid";

export function useBlocksEditor() {
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([{ id: uid(), kind: "TEXT", content: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusIndex, setFocusIndex] = useState<number>(0);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const textRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const updateBlock = (id: string, patch: Partial<Block>) =>
    setBlocks(prev => prev.map(b => (b.id === id ? ({ ...b, ...patch } as Block) : b)));

  const ensureTextAfterEveryImage = (list: Block[]) => {
    const out: Block[] = [];
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      out.push(b);
      if (b.kind === "IMAGE") {
        const next = list[i + 1];
        if (!next || next.kind !== "TEXT") {
          out.push({ id: uid(), kind: "TEXT", content: "" } as TextBlock);
        }
      }
    }
    return out;
  };

  const ensureOneTextBlock = (list: Block[], focusAtIndex?: number) => {
    if (list.length === 0 || !list.some(b => b.kind === "TEXT")) {
      const newId = uid();
      list = [{ id: newId, kind: "TEXT", content: "" } as TextBlock];
      setTimeout(() => {
        const el = textRefs.current[newId];
        if (el) {
          el.focus();
          el.setSelectionRange(0, 0);
          autoResize(el);
        }
      }, 0);
    } else if (typeof focusAtIndex === "number") {
      const left = [...list].slice(0, Math.max(0, focusAtIndex + 1)).reverse().find(b => b.kind === "TEXT");
      const right = [...list].slice(Math.max(0, focusAtIndex)).find(b => b.kind === "TEXT");
      const target = (left as TextBlock) ?? (right as TextBlock) ?? null;
      if (target) {
        setTimeout(() => {
          const el = textRefs.current[target.id];
          if (el) {
            el.focus();
            el.setSelectionRange(el.value.length, el.value.length);
            autoResize(el);
          }
        }, 0);
      }
    }
    return list;
  };

  const addBlockAfter = (index: number, kind: Block["kind"]) => {
    const b: Block =
      kind === "TEXT"
        ? { id: uid(), kind: "TEXT", content: "" }
        : { id: uid(), kind: "IMAGE", file: null, preview: null, uploadedUrl: null, caption: "", alt: "" };
    const next = [...blocks];
    next.splice(index + 1, 0, b);
    setBlocks(next);
  };

  const removeBlock = (id: string) => {
    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === id);
      if (index === -1) return prev;

      if (prev.length === 1 && prev[0].kind === "TEXT") {
        const only = prev[0] as TextBlock;
        if (only.content !== "") return [{ ...only, content: "" }];
        return prev;
      }

      let next = prev.filter(b => b.id !== id);
      next = ensureOneTextBlock(next, index - 1);
      next = ensureTextAfterEveryImage(next);
      return next;
    });
  };

  const removeTextBlockAt = (index: number) => {
    setBlocks(prev => {
      if (index < 0 || index >= prev.length) return prev;

      if (prev.length === 1 && prev[0].kind === "TEXT") {
        const only = prev[0] as TextBlock;
        if (only.content !== "") return [{ ...only, content: "" }];
        return prev;
      }

      if (index > 0 && prev[index - 1].kind === "IMAGE") {
        const cur = prev[index] as TextBlock;
        if (cur.content !== "") {
          const copy = [...prev];
          copy[index] = { ...cur, content: "" };
          return ensureTextAfterEveryImage(copy);
        }
        return prev;
      }

      let next = prev.filter((_, i) => i !== index);
      next = ensureOneTextBlock(next, index - 1);
      next = ensureTextAfterEveryImage(next);
      return next;
    });
  };

  const mergeWithPrevText = (index: number) => {
    const prevBlock = blocks[index - 1] as TextBlock;
    const curBlock = blocks[index] as TextBlock;
    const prevLen = prevBlock.content.length;

    const merged = { ...prevBlock, content: prevBlock.content + curBlock.content };
    const copy = [...blocks];
    copy[index - 1] = merged;
    copy.splice(index, 1);
    setBlocks(copy);

    setTimeout(() => {
      const el = textRefs.current[merged.id];
      if (el) {
        el.focus();
        el.setSelectionRange(prevLen, prevLen);
        autoResize(el);
      }
    }, 0);
  };

  const insertImageAfter = (index: number, file: File) => {
    const preview = URL.createObjectURL(file);
    const imageBlock: ImageBlock = {
      id: uid(),
      kind: "IMAGE",
      file,
      preview,
      uploadedUrl: null,
      caption: "",
      alt: "",
    };
    const next = [...blocks];
    next.splice(index + 1, 0, imageBlock);
    if (next[index + 2]?.kind !== "TEXT") {
      next.splice(index + 2, 0, { id: uid(), kind: "TEXT", content: "" } as TextBlock);
    }
    setBlocks(next);
    setFocusIndex(index + 2);
  };

  const openPickerThenInsert = (afterIndex: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) insertImageAfter(afterIndex, file);
    };
    input.click();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith("image/"));
    if (item) {
      e.preventDefault();
      const file = item.getAsFile();
      if (file) insertImageAfter(focusIndex, file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      insertImageAfter(focusIndex, file);
    }
  };

  const splitTextAtCaret = (index: number, el: HTMLTextAreaElement) => {
    const pos = el.selectionStart ?? 0;
    setBlocks(prev => {
      const cur = prev[index];
      if (!cur || cur.kind !== "TEXT") return prev;
      const before = (cur as TextBlock).content.slice(0, pos);
      const after = (cur as TextBlock).content.slice(pos);

      const next = [...prev];
      const updated: TextBlock = { ...(cur as TextBlock), content: before };
      next[index] = updated;

      const newId = uid();
      const newBlock: TextBlock = { id: newId, kind: "TEXT", content: after };
      next.splice(index + 1, 0, newBlock);

      requestAnimationFrame(() => {
        const n = textRefs.current[newId];
        if (n) {
          n.focus();
          n.setSelectionRange(0, 0);
          autoResize(n);
        }
      });

      return next;
    });
  };

  const onTextKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number, value: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      splitTextAtCaret(index, e.currentTarget);
      return;
    }

    if (e.key === "Enter" && value.trim().toLowerCase() === "/image") {
      e.preventDefault();
      updateBlock(blocks[index].id, { content: "" } as any);
      openPickerThenInsert(index);
      return;
    }

    if (e.key === "Backspace") {
      const el = e.currentTarget;
      const pos = el.selectionStart ?? 0;
      const selLen = (el.selectionEnd ?? pos) - pos;
      const isEmpty = el.value.length === 0 || (selLen === el.value.length && el.value.length > 0);

      if (isEmpty && index > 0 && blocks[index - 1].kind === "IMAGE") {
        e.preventDefault();
        if (el.value.length > 0) {
          updateBlock(blocks[index].id, { content: "" } as any);
          requestAnimationFrame(() => {
            const n = textRefs.current[blocks[index].id];
            if (n) {
              n.focus();
              n.setSelectionRange(0, 0);
              autoResize(n);
            }
          });
        }
        return;
      }

      if (isEmpty) {
        if (blocks.length > 1) {
          e.preventDefault();
          removeTextBlockAt(index);
        } else {
          if (el.value.length > 0) {
            e.preventDefault();
            updateBlock(blocks[index].id, { content: "" } as any);
            requestAnimationFrame(() => {
              const n = textRefs.current[blocks[index].id];
              if (n) {
                n.focus();
                n.setSelectionRange(0, 0);
                autoResize(n);
              }
            });
          }
        }
        return;
      }

      if (pos === 0 && index > 0 && blocks[index - 1].kind === "TEXT") {
        e.preventDefault();
        mergeWithPrevText(index);
        return;
      }

      if (pos === 0 && index > 0 && blocks[index - 1].kind === "IMAGE") {
        e.preventDefault();
        setBlocks(prev => {
          let next = prev.filter((_, i) => i !== (index - 1));
          next = ensureOneTextBlock(next, index - 1);
          next = ensureTextAfterEveryImage(next);
          return next;
        });
        return;
      }
    }
  };

  useEffect(() => {
    if (blocks.length === 0 || !blocks.some(b => b.kind === "TEXT")) {
      const newId = uid();
      setBlocks([{ id: newId, kind: "TEXT", content: "" } as TextBlock]);
      setTimeout(() => {
        const el = textRefs.current[newId];
        if (el) {
          el.focus();
          el.setSelectionRange(0, 0);
          autoResize(el);
        }
      }, 0);
    }
  }, [blocks]);

  return {
  
    title, setTitle,
    blocks, setBlocks,
    saving, setSaving,
    error, setError,
    focusIndex, setFocusIndex,

    pageRef, textRefs,

    autoResize, updateBlock,
    ensureOneTextBlock, ensureTextAfterEveryImage,
    addBlockAfter, removeBlock, removeTextBlockAt,
    mergeWithPrevText, insertImageAfter, openPickerThenInsert,
    handlePaste, handleDrop, splitTextAtCaret, onTextKeyDown,
  };
}
