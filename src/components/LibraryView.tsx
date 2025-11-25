import { AlbumCard } from "./AlbumCard";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Song, storage } from "../services/api";

interface LibraryViewProps {
  onTrackSelect: (track: Song) => void;
}

export function LibraryView({ onTrackSelect }: LibraryViewProps) {
  const likedSongs = storage.getLikedSongs();

  if (likedSongs.length === 0) {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Tu Biblioteca
            </h1>
            <p className="text-muted-foreground italic text-sm sm:text-base">
              "Todo me es lícito, pero no todo me conviene" - 1 Corintios 6:12
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              No tienes canciones favoritas
            </h2>
            <p className="text-muted-foreground max-w-md">
              Dale me gusta a las canciones que te gustan para encontrarlas fácilmente aquí.
            </p>
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Tu Biblioteca
          </h1>
          <p className="text-muted-foreground italic text-sm sm:text-base">
            "Todo me es lícito, pero no todo me conviene" - 1 Corintios 6:12
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Canciones que te gustan · {likedSongs.length}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {likedSongs.map((song) => (
              <AlbumCard
                key={song.videoId}
                song={song}
                onClick={() => onTrackSelect(song)}
              />
            ))}
          </div>
        </section>
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
