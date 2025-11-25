import { AlbumCard } from "./AlbumCard";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Song, storage } from "../services/api";

interface HomeViewProps {
  onTrackSelect: (track: Song) => void;
}

export function HomeView({ onTrackSelect }: HomeViewProps) {
  // Get real data from localStorage
  const recentlyPlayed = storage.getHistory().slice(0, 12);
  const likedSongs = storage.getLikedSongs().slice(0, 12);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  // Show welcome message if no data
  if (recentlyPlayed.length === 0 && likedSongs.length === 0) {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {getGreeting()}
            </h1>
            <p className="text-muted-foreground italic text-sm sm:text-base">
              "Todo me es lícito, pero no todo me conviene" - 1 Corintios 6:12
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-6xl mb-4">🎵</div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Comienza a escuchar música
            </h2>
            <p className="text-muted-foreground max-w-md">
              Usa la búsqueda para encontrar tus canciones favoritas. Las canciones que
              reproduzcas aparecerán aquí.
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
            {getGreeting()}
          </h1>
          <p className="text-muted-foreground italic text-sm sm:text-base">
            "Todo me es lícito, pero no todo me conviene" - 1 Corintios 6:12
          </p>
        </div>

        {/* Liked Songs Section */}
        {likedSongs.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              ❤️ Tus canciones favoritas
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {likedSongs.map((song) => (
                <AlbumCard
                  key={song.videoId}
                  song={song}
                  onClick={() => onTrackSelect(song)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recently Played Section */}
        {recentlyPlayed.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              🕐 Reproducidos recientemente
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recentlyPlayed.map((song) => (
                <AlbumCard
                  key={song.videoId}
                  song={song}
                  onClick={() => onTrackSelect(song)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
