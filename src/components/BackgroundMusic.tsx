
import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, SkipForward, Play, Pause, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const PLAYLIST = [
  {
    title: "Acoria of the Tartarus",
    src: "/audio/Acoria of the Tartarus.mp3",
  },
  {
    title: "Blades Above the Alehouse",
    src: "/audio/Blades Above the Alehouse.mp3",
  },
  {
    title: "Thorns of the Haligtree",
    src: "/audio/Thorns of the Haligtree.mp3",
  },
];

export function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem("bg_music_muted") === "true";
  });
  const [volume, setVolume] = useState([0.3]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Persist mute state
  useEffect(() => {
    localStorage.setItem("bg_music_muted", String(isMuted));
  }, [isMuted]);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(PLAYLIST[currentTrackIndex].src);
    audioRef.current = audio;
    audio.loop = false; // We handle loop by playing next track
    audio.volume = isMuted ? 0 : volume[0]; // Respect mute immediately

    // Event listeners
    const handleEnded = () => {
      playNext();
    };

    const handleError = (e: Event) => {
      console.error("Audio playback error:", e);
      // Try next track on error, but don't crash
      playNext();
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    // Initial play attempt (might be blocked by browser)
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
           // Autoplay errors are common, just log it.
          console.log("Autoplay prevented:", error);
          setIsPlaying(false);
        });
      }
    }

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [currentTrackIndex]); // Re-create when track changes

  // Handle volume changes without re-creating audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0];
    }
  }, [volume, isMuted]);

  // Handle global interaction fallback
  useEffect(() => {
    const handleInteraction = () => {
      if (!isPlaying && !hasInteracted && audioRef.current) {
        setHasInteracted(true);
        setIsPlaying(true);
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            console.error("Fallback play failed:", e);
            // Don't set isPlaying(false) here to avoid loops, just let it be
          });
        }
      }
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [isPlaying, hasInteracted]);

  // Handle play/pause toggle
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.error("Play failed:", e);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => {
    if (!hasInteracted) setHasInteracted(true);
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    if (!isPlaying) setIsPlaying(true);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 transition-all duration-300",
        isMinimized ? "w-auto" : "w-64"
      )}
    >
      <div className={cn(
        "bg-background/80 backdrop-blur-md border border-border rounded-lg shadow-lg overflow-hidden transition-all duration-300",
        isMinimized ? "p-2" : "p-4 w-full"
      )}>
        {/* Minimized View */}
        {isMinimized ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(false)}
            className="rounded-full hover:bg-primary/20"
          >
            <Music className={cn("h-5 w-5", isPlaying && "animate-pulse text-primary")} />
          </Button>
        ) : (
          /* Maximized View */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <Music className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-medium truncate">
                  {PLAYLIST[currentTrackIndex].title}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsMinimized(true)}
              >
                <span className="sr-only">Minimize</span>
                <span className="text-xs">_</span>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlay}
                className="h-10 w-10 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={playNext}
                className="h-8 w-8"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Slider
                value={volume}
                max={1}
                step={0.01}
                onValueChange={setVolume}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className={cn("h-6 w-6 shrink-0", isMuted && "text-destructive")}
                title={isMuted ? "Sesi aç" : "Sessize al"}
              >
                {isMuted || volume[0] === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
