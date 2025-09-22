"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Code, CheckCircle } from "lucide-react"

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-green-500/10 rounded-full text-sm font-medium text-green-600 border border-green-500/20">
              <CheckCircle className="w-4 h-4 mr-2" />
              100% Gratis - Sin límites ni restricciones
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance leading-tight">
              Aprende{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient">
                Python
              </span>{" "}
              como en el aula
            </h1>

            <p className="text-xl text-muted-foreground text-pretty max-w-2xl">
              Pyson es tu plataforma educativa gratuita para aprender Python. Únete a cursos, completa ejercicios
              interactivos y aprende con tus compañeros y profesores.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 animate-pulse-glow"
                onClick={() => window.location.reload()} // Esto activará el modal de auth
              >
                Iniciar sesión ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="group bg-transparent">
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Ver cómo funciona
              </Button>
            </div>

            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Completamente gratis
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Para estudiantes y docentes
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Cursos interactivos
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 backdrop-blur-sm border border-primary/20 animate-float">
              <div className="bg-card rounded-lg p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <Code className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="space-y-3 font-mono text-sm">
                  <div className="text-muted-foreground"># Ejercicio: Lista de números pares</div>
                  <div className="text-primary">def numeros_pares(lista):</div>
                  <div className="text-foreground ml-4">return [x for x in lista if x % 2 == 0]</div>
                  <div className="text-muted-foreground"># Resultado: [2, 4, 6, 8]</div>
                  <div className="flex items-center mt-4 p-2 bg-green-500/10 rounded border border-green-500/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-600 text-xs">¡Correcto! Excelente trabajo</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-accent to-secondary rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full opacity-30 animate-bounce"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
