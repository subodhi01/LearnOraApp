import React from 'react';
import VideoResources from './VideoResources';
import './Resources.css';

const Resources = () => {
  return (
    <div className="resources-page">
      <div className="resources-header">
        <h1>Learning Resources</h1>
        <p>Access and manage your learning resources in one place</p>
      </div>

      <div className="resources-content">
        <VideoResources />
        {/* Add other resource types here in the future */}
      </div>
    </div>
  );
};

export default Resources; 