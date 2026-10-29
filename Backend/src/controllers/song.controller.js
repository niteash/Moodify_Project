const songModel = require("../models/song.model");
const id3 = require("node-id3");
const StorageService = require("../services/storage.service");

async function uploadSong(req, res) {
  const songBuffer = req.file.buffer;
  const { mood } = req.body;
  const tags = id3.read(songBuffer);

  console.log(tags);

  const [songFile, posterFile] = await Promise.all([
    StorageService.uploadFileToImageKit({
      buffer: songBuffer,
      fileName: tags.title + ".mp3",
      folder: "/moodify/songs",
    }),
    StorageService.uploadFileToImageKit({
      buffer: tags.image?.imageBuffer,
      fileName: tags.title + ".jpeg",
      folder: "/moodify/posters",
    }),
  ]);

  const song = await songModel.create({
    url: songFile.url,
    posterUrl: posterFile.url,
    title: tags.title,
    mood: mood,
  });
  res.status(201).json({ message: "Song created successfully", song });
}

async function getAllSongs(req, res) {
  try {
    const { mood } = req.query;

    const filter = mood ? { mood } : {};
    const songs = await songModel.find(filter);

    res.status(200).json({
      message: "Songs fetched successfully",
      songs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch songs",
      error: error.message,
    });
  }
}
module.exports = {
  uploadSong,
  getAllSongs,
};
