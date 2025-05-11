import React, { useState, useEffect } from 'react';
import MeetingCard from './MeetingCard';
import { getMeetings } from '../utils/localStorageUtils';

const MeetingList = ({ refreshTrigger }) => {
  const [meetings, setMeetings] = useState([]);
  
  // Sort meetings by date (upcoming first, then past)
  const sortMeetings = (meetings) => {
    return [...meetings].sort((a, b) => {
      const dateA = new Date(a.dateTime);
      const dateB = new Date(b.dateTime);
      const now = new Date();
      
      // If one is in the past and one is in the future, prioritize future meetings
      const aIsPast = dateA < now;
      const bIsPast = dateB < now;
      
      if (aIsPast && !bIsPast) return 1;
      if (!aIsPast && bIsPast) return -1;
      
      // Otherwise sort by date (ascending for upcoming, descending for past)
      return aIsPast ? dateB - dateA : dateA - dateB;
    });
  };
  
  // Load meetings from localStorage
  const loadMeetings = () => {
    const allMeetings = getMeetings();
    setMeetings(sortMeetings(allMeetings));
  };
  
  // Load meetings on component mount and when refreshTrigger changes
  useEffect(() => {
    loadMeetings();
  }, [refreshTrigger]);
  
  // Handle meeting deletion
  const handleDelete = () => {
    loadMeetings();
  };
  
  // Group meetings by their status (upcoming or past)
  const upcomingMeetings = meetings.filter(meeting => new Date(meeting.dateTime) > new Date());
  const pastMeetings = meetings.filter(meeting => new Date(meeting.dateTime) <= new Date());
  
  return (
    <div className="meeting-list">
      <h2>Your Meetings</h2>
      
      {meetings.length === 0 ? (
        <p>No meetings scheduled. Create one to get started!</p>
      ) : (
        <>
          <h3>Upcoming Meetings ({upcomingMeetings.length})</h3>
          {upcomingMeetings.length === 0 ? (
            <p>No upcoming meetings.</p>
          ) : (
            upcomingMeetings.map(meeting => (
              <MeetingCard 
                key={meeting.id} 
                meeting={meeting} 
                onDelete={handleDelete} 
              />
            ))
          )}
          
          {pastMeetings.length > 0 && (
            <>
              <h3>Past Meetings ({pastMeetings.length})</h3>
              {pastMeetings.map(meeting => (
                <MeetingCard 
                  key={meeting.id} 
                  meeting={meeting} 
                  onDelete={handleDelete} 
                />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MeetingList;