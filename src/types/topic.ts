export type TopicType = "content" | "evaluation"

export type ResourceType = "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "OTHER"

// BlockNote JSON structure type
export type BlockNoteContent = Record<string, unknown>[]

export interface Resource {
  id: number
  filename: string
  resourceUrl: string
  type: ResourceType
  size: number
  mimeType: string
  createdAt: string
  contentId: number
}

export interface Content {
  id: number
  blocksJson?: BlockNoteContent
  description?: string
  createdAt: string
  updatedAt: string
  topicId: number
  resources: Resource[]
}

export interface Topic {
  id: number
  name: string
  type: TopicType
  createdAt: string
  content?: Content
  courses?: unknown[]
}

export interface CreateTopicDto {
  name: string
  type: TopicType
}

export interface CreateContentDto {
  blocksJson: BlockNoteContent
  description?: string
}

export interface UpdateContentDto {
  blocksJson?: BlockNoteContent
  description?: string
}

export interface UploadResourceResponse {
  success: boolean
  message: string
  data: Resource
}

export interface HistoricContent {
  id: number
  contentId: number
  performedBy: string
  changeSummary: string | null
  snapshotDescription: string | null
  snapshotBlocksJson: BlockNoteContent | null
  createdAt: string
}