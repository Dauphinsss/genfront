export type TopicType = "content" | "evaluation"

export type ResourceType = "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "OTHER"

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
  jsonFileUrl: string
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
  jsonFileUrl: string
  description?: string
}

export interface UpdateContentDto {
  jsonFileUrl?: string
  description?: string
}

export interface UploadResourceResponse {
  success: boolean
  message: string
  data: Resource
}
