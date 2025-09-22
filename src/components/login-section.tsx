"use client"

import { Button } from "@/components/ui/button"

interface LoginSectionProps {
  onLogin: (provider: "google" | "microsoft") => void
  isLoading: boolean
}

export function LoginSection({ onLogin, isLoading }: LoginSectionProps) {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border))_1px,transparent_1px)] bg-[size:20px_20px] opacity-50 animate-grid" />

        <div className="absolute top-20 left-10 w-32 h-32 border border-border rounded-full opacity-20 animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-24 h-24 border border-border rounded-full opacity-15 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/3 right-20 w-16 h-16 border border-border rounded-full opacity-25 animate-pulse"
          style={{ animationDelay: "2s" }}
        />

        <div className="absolute top-1/4 right-1/4 w-8 h-8 border border-border rotate-45 opacity-20 animate-spin-slow" />
        <div
          className="absolute bottom-1/3 left-1/3 w-6 h-6 border border-border rotate-45 opacity-15 animate-spin-slow"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-foreground rounded-full animate-float opacity-20" />
      <div
        className="absolute top-3/4 right-1/4 w-1 h-1 bg-foreground rounded-full animate-float opacity-30"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-foreground rounded-full animate-float opacity-25"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-foreground rounded-full animate-float opacity-20"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/6 right-1/2 w-2 h-2 bg-foreground rounded-full animate-float opacity-15"
        style={{ animationDelay: "5s" }}
      />

      <div className="relative z-10 w-full max-w-md text-center animate-fade-in-up">
        <div className="mb-12">
          <div className="mb-8">
            <h1 className="text-5xl sm:text-6xl font-bold mb-4 text-foreground">Pyson</h1>
            <div className="w-16 h-1 bg-foreground mx-auto mb-6 rounded-full" />
          </div>

          <p className="text-xl text-muted-foreground text-balance mb-6">Aprende programación de forma gratuita</p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Siempre gratis</span>
            </div>
            <div className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Sin límites</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">100+</div>
              <div className="text-xs text-muted-foreground">Ejercicios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">24/7</div>
              <div className="text-xs text-muted-foreground">Disponible</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">∞</div>
              <div className="text-xs text-muted-foreground">Progreso</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => onLogin("google")}
            disabled={isLoading}
            className="w-full h-12 bg-background hover:bg-secondary text-foreground border border-border rounded-lg flex items-center justify-center gap-3 font-medium transition-all duration-200 hover:border-foreground"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continuar con Google
          </Button>

          <Button
            onClick={() => onLogin("microsoft")}
            disabled={isLoading}
            className="w-full h-12 bg-foreground hover:bg-foreground/90 text-background rounded-lg flex items-center justify-center gap-3 font-medium transition-all duration-200"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
              </svg>
            )}
            Continuar con Microsoft
          </Button>
        </div>

        <div className="mt-12 space-y-4">
          <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
            <span>Cursos interactivos</span>
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <span>Progreso personalizado</span>
          </div>

          <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
            <span>Certificados</span>
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <span>Comunidad activa</span>
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <span>Soporte 24/7</span>
          </div>
        </div>
      </div>
    </section>
  )
}
