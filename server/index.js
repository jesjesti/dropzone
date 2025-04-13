const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const os = require("os");
const mime = require("mime-types");

const app = express();
const PORT = 3001;
app.use(cors());

app.use(express.static(path.join(__dirname, "dist")));
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    if (!req.cleanedFileName) {
      return cb(new Error("Filename is required"));
    }
    cb(null, req.cleanedFileName);
  },
});
const upload = multer({ storage });

const validateUploadFile = (req, res, next) => {
  const customName = req.query.filename;
  if (!customName) {
    return res.status(400).json({
      statusMessage: "Filename is required",
      statusCode: 500,
      data: null,
    });
  }

  const cleanName = customName.replace(/[^a-z0-9_\-\.]/gi, "_");
  const filePath = path.join(uploadDir, cleanName);

  if (fs.existsSync(filePath)) {
    return res.status(409).json({
      statusMessage: "File with the same name already exists",
      statusCode: 500,
      data: null,
    });
  }

  // Attach to request object for reuse in storage logic
  req.cleanedFileName = cleanName;
  next();
};

app.get("/api/list", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err)
      return res.status(500).send({
        statusMessage: "Unable to list files",
        statusCode: 500,
        data: null,
      });
    const fileDataList = files.map((file) => {
      const fullPath = path.join(uploadDir, file);
      const stat = fs.statSync(fullPath);
      return {
        fileName: file,
        fileSize: formatFileSize(stat.size), // in bytes
        fileType: normalizeMime(mime.lookup(file)) || "unknown", // eg: image/png, application/pdf
      };
    });

    res.json({ statusMessage: "Success", statusCode: 200, data: fileDataList });
  });
});

app.post(
  "/api/upload",
  validateUploadFile,
  upload.single("file"),
  (req, res) => {
    res.json({
      statusMessage: "File uploaded successfully",
      statusCode: 200,
      data: req.cleanedFileName,
    });
  }
);

app.delete("/api/delete", (req, res) => {
  const fileName = req.query.name;

  if (!fileName) {
    return res.status(400).json({
      statusMessage: "File name is required",
      statusCode: 500,
      data: null,
    });
  }
  const filePath = path.join(uploadDir, fileName);
  fs.unlink(filePath, (err) => {
    if (err) {
      if (err.code === "ENOENT") {
        return res.status(404).json({
          statusMessage: "File not found",
          statusCode: 500,
          data: null,
        });
      }
      return res.status(500).json({
        statusMessage: "Error deleting file",
        statusCode: 500,
        data: null,
      });
    }

    res.json({
      statusMessage: "File deleted successfully",
      statusCode: 500,
      data: null,
    });
  });
});

app.get("/api/view/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(uploadDir, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  const mimeType = mime.lookup(filePath) || "application/octet-stream";
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (!range) {
    // No range requested, send full file
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": mimeType,
      "Accept-Ranges": "bytes",
      "Content-Disposition":
        mimeType.startsWith("video") || mimeType.startsWith("audio")
          ? "inline"
          : `attachment; filename="${fileName}"`,
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // Partial content requested (seeking)
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": mimeType,
      "Content-Disposition":
        mimeType.startsWith("video") || mimeType.startsWith("audio")
          ? "inline"
          : `attachment; filename="${fileName}"`,
    });

    fs.createReadStream(filePath, { start, end }).pipe(res);
  }
});

app.get("/api/access-info", (req, res) => {
  let accessURL = "http://" + getLocalIpAddress() + ":3001";
  res.json({ statusMessage: "Success", statusCode: 200, data: accessURL });
});

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      // Skip internal (127.0.0.1) and non-IPv4 addresses
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost"; // fallback
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(2) + " KB";
  const mb = kb / 1024;
  if (mb < 1024) return mb.toFixed(2) + " MB";
  const gb = mb / 1024;
  return gb.toFixed(2) + " GB";
};

const normalizeMime = (mimeType) => {
  if (mimeType === "application/mp4") return "video/mp4";
  return mimeType;
};

app.get("/", function (req, res) {
  res.sendFile("index.html", { root: path.join(__dirname, "dist") });
});

app.listen(PORT, () => {
  let ip = getLocalIpAddress();
  console.log("Server running at http://" + ip + ":" + PORT);
});
