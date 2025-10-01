import { LucideIcon } from "lucide-react";

export type AdminSection = 
  | "overview" 
  | "users" 
  | "courses" 
  | "exams" 
  | "reports" 
  | "config";

export interface AdminSectionConfig {
  id: AdminSection;
  name: string;
  icon: LucideIcon;
  description: string;
}