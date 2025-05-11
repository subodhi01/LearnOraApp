import React, { useState } from 'react';
import JoinMeetingModal from './JoinMeetingModal';
import { deleteMeeting } from '../utils/localStorageUtils';

const MeetingCard = ({ meeting, onDelete }) => {
  const [showJoinModal, setShowJoinModal] = useState(false);
  
  // Format the meeting date and time for display
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    }).format(date);
  };
  
  // Check if the meeting is in the past
  const isPastMeeting = () => {
    const now = new Date();
    const meetingDate = new Date(meeting.dateTime);
    return meetingDate < now;
  };
  
  // Handle meeting deletion
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      deleteMeeting(meeting.id);
      if (onDelete) onDelete(meeting.id);
    }
  };
  
  return (
    <div className="card meeting-card">
      <h3>{meeting.title}</h3>
      <p><strong>When:</strong> {formatDateTime(meeting.dateTime)}</p>
      <p><strong>Room ID:</strong> {meeting.id}</p>
      
      {isPastMeeting() ? (
        <div className="alert alert-danger">This meeting has already passed</div>
      ) : (
        <div className="meeting-card-actions">
          <button 
            className="btn" 
            onClick={() => setShowJoinModal(true)}
          >
            Join Meeting
          </button>
          <button 
            className="btn btn-danger" 
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}
      
      {showJoinModal && (
        <JoinMeetingModal 
          meeting={meeting}
          onClose={() => setShowJoinModal(false)}
        />
      )}
    </div>
  );
};

export default MeetingCard;