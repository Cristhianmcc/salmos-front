import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Song, musicApi } from "../services/api";

interface AlbumCardProps {
  song: Song;
  onClick: () => void;
}

export function AlbumCard({ song, onClick }: AlbumCardProps) {
  const [hdCover, setHdCover] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Usar la thumbnail de mayor resolución disponible como fallback
  const defaultCover = song.thumbnails?.[song.thumbnails.length - 1]?.url || song.thumbnails?.[0]?.url || '';
  const artist = song.artists?.map(a => a.name).join(', ') || 'Unknown Artist';

  // IntersectionObserver para lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      {
        rootMargin: '50px', // Cargar un poco antes de que sea visible
        threshold: 0.1
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [isVisible]);

  // Fetch HD cover cuando la tarjeta es visible
  useEffect(() => {
    if (isVisible && !hdCover) {
      const fetchHdCover = async () => {
        try {
          const query = `${artist} ${song.title}`;
          const coverData = await musicApi.searchCover(query);

          if (coverData && coverData.cover_xl) {
            setHdCover(coverData.cover_xl);
          }
        } catch (error) {
          // Silently fail - keep using default cover
          console.debug('HD cover not found for:', song.title);
        }
      };

      // Pequeño delay para evitar hacer todas las peticiones a la vez
      const timeout = setTimeout(() => {
        fetchHdCover();
      }, Math.random() * 300);

      return () => clearTimeout(timeout);
    }
  }, [isVisible, hdCover, song.title, artist]);

  const cover = hdCover || defaultCover;

  return (
    <div
      ref={cardRef}
      className="group relative bg-card rounded-lg p-3 hover:bg-secondary transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="relative mb-3 aspect-square">
        <ImageWithFallback
          src={cover}
          alt={song.title}
          className="w-full h-full object-cover rounded-md shadow-lg"
          style={{
            imageRendering: '-webkit-optimize-contrast',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
          }}
        />
        <Button
          size="icon"
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 h-10 w-10 bg-primary hover:bg-primary/90 rounded-full shadow-xl"
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </Button>
      </div>
      <div>
        <h3 className="truncate text-white text-sm mb-0.5 font-medium">{song.title}</h3>
        <p className="truncate text-xs text-muted-foreground">{artist}</p>
      </div>
    </div>
  );
}
