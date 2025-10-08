import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
}

export function SidebarItem({ icon: Icon, label, isActive = false }: SidebarItemProps) {
  return (
    <div 
      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
        isActive 
          ? 'bg-primary/10 text-primary' 
          : 'hover:bg-secondary text-foreground'
      }`}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
      <span className="text-sm">{label}</span>
    </div>
  );
}