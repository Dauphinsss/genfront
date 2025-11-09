export type BlockType = 
  | 'text'      
  | 'image'     
  | 'video'     
  | 'audio'     
  | 'document'; 

export type TemplateType =
  | 'single'
  | 'two-col'
  | 'two-row'
  | 'triple'
  | 'quad'
  | 'sidebar-left'
  | 'sidebar-right'
  | 'header-content'
  | 'focus-left'
  | 'focus-right'
  | 'custom';

export interface ContentBlock {
  id: string;
  type: BlockType;
  order: number;
  data: TextBlockData | MediaBlockData;
}

export interface TextBlockData {
  content: string;
}

export interface MediaBlockData {
  url: string;
  filename?: string;
  caption?: string;
  size?: number;
  mimeType?: string;
}

export interface ContentTemplate {
  type: TemplateType;
  name: string;
  description: string;
  blocks: ContentBlock[];
  layout: TemplateLayout;
}

export interface TemplateLayout {
  columns: number;
  rows: number;
  areas: LayoutArea[];
}

export interface LayoutArea {
  id: string;
  blockId: string;
  gridColumn: string;
  gridRow: string;
}

export interface ContentDocument {
  template: TemplateType;
  blocks: ContentBlock[];
  layout: TemplateLayout;
}
