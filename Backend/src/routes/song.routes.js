const express = require("express");
const upload = require("../middlewares/upload.middleware");
const router = express.Router();
const songController = require("../controllers/song.controller");

router.post("/", upload.single("song"), songController.uploadSong);

router.get("/", songController.getAllSongs);

module.exports = router;
