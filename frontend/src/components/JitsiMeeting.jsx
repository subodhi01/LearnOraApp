import React, { useEffect, useRef } from 'react';
import { getMeetingById } from '../utils/localStorageUtils';

const JitsiMeeting = ({ roomId }) => {
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  
  useEffect(() => {
    // Fetch meeting data from localStorage
    const meeting = getMeetingById(roomId);
    
    if (!meeting) {
      console.error("Meeting not found:", roomId);
      return;
    }
    
    // Make sure the Jitsi Meet API script is loaded
    if (window.JitsiMeetExternalAPI) {
      const domain = 'meet.jit.si';
      
      // Creating the meeting options object
      const options = {
        roomName: roomId, // Using the roomId as the Jitsi room name
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          prejoinPageEnabled: false
        },
        interfaceConfigOverwrite: {
          filmStripOnly: false,
          SHOW_JITSI_WATERMARK: false,
        },
        userInfo: {
          displayName: 'Meeting Participant'
        }
      };
      
      // Create the Jitsi Meet API instance
      jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
      
      // Add event listeners
      jitsiApiRef.current.addEventListeners({
        readyToClose: () => {
          console.log('Meeting closed');
        },
        videoConferenceJoined: () => {
          console.log('Local user joined');
        },
        participantJoined: (participant) => {
          console.log('Participant joined:', participant);
        }
      });
    } else {
      console.error("Jitsi Meet API not loaded!");
    }
    
    // Clean up
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, [roomId]);
  
  return (
    <div className="jitsi-container" ref={jitsiContainerRef}></div>
  );
};

export default JitsiMeeting;