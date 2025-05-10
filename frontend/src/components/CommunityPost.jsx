import React, { useState } from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './CommunityPost.css';

const CommunityPost = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      // Create a storage reference
      const storageRef = ref(storage, `community/${Date.now()}_${file.name}`);
      
      // Create file metadata including the content type
      const metadata = {
        contentType: file.type
      };

      // Upload file and metadata
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      // Listen for state changes, errors, and completion of the upload
      uploadTask.on('state_changed',
        (snapshot) => {
          // Get task progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          // Handle errors
          setError(error.message);
          console.error('Upload error:', error);
        },
        async () => {
          // Upload completed successfully
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Add post to Firestore
            await addDoc(collection(db, 'posts'), {
              fileUrl: downloadURL,
              fileName: file.name,
              fileType: file.type,
              uploadedBy: currentUser.email,
              timestamp: serverTimestamp()
            });

            // Reset form
            setFile(null);
            setUploadProgress(0);
            setError(null);
          } catch (error) {
            setError('Error saving post: ' + error.message);
            console.error('Error saving post:', error);
          }
        }
      );
    } catch (error) {
      setError('Error starting upload: ' + error.message);
      console.error('Error starting upload:', error);
    }
  };

  return (
    <div className="community-post">
      <h2>Share with Community</h2>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          onChange={handleFileChange}
          accept="video/*,image/*"
        />
        <button type="submit" disabled={!file || uploadProgress > 0}>
          {uploadProgress > 0 ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {uploadProgress > 0 && (
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default CommunityPost; 