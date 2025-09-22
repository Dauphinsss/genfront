/*
    VLAB Python - Diagramas C1/C2 (Structurizr DSL)

    Propósito
    - Definir el Contexto (C1) y los Contenedores (C2) del VLAB para el curso de introducción a la programación con Python, con foco en autenticación OIDC y feedback en vivo.

    Alcance
    - Personas, sistema principal y sistemas externos (C1).
    - Contenedores internos: App, API, DB, Cache, Storage (C2).
    - Sin componentes (C3) ni código (C4) en este archivo.

    Convenciones
    - !identifiers hierarchical -> IDs cortos y jerárquicos.
    - Tags: "Database" para cilindros; "External" para sistemas externos.
    - Nombres en Español; tecnología en el 3er string del container.

    Autor: José Daniel Virreira Rufino (virreira.daniel@gmail.com)
    Fecha: 21-09-2025
    Versión: 1.0.0
*/

workspace "VLAB Python" "C1 y C2 del VLAB tipo Duolingo para Python" {

  !identifiers hierarchical

  model {
    // Personas
    student   = person "Estudiante" "Aprende Python en la plataforma."
    professor = person "Profesor/Administrador" "Gestiona cursos, secciones y ejercicios."

    // Sistema principal
    vlab = softwareSystem "VLAB Python" "Plataforma para introducción a la programación con feedback en vivo." {

      // Contenedores (C2)
      app = container "Aplicación Web" "Interfaz de usuario: navegación, formularios, feedback inmediato." "Expo / React Native"
      api = container "API Backend" "Casos de uso, orquestación, endpoints HTTP; valida tokens OIDC." "Node.js (Fastify) + TypeScript"
      db  = container "Base de Datos" "Persistencia principal (cursos, ejercicios, intentos, eventos, skills)." "PostgreSQL" {
        tags "Database"
      }
      redis   = container "Cache" "Cache de lecturas, sesiones y rate-limit." "Redis"
      storage = container "Almacenamiento de Recursos" "Archivos estáticos y recursos de curso (opcional)." "S3 / MinIO"
    }

    // Sistemas externos (C1)
    google    = softwareSystem "Google Identity" "Login social federado vía Keycloak." "External"
    microsoft = softwareSystem "Microsoft Auth ID" "Login social federado vía Keycloak." "External"
    smtp      = softwareSystem "Servicio de Correo" "Envío de emails de verificación/notificaciones (opcional)." "External"
    runner    = softwareSystem "Runner Python" "Ejecuta tests de código Python en contenedores (opcional)." "External"

    // Relaciones (C1)
    student   -> vlab "Usa para aprender."
    professor -> vlab "Administra contenidos."

    // Relaciones (C2)
    student   -> vlab.app "Usa la aplicación"
    professor -> vlab.app "Usa la aplicación"

    vlab.app -> vlab.api "HTTP/JSON"
    vlab.api -> vlab.db  "SQL (CRUD)"
    vlab.api -> vlab.redis   "Cache / sesiones / rate-limit"
    vlab.api -> vlab.storage "Lectura/Escritura de recursos" "S3 API"

    vlab -> google    "Valida tokens (JWKS), introspección OIDC" "OIDC/JWT"
    vlab -> microsoft "Valida tokens (JWKS), introspección OIDC" "OIDC/JWT"

    vlab.api -> smtp   "Envía correos" "SMTP"
    vlab.api -> runner "Ejecuta tests de código remoto (cuando aplica)" "HTTP"
  }

  views {
    // C1 — Contexto del sistema
    systemContext vlab {
      include *
      title "VLAB Python — C1: System Context"
    }

    // C2 — Contenedores del sistema
    container vlab {
      include *
      title "VLAB Python — C2: Containers"
    }

    // Estilos mínimos útiles
    styles {
      element "Person" { 
        shape Person 
      }
      element "Database" { 
        shape Cylinder 
      }
      element "External" {
        background #8c8c8c
      }
    }

    theme default
  }
}