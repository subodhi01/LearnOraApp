const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const auth = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 8000;

// Constants for file size limits
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB in bytes

// Middleware
app.use(cors());
app.use(express.json({ limit: '10gb' }));
app.use(express.urlencoded({ extended: true, limit: '10gb' }));
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Video Schema
const videoSchema = new mongoose.Schema({
  name: String,
  url: String,
  type: String,
  size: Number,
  uploadDate: { type: Date, default: Date.now },
  userId: { type: String, required: true },
  userName: { type: String, required: true }
});

const Video = mongoose.model('Video', videoSchema);

// Configure multer for chunk uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const chunkNumber = req.body.chunkNumber;
    const totalChunks = req.body.totalChunks;
    const originalName = req.body.originalName;
    cb(null, `${originalName}.part${chunkNumber}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: CHUNK_SIZE, // Limit each chunk to 5MB
  },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Increase server timeout
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  server.timeout = 3600000; // 1 hour timeout for large uploads
});

// Routes
app.get('/api/videos', auth, async (req, res) => {
  try {
    const videos = await Video.find().sort({ uploadDate: -1 });
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Handle chunk upload
app.post('/api/videos/upload-chunk', auth, upload.single('chunk'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No chunk uploaded' });
    }

    const { chunkNumber, totalChunks, originalName } = req.body;
    
    // If this is the last chunk, combine all chunks
    if (parseInt(chunkNumber) === parseInt(totalChunks)) {
      const finalPath = path.join(uploadDir, originalName);
      const writeStream = fs.createWriteStream(finalPath);
      
      // Combine all chunks
      for (let i = 1; i <= totalChunks; i++) {
        const chunkPath = path.join(tempDir, `${originalName}.part${i}`);
        const chunkBuffer = fs.readFileSync(chunkPath);
        writeStream.write(chunkBuffer);
        // Delete the chunk file
        fs.unlinkSync(chunkPath);
      }
      
      writeStream.end();
      
      // Wait for the write stream to finish
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      // Create video record
      const video = new Video({
        name: originalName,
        url: `/uploads/${originalName}`,
        type: req.file.mimetype,
        size: req.file.size * totalChunks,
        userId: req.user.id,
        userName: req.user.email
      });

      await video.save();
      res.status(201).json(video);
    } else {
      // For intermediate chunks, just acknowledge receipt
      res.status(200).json({ message: 'Chunk uploaded successfully' });
    }
  } catch (error) {
    console.error('Error uploading chunk:', error);
    res.status(500).json({ error: 'Failed to upload chunk: ' + error.message });
  }
});

app.delete('/api/videos/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check if user is the owner of the video
    if (video.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this video' });
    }

    // Delete the file from uploads directory
    const filePath = path.join(uploadDir, path.basename(video.url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Video.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Chunk size too large. Maximum chunk size is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: err.message || 'Internal server error' });
}); 