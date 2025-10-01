import TextBlockComp from "./text-block";
import ImageBlockComp from "./image-block";
import { Block } from "@/types/editor";

type Props = {
  block: Block;
  index: number;
  setFocusIndex: (i: number) => void;
  openPickerThenInsert: (afterIndex: number) => void;
  removeBlock: (id: string) => void;
 
  onTextKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number, value: string) => void;
  updateBlock: (id: string, patch: Partial<Block>) => void;
  autoResize: (el: HTMLTextAreaElement) => void;
  textRefs: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
};

export default function BlockRow({
  block, index, setFocusIndex, openPickerThenInsert, removeBlock,
  onTextKeyDown, updateBlock, autoResize, textRefs
}: Props) {
  return (
    <div
      className="group relative flex items-start gap-3 py-2"
      onMouseDown={() => setFocusIndex(index)}
    >
      {/* Boton lateral */}
      <button
        type="button"
        title="Insertar imagen debajo"
        onClick={() => openPickerThenInsert(index)}
        className="absolute -left-6 top-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full border border-border bg-background text-muted-foreground flex items-center justify-center hover:bg-accent hover:text-accent-foreground">
        +
      </button>

      {/* Renderizado  */}
      {block.kind === "TEXT" ? (
        <TextBlockComp
          block={block}
          index={index}
          onKeyDown={onTextKeyDown}
          updateBlock={updateBlock}
          autoResize={autoResize}
          textRefs={textRefs}
        />
      ) : (
        <ImageBlockComp block={block} onDelete={() => removeBlock(block.id)} />
      )}
    </div>
  );
}
