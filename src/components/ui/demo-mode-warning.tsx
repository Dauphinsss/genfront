import { AlertTriangle } from "lucide-react";

interface DemoModeWarningProps {
  message?: string;
}

export function DemoModeWarning({ message = "Usando datos de prueba - Los cambios no se guardarán permanentemente" }: DemoModeWarningProps) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md flex items-center gap-2 mb-4">
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}