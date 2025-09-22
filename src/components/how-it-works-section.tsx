import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

const steps = [
  {
    step: "01",
    title: "Regístrate gratis",
    description: "Crea tu cuenta en segundos y accede a todo el contenido básico sin costo.",
  },
  {
    step: "02",
    title: "Elige tu ruta",
    description: "Selecciona una ruta de aprendizaje basada en tu nivel y objetivos.",
  },
  {
    step: "03",
    title: "Practica y aprende",
    description: "Completa ejercicios interactivos y proyectos prácticos paso a paso.",
  },
  {
    step: "04",
    title: "Construye proyectos",
    description: "Aplica tus conocimientos en proyectos reales y construye tu portafolio.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
            Cómo funciona{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Pyson</span>
          </h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            Un proceso simple y efectivo para dominar Python desde cero
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/50">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full text-white font-bold text-xl mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-pretty">{step.description}</p>
                </CardContent>
              </Card>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
