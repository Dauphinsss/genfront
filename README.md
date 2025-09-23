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

<h2 style="border-bottom: none;">C2 - Contenedores</h2>

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

***
<br>
<br>

<h1 style="border-bottom: none;">Arquitectura de Capas</h1>

Este proyecto incluye diagramas de **arquitectura por capas**, modelados con notación de **Lucidchart**. 

<h2 style="border-bottom: none;">Arquitectura por Capas Tecnologicas</h2>

<p align="justify">
Este modelo organiza el sistema desde el punto de vista de las tecnologias utilizadas. La capa de Frontend (Next.js/React) se encarga de la interaccion con el usuario. La capa de Backend 
(NestJS) implementa la logica de negocio mediante controladores, servicios y modulos. La capa de ORM (Prisma) gestiona el acceso a datos y el mapeo de entidades. Finalmente, la Base de Datos (Sqlite/Postgrestsql) asegura el almacenamiento persistente.
</p>

<div align="center">
    <img src="docs/diagrams/ArquitecturaCapasTecn.png"
        alt="C1 - System Context"V
        width="600"
        style="border-radius: 12px; border: 1px solid #ccc;"
    />
</div>

<h2 style="border-bottom: none;">Arquitectura por Capas Funcionales</h2>

<p align="justify">
Este modelo representa el sistema desde el enfoque funcional y de negocio. En la capa de interaccion, se gestionan estudiantes y docentes. La capa de negocio incluye procesos clave como inscripciones, cursos, materiales, laboratorios, retroalimentaciones y calificaciones. La capa intermedia muestra las tecnologías que soportan el flujo (Next.js, NestJS y Prisma ORM). Por ultimo, la capa de sistema se apoya en los servidores y la base de datos que sostienen toda la aplicación.
</p>

<div align="center">
    <img src="docs/diagrams/ArquitecturaCapasFun.png"
        alt="C1 - System Context"
        width="600"
        style="border-radius: 12px; border: 1px solid #ccc;"
    />
</div>

***

<h2 style="border-bottom: none;">Funente de los Diagramas</h2>

<p style="color:#a7a7a7">
<i>Los diagramas puedes se editados utlizando la herramienta online de </i> https://www.lucidchart.com/pages
</p>

***
<br>
<br>

<h1 style="border-bottom: none;">Arquitectura del Software</h1>