import { ImageBlock } from "@/types/editor";

export default function ImageBlockComp({ block, onDelete }: { block: ImageBlock; onDelete: () => void }) {
  return (
    <div className="relative inline-block max-w-full">
      {block.preview && (
        <img
          src={block.preview}
          alt={block.alt || "image"}
          className="max-w-full h-auto rounded-md border border-border"
        />
      )}

      <button
        type="button"
        title="Eliminar imagen"
        onClick={onDelete}
        className="absolute top-2 right-2 px-2 py-1 text-xs rounded-md bg-destructive text-white hover:bg-destructive/80 shadow-sm transition-colors"
      >
        Eliminar
      </button>
    </div>
  );
}
