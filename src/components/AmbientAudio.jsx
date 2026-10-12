import { useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/audio/airport-ambience.mp3";

export default function AmbientAudio({ active }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.12;
    audioRef.current = audio;

    const start = async () => {
      if (!active || !audio.paused) return;

      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        // Browser autoplay policy may wait for a user gesture.
      }
    };

    window.addEventListener("pointerdown", start, {
      passive: true,
    });

    if (active) start();

    return () => {
      window.removeEventListener("pointerdown", start);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [active]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    audio.pause();
    setIsPlaying(false);
  };

  return (
    <button
      type="button"
      className="audio-toggle"
      data-cursor="interactive"
      onClick={toggle}
      aria-label={isPlaying ? "Mute ambient audio" : "Enable ambient audio"}
    >
      <span className="audio-bars" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {isPlaying ? "SOUND ON" : "SOUND"}
    </button>
  );
}
