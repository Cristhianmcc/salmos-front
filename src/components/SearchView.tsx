import { useState, useEffect } from "react";
import { Search, Guitar, Disc, Mic2, Music, Headphones, Sparkles, Music2, Flame, Star, Radio } from "lucide-react";
import { AlbumCard } from "./AlbumCard";
import { Input } from "./ui/input";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Song, musicApi } from "../services/api";

interface SearchViewProps {
  onTrackSelect: (track: Song) => void;
  onQueueUpdate: (tracks: Song[]) => void;
  playlistSearchQuery?: string | null;
  onSearchComplete?: () => void;
}

export function SearchView({ onTrackSelect, onQueueUpdate, playlistSearchQuery, onSearchComplete }: SearchViewProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const songs = (await musicApi.search(searchQuery, "songs", 50)) as Song[];
      setResults(songs);
      onQueueUpdate(songs);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Ejecutar búsqueda automáticamente cuando se clickea una playlist
  useEffect(() => {
    if (playlistSearchQuery) {
      setQuery(playlistSearchQuery);
      performSearch(playlistSearchQuery);
      onSearchComplete?.();
    }
  }, [playlistSearchQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  // Géneros con búsquedas específicas para obtener imágenes reales
  const genres = [
    { id: 1, name: "Rock", searchQuery: "rock music", Icon: Guitar, fallbackColor: "#dc2626" },
    { id: 2, name: "Pop", searchQuery: "pop music hits", Icon: Disc, fallbackColor: "#ec4899" },
    { id: 3, name: "Hip Hop", searchQuery: "hip hop", Icon: Mic2, fallbackColor: "#f97316" },
    { id: 4, name: "Jazz", searchQuery: "jazz music", Icon: Music, fallbackColor: "#3b82f6" },
    { id: 5, name: "Electrónica", searchQuery: "electronic music", Icon: Headphones, fallbackColor: "#a855f7" },
    { id: 6, name: "Latina", searchQuery: "musica latina", Icon: Music2, fallbackColor: "#eab308" },
    { id: 7, name: "Clásica", searchQuery: "classical music", Icon: Music, fallbackColor: "#6366f1" },
    { id: 8, name: "Reggaetón", searchQuery: "reggaeton", Icon: Flame, fallbackColor: "#10b981" },
    { id: 9, name: "R&B", searchQuery: "r&b soul", Icon: Sparkles, fallbackColor: "#f43f5e" },
    { id: 10, name: "Country", searchQuery: "country music", Icon: Radio, fallbackColor: "#d97706" },
  ];

  const [genreImages, setGenreImages] = useState<Record<number, string>>({});

  // Cargar imágenes de géneros al montar el componente
  useEffect(() => {
    const loadGenreImages = async () => {
      const images: Record<number, string> = {};
      for (const genre of genres) {
        try {
          const songs = await musicApi.search(genre.searchQuery, "songs", 1) as Song[];
          if (songs.length > 0 && songs[0].thumbnails) {
            // Usar la thumbnail de mayor resolución disponible
            const thumbnails = songs[0].thumbnails;
            const bestThumbnail = thumbnails[thumbnails.length - 1] || thumbnails[0];
            if (bestThumbnail?.url) {
              images[genre.id] = bestThumbnail.url;
            }
          }
        } catch (error) {
          console.error(`Error loading image for ${genre.name}:`, error);
        }
      }
      setGenreImages(images);
    };
    loadGenreImages();
  }, []);

  return (
    <ScrollArea className="h-full">
      <div className="p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Buscar
          </h1>
          <p className="text-muted-foreground italic text-sm sm:text-base">
            "Todo me es lícito, pero no todo me conviene" - 1 Corintios 6:12
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="¿Qué quieres escuchar?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </form>

        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Buscando...</p>
          </div>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Resultados para "{query}"
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((song) => (
                <AlbumCard
                  key={song.videoId}
                  song={song}
                  onClick={() => onTrackSelect(song)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Genre Buttons (visual only) */}
        {results.length === 0 && !loading && (
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Explorar por género
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {genres.map((genre) => {
                const IconComponent = genre.Icon;
                const backgroundImage = genreImages[genre.id];
                return (
                  <button
                    key={genre.id}
                    onClick={() => {
                      setQuery(genre.name);
                      handleSearch(new Event("submit") as any);
                    }}
                    className="aspect-square rounded-xl p-4 flex flex-col justify-between transition-all hover:scale-105 hover:shadow-xl relative overflow-hidden group"
                    style={{
                      backgroundColor: genre.fallbackColor,
                      backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {/* Overlay oscuro para legibilidad */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                    
                    {/* Icono en la esquina superior derecha */}
                    <div className="self-end relative z-10">
                      <IconComponent className="w-12 h-12 text-white drop-shadow-lg transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all" strokeWidth={1.5} />
                    </div>
                    
                    {/* Nombre del género abajo */}
                    <span className="text-white font-bold text-lg sm:text-xl text-left drop-shadow-lg relative z-10">
                      {genre.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
