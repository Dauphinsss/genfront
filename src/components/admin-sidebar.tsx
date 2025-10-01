"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminSection, AdminSectionConfig } from "@/types/admin";

interface AdminSidebarProps {
  sections: AdminSectionConfig[];
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  mobile?: boolean;
}

export function AdminSidebar({ 
  sections, 
  activeSection, 
  onSectionChange,
  mobile = false 
}: AdminSidebarProps) {
  return (
    <div className={cn(
      "border-r bg-card",
      mobile ? "w-full h-full" : "w-64 h-[calc(100vh-4rem)] sticky top-16"
    )}>
      <div className="p-4 space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <Button
              key={section.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-auto p-3",
                isActive && "bg-primary text-primary-foreground"
              )}
              onClick={() => onSectionChange(section.id)}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <div className="text-left">
                <div className="font-medium text-sm">{section.name}</div>
                {!mobile && (
                  <div className={cn(
                    "text-xs opacity-70 mt-0.5",
                    isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {section.description}
                  </div>
                )}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}