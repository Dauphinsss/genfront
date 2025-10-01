"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ConfigurationSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración del Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Funcionalidad de configuración en desarrollo...
        </p>
      </CardContent>
    </Card>
  );
}