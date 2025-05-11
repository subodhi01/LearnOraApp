import React, { useState } from 'react';
import MeetingForm from '../components/MeetingForm';
import MeetingList from '../components/MeetingList';

const HomePage = () => {
  // State to trigger refresh of meeting list when a new meeting is added
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Handler for when a new meeting is created
  const handleMeetingCreated = () => {
    // Increment the refresh trigger to cause MeetingList to reload
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="container" style={{ minHeight: '100vh', padding: '2rem' }}>
      <header className="app-header">
        <h1>Meeting Scheduler</h1>
      </header>
      
      <div className="two-column" style={{ marginTop: '2rem' }}>
        <div className="meeting-form-container">
          <MeetingForm onMeetingCreated={handleMeetingCreated} />
        </div>
        <div className="meeting-list-container">
          <MeetingList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;