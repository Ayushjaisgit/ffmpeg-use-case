const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

ffmpeg.setFfmpegPath("C:\\ffmpeg\\bin\\ffmpeg.exe");
ffmpeg.setFfprobePath("C:\\ffmpeg\\bin\\ffprobe.exe");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.post(
  "/process-media",
  upload.fields([
    { name: "media", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  (req, res) => {
    if (!req.files || !req.files.media || !req.files.logo) {
      return res.status(400).send("Please upload both media and a logo.");
    }

    const mediaPath = req.files.media[0].path;
    const logoPath = req.files.logo[0].path;
    const heading = req.body.heading || "";
    const fileExt = path.extname(mediaPath).toLowerCase();
    const outputPath = `uploads/output_${Date.now()}${fileExt}`;

    if (fileExt === ".mp4" || fileExt === ".mov" || fileExt === ".avi") {
      ffmpeg(mediaPath)
        .input(logoPath)
        .complexFilter([
          {
            filter: "scale",
            options: "100:100",
            inputs: "[1:v]",
            outputs: "resized_logo",
          },
          {
            filter: "overlay",
            options: "W-w-50:50",
            inputs: "[0:v][resized_logo]",
            outputs: "video_with_logo",
          },
          {
            filter: "drawtext",
            options: `text='${heading}':x=(w-text_w)/2:y=h-50:fontsize=24:fontcolor=white`,
            inputs: "video_with_logo",
            outputs: "video_with_heading",
          },
        ])
        .map("[video_with_heading]")
        .output(outputPath)
        .on("end", () => {
          res.send({
            message: "Video processed successfully",
            output: outputPath,
          });
        })
        .on("error", (err) => {
          console.error("FFmpeg error:", err);
          res.status(500).send("Error processing video");
        })
        .run();
    } else {
      res.status(400).send("Unsupported media type");
    }
  }
);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
