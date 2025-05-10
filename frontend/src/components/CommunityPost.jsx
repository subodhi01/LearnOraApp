import React, { useState, useRef } from 'react';
import { storage, db } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './CommunityPost.css';

const CommunityPost = () => {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();
  const { user, currentUser } = useAuth();
  const isAuthenticated = user || currentUser;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setMediaType('image');
      } else if (file.type.startsWith('video/')) {
        if (file.size > 30 * 1024 * 1024) { // 30MB limit
          alert('Video must be less than 30 seconds long');
          return;
        }
        setMediaType('video');
      }
      setMediaFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to post');
      return;
    }

    try {
      setIsUploading(true);
      let mediaUrl = '';

      if (mediaFile) {
        const storageRef = ref(storage, `community/${Date.now()}_${mediaFile.name}`);
        await uploadBytes(storageRef, mediaFile);
        mediaUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'communityPosts'), {
        content,
        mediaUrl,
        mediaType,
        userId: currentUser?.uid || user?.email,
        userName: currentUser?.displayName || `${user?.firstName} ${user?.lastName}` || 'Anonymous',
        createdAt: serverTimestamp(),
      });

      setContent('');
      setMediaFile(null);
      setMediaType(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error posting:', error);
      alert('Error creating post');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="community-post-container">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts..."
          required
        />
        <div className="media-upload">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          {mediaFile && (
            <div className="media-preview">
              {mediaType === 'image' ? (
                <img src={URL.createObjectURL(mediaFile)} alt="Preview" />
              ) : (
                <video src={URL.createObjectURL(mediaFile)} controls />
              )}
            </div>
          )}
        </div>
        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default CommunityPost; 