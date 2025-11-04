import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background px-4">
      <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in duration-700">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
          <GraduationCap className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
          Plataforma de Ayudantías
          <span className="block text-primary mt-2">Unificadas</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Postula a ayudantías docentes de forma simple y centralizada. 
          Gestiona tus postulaciones en un solo lugar.
        </p>

        <div className="pt-4">
          <Button
            size="lg"
            onClick={() => navigate("/positions")}
            className="text-lg px-8 py-6 group"
          >
            Explorar Ayudantías
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="font-semibold text-lg mb-2 text-foreground">Búsqueda Avanzada</h3>
            <p className="text-muted-foreground">Filtra por departamento y categoría para encontrar oportunidades.</p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="font-semibold text-lg mb-2 text-foreground">Postulación Simple</h3>
            <p className="text-muted-foreground">Completa formularios claros y rápidos para cada ayudantía.</p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="font-semibold text-lg mb-2 text-foreground">Seguimiento en Tiempo Real</h3>
            <p className="text-muted-foreground">Revisa y gestiona el estado de tus postulaciones fácilmente.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
