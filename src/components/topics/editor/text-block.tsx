import { Block, TextBlock } from "@/types/editor";

type Props = {
  block: TextBlock;
  index: number;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number, value: string) => void;
  updateBlock: (id: string, patch: Partial<Block>) => void;
  autoResize: (el: HTMLTextAreaElement) => void;
  textRefs: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
};

export default function TextBlockComp({
  block,
  index,
  onKeyDown,
  updateBlock,
  autoResize,
  textRefs
}: Props) {
  return (
    <textarea
      placeholder={index === 0 ? "Empieza a escribir..." : "Escribe..."}
      value={block.content}
      onChange={(e) => {
        updateBlock(block.id, { content: e.target.value } as any);
        autoResize(e.currentTarget);
      }}
      onInput={(e) => autoResize(e.currentTarget)}
      onKeyDown={(e) => onKeyDown(e, index, block.content)}
      ref={(el) => {
        if (el) {
          textRefs.current[block.id] = el;
          autoResize(el);
        }
      }}
      className=" w-full resize-none bg-transparent outline-none text-base leading-relaxed placeholder:text-muted-foreground/70 focus:outline-none"
    />
  );
}

