import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JitsiMeeting from '../components/JitsiMeeting';
import { getMeetingById } from '../utils/localStorageUtils';

const MeetingRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Get meeting data from localStorage
    const meetingData = getMeetingById(roomId);
    
    if (!meetingData) {
      setError('Meeting not found. It may have been deleted or the URL is incorrect.');
      return;
    }
    
    setMeeting(meetingData);
  }, [roomId]);
  
  const handleBackToHome = () => {
    navigate('/');
  };
  
  if (error) {
    return (
      <div className="container">
        <header className="app-header">
          <h1>Meeting Error</h1>
        </header>
        <div style={{ marginTop: '2rem' }}>
          <div className="card">
            <div className="alert alert-danger">{error}</div>
            <button className="btn" onClick={handleBackToHome}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!meeting) {
    return (
      <div className="container">
        <header className="app-header">
          <h1>Loading Meeting...</h1>
        </header>
      </div>
    );
  }
  
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="app-header meeting-room-header">
        <h1>{meeting.title}</h1>
        <button className="btn" onClick={handleBackToHome}>Exit Meeting</button>
      </header>
      
      <div className="meeting-room-content">
        <JitsiMeeting roomId={roomId} />
      </div>
    </div>
  );
};

export default MeetingRoom;