import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import videoService from '../../services/videoService';
import './VideoResources.css';

const VideoResources = () => {
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch videos when component mounts
  useEffect(() => {
    if (user) {
      fetchVideos();
    }
  }, [user]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedVideos = await videoService.getAllVideos();
      setVideos(fetchedVideos);
    } catch (err) {
      console.error('Error fetching videos:', err);
      if (err.response?.status === 403) {
        setError('You do not have permission to access videos. Please contact support.');
      } else {
        setError('Failed to load videos. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      // Upload each video file
      const uploadPromises = files.map(file => videoService.uploadVideo(file));
      const uploadedVideos = await Promise.all(uploadPromises);
      
      // Update the videos list with the newly uploaded videos
      setVideos(prev => [...prev, ...uploadedVideos]);
    } catch (err) {
      console.error('Upload error:', err);
      if (err.response?.status === 403) {
        setError('You do not have permission to upload videos. Please contact support.');
      } else {
        setError('Failed to upload videos. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      setError('');
      await videoService.deleteVideo(videoId);
      setVideos(prev => prev.filter(video => video.id !== videoId));
    } catch (err) {
      console.error('Delete error:', err);
      if (err.response?.status === 403) {
        setError('You do not have permission to delete this video.');
      } else {
        setError('Failed to delete video. Please try again.');
      }
    }
  };

  if (!user) {
    return (
      <div className="auth-message">
        Please log in to access video resources.
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading videos...</div>;
  }

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

      {videos.length === 0 && !loading && (
        <p className="no-videos">No videos uploaded yet. Upload some videos to get started!</p>
      )}
    </div>
  );
};

export default VideoResources; 