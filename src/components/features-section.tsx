import { Card, CardContent } from "@/components/ui/card"
import { Code2, BookOpen, Trophy, Users, Zap, Target } from "lucide-react"

const features = [
  {
    icon: Code2,
    title: "Ejercicios Interactivos",
    description: "Practica con ejercicios de código en tiempo real con retroalimentación instantánea.",
  },
  {
    icon: BookOpen,
    title: "Lecciones Estructuradas",
    description: "Aprende paso a paso desde lo básico hasta conceptos avanzados de Python.",
  },
  {
    icon: Trophy,
    title: "Sistema de Logros",
    description: "Gana puntos y desbloquea logros mientras progresas en tu aprendizaje.",
  },
  {
    icon: Users,
    title: "Comunidad Activa",
    description: "Conecta con otros estudiantes y comparte tu progreso en nuestra comunidad.",
  },
  {
    icon: Zap,
    title: "Proyectos Reales",
    description: "Construye proyectos del mundo real para aplicar lo que has aprendido.",
  },
  {
    icon: Target,
    title: "Rutas Personalizadas",
    description: "Sigue rutas de aprendizaje adaptadas a tus objetivos y nivel actual.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
            Todo lo que necesitas para{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              aprender Python
            </span>
          </h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            Pyson combina la teoría con la práctica para ofrecerte la mejor experiencia de aprendizaje
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/50"
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-pretty">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
