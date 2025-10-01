export type TextBlock = { id: string; kind: "TEXT"; content: string };
export type ImageBlock = {
  id: string;
  kind: "IMAGE";
  file?: File | null;
  preview?: string | null;
  uploadedUrl?: string | null;
  caption?: string | null;
  alt?: string | null;
};
export type Block = TextBlock | ImageBlock;

export type CreateTopicInput = {
  courseId: string;
  title: string;
  kind: "TEXT" | "IMAGE";
  text?: string | null;
  imageUrl?: string | null;
};

export type Topic = {
  id: string;
  courseId: string;
  title: string;
  kind: "TEXT" | "IMAGE";
  text?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};
