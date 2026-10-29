import { useRef, useState } from "react";
import { useSong } from "../hooks/useSong";
import "./Player.scss";

const formatTime = (time) => {
  if (!Number.isFinite(time)) {
    return "0:00";
  }

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
};

const Player = () => {
  const { song } = useSong();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [error, setError] = useState("");

  const togglePlayback = async () => {
    const audio = audioRef.current;

    if (!audio || !song?.url) {
      return;
    }

    if (audio.paused) {
      setError("");

      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
        setError(
          "Playback could not start. Check the audio source and try again.",
        );
      }
    } else {
      audio.pause();
    }
  };

  const skip = (seconds) => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const upperBound = Number.isFinite(audio.duration)
      ? audio.duration
      : Number.POSITIVE_INFINITY;
    audio.currentTime = Math.min(
      Math.max(audio.currentTime + seconds, 0),
      upperBound,
    );
    setCurrentTime(audio.currentTime);
  };

  const handleSeek = (event) => {
    const nextTime = Number(event.currentTarget.value);

    if (audioRef.current) {
      audioRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
    }
  };

  const handlePlaybackRate = (event) => {
    const nextRate = Number(event.currentTarget.value);
    setPlaybackRate(nextRate);

    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  return (
    <section className="player" aria-label="Music player">
      <audio
        ref={audioRef}
        src={song?.url}
        preload="metadata"
        onLoadStart={() => {
          setCurrentTime(0);
          setDuration(0);
          setIsPlaying(false);
          setError("");
        }}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) =>
          setCurrentTime(event.currentTarget.currentTime)
        }
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setError("This song could not be loaded.");
        }}
      />

      <div className="player__song">
        {song?.posterUrl ? (
          <img className="player__artwork" src={song.posterUrl} alt="" />
        ) : (
          <div
            className="player__artwork player__artwork--empty"
            aria-hidden="true"
          >
            ♪
          </div>
        )}
        <div className="player__details">
          <p className="player__eyebrow">NOW PLAYING</p>
          <h2 className="player__title">{song?.title || "Choose a song"}</h2>
          {song?.mood && <p className="player__mood">{song.mood}</p>}
        </div>
      </div>

      <div className="player__controls">
        <div className="player__buttons">
          <button
            className="player__skip"
            type="button"
            onClick={() => skip(-5)}
            disabled={!song?.url}
            aria-label="Back 5 seconds"
            title="Back 5 seconds"
          >
            <span aria-hidden="true">↶</span>
            <span>5</span>
          </button>
          <button
            className="player__play"
            type="button"
            onClick={togglePlayback}
            disabled={!song?.url}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
          </button>
          <button
            className="player__skip"
            type="button"
            onClick={() => skip(5)}
            disabled={!song?.url}
            aria-label="Forward 5 seconds"
            title="Forward 5 seconds"
          >
            <span aria-hidden="true">↷</span>
            <span>5</span>
          </button>
        </div>

        <div className="player__timeline">
          <span>{formatTime(currentTime)}</span>
          <input
            aria-label="Seek through song"
            className="player__seek"
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            onChange={handleSeek}
            disabled={!song?.url || !duration}
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <label className="player__speed">
        <span>Speed</span>
        <select
          aria-label="Playback speed"
          value={playbackRate}
          onChange={handlePlaybackRate}
        >
          <option value="0.5">0.5×</option>
          <option value="0.75">0.75×</option>
          <option value="1">1×</option>
          <option value="1.25">1.25×</option>
          <option value="1.5">1.5×</option>
          <option value="2">2×</option>
        </select>
      </label>

      {error && (
        <p className="player__error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
};

export default Player;
