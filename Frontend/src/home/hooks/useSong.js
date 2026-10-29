import { getSong } from "../service/song.api";
import { useContext, useEffect, useRef } from "react";
import { SongContext } from "../song.context-value.js";

export const useSong = () => {
  const context = useContext(SongContext);

  if (!context) {
    throw new Error("useSong must be used inside SongContextProvider");
  }

  const { loading, setLoading, song, setSong } = context;
  const songRef = useRef(song);

  useEffect(() => {
    songRef.current = song;
  }, [song]);

  const handleGetSong = async ({ mood }) => {
    setLoading(true);

    try {
      const data = await getSong({ mood });
      const songs = data.songs;

      if (!Array.isArray(songs) || songs.length === 0) {
        throw new Error(`No songs are available for the ${mood} mood.`);
      }

      const alternatives =
        songs.length > 1
          ? songs.filter((candidate) => candidate.url !== songRef.current?.url)
          : songs;
      const selection = alternatives.length > 0 ? alternatives : songs;
      const nextSong = selection[Math.floor(Math.random() * selection.length)];

      setSong(nextSong);
    } finally {
      setLoading(false);
    }
  };

  return { loading, song, handleGetSong };
};
