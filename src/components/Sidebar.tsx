import { Home, Search, Library, Plus, Heart, Music2, Guitar, Waves, Dumbbell, Moon, Sun, BookOpen, Flame, Music } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onPlaylistClick?: (playlistName: string) => void;
}

export function Sidebar({ currentView, onViewChange, onPlaylistClick }: SidebarProps) {
  const playlists = [
    { name: "Clásicos del Rock", Icon: Guitar, count: 45, searchQuery: "rock classics" },
    { name: "Vibraciones Chill", Icon: Waves, count: 32, searchQuery: "chill music" },
    { name: "Mix de Ejercicio", Icon: Dumbbell, count: 28, searchQuery: "workout music" },
    { name: "Jazz Nocturno", Icon: Moon, count: 19, searchQuery: "jazz night" },
    { name: "Éxitos Verano 2024", Icon: Sun, count: 50, searchQuery: "summer hits 2024" },
    { name: "Concentración y Estudio", Icon: BookOpen, count: 37, searchQuery: "study focus music" },
    { name: "Fiebre de Reggaetón", Icon: Flame, count: 42, searchQuery: "reggaeton" },
    { name: "Sesiones Acústicas", Icon: Music, count: 25, searchQuery: "acoustic sessions" },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-background border-r border-border h-full">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <img
          src="/salmos.png"
          alt="Salmos Logo"
          className="w-10 h-10 object-contain"
        />
        <span className="text-xl font-bold text-white tracking-tight">Salmos</span>
      </div>

      <div className="px-3 flex-1 flex flex-col">
        {/* Main Navigation */}
        <nav className="space-y-1">
          <Button
            variant={currentView === "home" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3"
            onClick={() => onViewChange("home")}
          >
            <Home className="w-5 h-5" />
            Inicio
          </Button>
          <Button
            variant={currentView === "search" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3"
            onClick={() => onViewChange("search")}
          >
            <Search className="w-5 h-5" />
            Buscar
          </Button>
          <Button
            variant={currentView === "library" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3"
            onClick={() => onViewChange("library")}
          >
            <Library className="w-5 h-5" />
            Tu biblioteca
          </Button>
        </nav>

        <Separator className="my-4" />

        {/* Library Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 px-3">
            <span className="text-muted-foreground text-sm">Playlists</span>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-1 pr-3">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-primary"
              >
                <Heart className="w-5 h-5" />
                Canciones que te gustan
              </Button>
              {playlists.map((playlist) => {
                const IconComponent = playlist.Icon;
                return (
                  <Button
                    key={playlist.name}
                    variant="ghost"
                    className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground group"
                    onClick={() => {
                      onViewChange('search');
                      onPlaylistClick?.(playlist.searchQuery);
                    }}
                  >
                    <IconComponent className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="flex-1 text-left text-sm truncate">
                      {playlist.name}
                    </span>
                    <span className="text-xs opacity-50">
                      {playlist.count}
                    </span>
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
