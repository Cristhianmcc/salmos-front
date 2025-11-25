import { Home, Search, Library, Music2 } from "lucide-react";
import { Button } from "./ui/button";

interface MobileNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function MobileNav({ currentView, onViewChange }: MobileNavProps) {
  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-2 p-4">
          <img 
            src="/salmos.png" 
            alt="Salmos" 
            className="w-8 h-8 rounded-lg object-contain"
          />
          <span className="text-xl font-semibold text-white">Salmos</span>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border pb-safe">
        <nav className="flex items-center justify-around px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-col h-auto py-2 gap-1 ${
              currentView === "home" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => onViewChange("home")}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Inicio</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex-col h-auto py-2 gap-1 ${
              currentView === "search" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => onViewChange("search")}
          >
            <Search className="w-6 h-6" />
            <span className="text-xs">Buscar</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex-col h-auto py-2 gap-1 ${
              currentView === "library" ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => onViewChange("library")}
          >
            <Library className="w-6 h-6" />
            <span className="text-xs">Biblioteca</span>
          </Button>
        </nav>
      </div>
    </>
  );
}
