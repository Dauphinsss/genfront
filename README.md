# Pyson

Proyecto para la creación de cursos de introducción a la programación orientados al manejo de Python

## Comenzando

Primero, ejecuta el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
# o
bun dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

Puedes comenzar a editar la página modificando los archivos del proyecto. La página se actualiza automáticamente mientras editas.

***
<br>
<br>

<h1 style="border-bottom: none;">Arquitectura del Software</h1>

Este proyecto incluye diagramas en notación C4, modelados con **Structurizr DSL**

<h2 style="border-bottom: none;">C1 - Contexto del Sistema</h2>

El diagrama C1 muestra a los actores externos (estudiantes, profesores) y los sistemas con los que interactúa el VLAB Python.

<div align="center">
    <img src="docs/diagrams/structurizr-SystemContext-001.png"
        alt="C1 - System Context"
        width="600"
        style="border-radius: 12px; border: 1px solid #ccc;"
    />
</div>

El diagrama C2 descompone el sistema principal en contenedores (Aplicación Web, API Backend, Base de Datos, etc.) y muestra sus relaciones.

<div align="center">
    <img src="docs/diagrams/structurizr-Container-001.png"
        alt="C2 - Containers"
        width="600"
        style="border-radius: 12px; border: 1px solid #ccc;"
    />
</div>

***

<h2 style="border-bottom: none;">Fuente de los diagramas</h2>

- Código DSL: docs/structrizr/workspace.dsl'

<p style="color:#a7a7a7">
    <i>Los diagramas pueden ser editados con la herramienta online de Structurizr:</i> https://structurizr.com/dsl
</p>