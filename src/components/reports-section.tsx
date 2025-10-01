"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReportsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reportes y Análisis</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Funcionalidad de reportes en desarrollo...
        </p>
      </CardContent>
    </Card>
  );
}