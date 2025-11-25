import { useState, useRef, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { MobileNav } from "./components/MobileNav";
import { Player } from "./components/Player";
import { HomeView } from "./components/HomeView";
import { SearchView } from "./components/SearchView";
import { LibraryView } from "./components/LibraryView";
import { LyricsModal } from "./components/LyricsModal";
import { musicApi, storage, Song } from "./services/api";

export default function App() {
  const [currentView, setCurrentView] = useState<string>("home");
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackQueue, setTrackQueue] = useState<Song[]>([]);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [hdCover, setHdCover] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlistSearchQuery, setPlaylistSearchQuery] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handlers definidos antes para que puedan ser referenciados
  const handleNext = () => {
    if (!currentTrack || trackQueue.length === 0) return;

    const currentIndex = trackQueue.findIndex(t => t.videoId === currentTrack.videoId);
    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + 1) % trackQueue.length;
    handleTrackSelect(trackQueue[nextIndex]);
  };

  const handlePrevious = () => {
    if (!currentTrack || trackQueue.length === 0) return;

    const currentIndex = trackQueue.findIndex(t => t.videoId === currentTrack.videoId);
    if (currentIndex === -1) return;

    const prevIndex = (currentIndex - 1 + trackQueue.length) % trackQueue.length;
    handleTrackSelect(trackQueue[prevIndex]);
  };

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.7;
    }

    const audio = audioRef.current;

    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      setIsPlaying(false);
    };

    const handleTimeUpdate = () => {
      if (audio) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio) {
        setDuration(audio.duration);
      }
    };

    // Add event listeners
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // Event listener separado para 'ended' que depende de handleNext
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      handleNext();
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, trackQueue]); // Se actualiza cuando cambia la cola

  // Fetch HD cover when track changes
  useEffect(() => {
    if (currentTrack) {
      setHdCover(null); // Reset immediately

      const fetchHdCover = async () => {
        try {
          const artist = currentTrack.artists?.[0]?.name || '';
          const query = `${artist} ${currentTrack.title}`;
          console.log(`🎨 [App] Requesting HD cover for: ${query}`);

          const coverData = await musicApi.searchCover(query);

          if (coverData && coverData.cover_xl) {
            console.log(`✅ [App] Setting HD cover: ${coverData.cover_xl}`);
            setHdCover(coverData.cover_xl);
          } else {
            console.log(`⚠️ [App] No HD cover found`);
          }
        } catch (error) {
          console.error('❌ [App] Failed to fetch HD cover:', error);
        }
      };

      fetchHdCover();
    } else {
      setHdCover(null);
    }
  }, [currentTrack]);

  const handleTrackSelect = async (track: Song) => {
    console.log('▶️ Playing:', track.title);
    setCurrentTrack(track);

    try {
      // Get stream URL from backend
      const streamData = await musicApi.getStreamUrl(track.videoId);

      if (!streamData) {
        console.error('No stream data available');
        alert('No se pudo cargar esta canción. Intenta con otra.');
        return;
      }

      // Set audio source and play
      if (audioRef.current) {
        // Use streamUrl if available, otherwise fall back to embedUrl
        if (streamData.streamUrl) {
          console.log(`🎵 Using stream URL (${streamData.method})`);
          audioRef.current.src = streamData.streamUrl;
          
          // For CORS issues, add crossOrigin attribute
          audioRef.current.crossOrigin = 'anonymous';
          
          try {
            await audioRef.current.play();
            setIsPlaying(true);
            storage.saveToHistory(track);
          } catch (playError) {
            console.error('Error playing stream:', playError);
            // If stream fails, try with direct YouTube URL as fallback
            const youtubeUrl = `https://www.youtube.com/embed/${track.videoId}?autoplay=1`;
            alert(`No se pudo reproducir el audio directamente. Abriendo en YouTube...`);
            window.open(youtubeUrl, '_blank');
            setIsPlaying(false);
          }
        } else if (streamData.embedUrl) {
          console.log('🎵 Opening YouTube embed');
          // Open in new tab for embed URLs
          window.open(streamData.embedUrl + '?autoplay=1', '_blank');
          alert('Reproduciendo en una nueva pestaña de YouTube');
          setIsPlaying(false);
        } else {
          throw new Error('No valid stream or embed URL');
        }
      }
    } catch (error) {
      console.error('Playback error:', error);
      alert('Error al reproducir la canción');
      setIsPlaying(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleShowLyrics = async () => {
    if (!currentTrack) return;

    // Toggle: si ya está abierto, solo cerrarlo
    if (lyricsOpen) {
      setLyricsOpen(false);
      return;
    }

    // Si está cerrado, abrirlo y cargar letras
    setLyricsOpen(true);
    setLyricsLoading(true);
    setLyrics(null);

    try {
      const artist = currentTrack.artists?.[0]?.name || '';
      const result = await musicApi.searchLyrics(artist, currentTrack.title, currentTrack.videoId);

      if (result && result.lyrics) {
        setLyrics(result.lyrics);
      }
    } catch (error) {
      console.error('Failed to fetch lyrics:', error);
    } finally {
      setLyricsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onPlaylistClick={(query) => setPlaylistSearchQuery(query)}
      />

      {/* Mobile Navigation */}
      <MobileNav currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content */}
      <main 
        className="flex-1 overflow-hidden relative transition-all duration-300"
        style={{ marginRight: lyricsOpen ? '420px' : '0' }}
      >
        {currentView === 'home' && <HomeView onTrackSelect={handleTrackSelect} />}
        {currentView === 'search' && (
          <SearchView 
            onTrackSelect={handleTrackSelect} 
            onQueueUpdate={setTrackQueue}
            playlistSearchQuery={playlistSearchQuery}
            onSearchComplete={() => setPlaylistSearchQuery(null)}
          />
        )}
        {currentView === 'library' && <LibraryView onTrackSelect={handleTrackSelect} />}
      </main>

      {/* Lyrics Panel */}
      <LyricsModal
        isOpen={lyricsOpen}
        onClose={() => setLyricsOpen(false)}
        songTitle={currentTrack?.title || ''}
        artist={currentTrack?.artists?.[0]?.name || ''}
        cover={hdCover || currentTrack?.thumbnails?.[0]?.url}
        lyrics={lyrics}
        loading={lyricsLoading}
      />

      {/* Player */}
      <Player
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        audioRef={audioRef}
        onShowLyrics={handleShowLyrics}
        hdCover={hdCover}
      />
    </div>
  );
}
