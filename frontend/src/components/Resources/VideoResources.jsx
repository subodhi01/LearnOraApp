import React, { useState } from 'react';
import './VideoResources.css';

const VideoResources = () => {
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleVideoUpload = async (event) => {
    const files = Array.from(event.target.files);
    setUploading(true);
    setError('');

    try {
      // Here you would typically upload the videos to your backend/storage
      // For now, we'll just create local URLs for demonstration
      const newVideos = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString()
      }));

      setVideos(prev => [...prev, ...newVideos]);
    } catch (err) {
      setError('Failed to upload videos. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = (videoId) => {
    setVideos(prev => prev.filter(video => video.id !== videoId));
  };

  return (
    <div className="video-resources">
      <h2>Video Resources</h2>
      
      <div className="upload-section">
        <label htmlFor="video-upload" className="upload-button">
          {uploading ? 'Uploading...' : 'Upload Videos'}
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            multiple
            onChange={handleVideoUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="videos-grid">
        {videos.map(video => (
          <div key={video.id} className="video-card">
            <video controls>
              <source src={video.url} type={video.type} />
              Your browser does not support the video tag.
            </video>
            <div className="video-info">
              <h3>{video.name}</h3>
              <p>Size: {(video.size / (1024 * 1024)).toFixed(2)} MB</p>
              <p>Uploaded: {new Date(video.uploadDate).toLocaleDateString()}</p>
              <button 
                className="delete-button"
                onClick={() => handleDeleteVideo(video.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <p className="no-videos">No videos uploaded yet. Upload some videos to get started!</p>
      )}
    </div>
  );
};

export default VideoResources; 