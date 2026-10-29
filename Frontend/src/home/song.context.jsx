import { useState } from "react";
import { SongContext } from "./song.context-value.js";

export const SongContextProvider = ({ children }) => {
  const [song, setSong] = useState({
    url: "https://ik.imagekit.io/d6afxy9ecj/moodify/songs/Jashn_E_Bahaaraa_-5b8d8PXz.mp3",
    posterUrl:
      "https://ik.imagekit.io/d6afxy9ecj/moodify/posters/Jashn_E_Bahaaraa_2fIv9gUcF.jpeg",
    title: "Jashn E Bahaaraa",
    mood: "happy",
  });

  const [loading, setLoading] = useState(false);

  return (
    <SongContext.Provider value={{ loading, setLoading, song, setSong }}>
      {children}
    </SongContext.Provider>
  );
};
