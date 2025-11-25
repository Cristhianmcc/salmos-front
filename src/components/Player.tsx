import { useState, useEffect, RefObject } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  FileText,
  Music2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Song, storage, musicApi } from "../services/api";

interface PlayerProps {
  currentTrack: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  audioRef: RefObject<HTMLAudioElement>;
  onShowLyrics?: () => void;
  hdCover?: string | null;
}

export function Player({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  audioRef,
  onShowLyrics,
  hdCover,
}: PlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [previousVolume, setPreviousVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  // Check if song is liked
  useEffect(() => {
    if (currentTrack) {
      setIsLiked(storage.isLiked(currentTrack.videoId));
    }
  }, [currentTrack]);

  // Debug log for render
  useEffect(() => {
    if (hdCover) console.log(`🖼️ [Player] Rendering with HD Cover: ${hdCover}`);
    else if (currentTrack) console.log(`🖼️ [Player] Rendering with Default Thumbnail: ${currentTrack.thumbnails?.[0]?.url}`);
  }, [hdCover, currentTrack]);

  // Update progress from audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const updateVolume = () => {
      const newVolume = Math.round(audio.volume * 100);
      setVolume(newVolume);
      setIsMuted(audio.volume === 0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("volumechange", updateVolume);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("volumechange", updateVolume);
    };
  }, [audioRef, isPlaying, currentTrack]); // Re-attach listeners when track/state changes to ensure audioRef is ready

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLikeToggle = () => {
    if (currentTrack) {
      const newLikedState = storage.toggleLike(currentTrack);
      setIsLiked(newLikedState);
    }
  };

  if (!currentTrack) {
    return null;
  }

  // Use HD cover if available, otherwise fall back to thumbnail
  const cover = hdCover || currentTrack.thumbnails?.[0]?.url || "";
  const artist =
    currentTrack.artists?.map((a) => a.name).join(", ") || "Unknown Artist";
  const duration = audioRef.current?.duration || 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 mb-[72px] md:mb-0">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col gap-2">
          {/* Progress Bar */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={(value) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = value[0];
                }
              }}
              className="flex-1"
            />
            <span className="w-10">{formatTime(duration)}</span>
          </div>

          {/* Player Controls */}
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* Track Info */}
            <div className="flex items-center gap-3 min-w-0">
              {cover ? (
                <img
                  src={cover}
                  alt={currentTrack.title}
                  className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                  onError={(e) => {
                    // Si falla la imagen, usar el thumbnail de la canción
                    const img = e.currentTarget;
                    if (currentTrack.thumbnails?.[0]?.url && img.src !== currentTrack.thumbnails[0].url) {
                      img.src = currentTrack.thumbnails[0].url;
                    }
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  <Music2 className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 hidden sm:block">
                <p className="truncate text-sm text-white">
                  {currentTrack.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {artist}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hidden sm:flex"
                onClick={handleLikeToggle}
              >
                <Heart
                  className={`w-4 h-4 ${isLiked ? "fill-primary text-primary" : ""
                    }`}
                />
              </Button>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hidden sm:flex"
                onClick={() => setIsShuffle(!isShuffle)}
              >
                <Shuffle
                  className={`w-4 h-4 ${isShuffle ? "text-primary" : ""}`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onPrevious}
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="h-10 w-10 bg-white hover:bg-white/90 hover:scale-105 transition-transform"
                onClick={onPlayPause}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-black fill-current" />
                ) : (
                  <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onNext}
              >
                <SkipForward className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hidden sm:flex"
                onClick={() => setIsRepeat(!isRepeat)}
              >
                <Repeat
                  className={`w-4 h-4 ${isRepeat ? "text-primary" : ""}`}
                />
              </Button>
            </div>

            {/* Volume Controls & Lyrics */}
            <div className="flex items-center justify-end gap-2">
              {/* Botón de letras - visible en móvil y desktop */}
              {onShowLyrics && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    console.log('🎤 [Player] Lyrics button clicked!');
                    onShowLyrics();
                  }}
                  title="Ver letras"
                >
                  <FileText className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:flex">
                <ListMusic className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  if (audioRef.current) {
                    if (isMuted) {
                      // Restaurar el volumen anterior
                      const volumeToRestore = previousVolume > 0 ? previousVolume : 70;
                      setVolume(volumeToRestore);
                      audioRef.current.volume = volumeToRestore / 100;
                      setIsMuted(false);
                    } else {
                      // Guardar el volumen actual antes de mutear
                      setPreviousVolume(volume);
                      setVolume(0);
                      audioRef.current.volume = 0;
                      setIsMuted(true);
                    }
                  }
                }}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={(value) => {
                  const newVolume = value[0];
                  setVolume(newVolume);
                  if (newVolume > 0) {
                    setIsMuted(false);
                    setPreviousVolume(newVolume);
                  }
                  if (audioRef.current) {
                    audioRef.current.volume = newVolume / 100;
                  }
                }}
                className="w-24"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
