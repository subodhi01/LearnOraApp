import React from 'react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import './ReactionSection.css';

const ReactionSection = ({
  contentId,
  contentType,
  reactions = {},
  userReactions = {},
  onReaction,
  error
}) => {
  const handleReaction = (reactionType) => {
    onReaction(contentId, reactionType);
  };

  const currentReaction = userReactions[contentId];
  const reactionCounts = reactions[contentId] || { likes: 0, dislikes: 0 };

  return (
    <div className="reaction-section">
      {error && <div className="reaction-error">{error}</div>}
      <button
        className={`reaction-button like ${currentReaction === 'LIKE' ? 'active' : ''}`}
        onClick={() => handleReaction('LIKE')}
      >
        <FaThumbsUp />
        <span className="reaction-count">{reactionCounts.likes}</span>
      </button>
      <button
        className={`reaction-button dislike ${currentReaction === 'DISLIKE' ? 'active' : ''}`}
        onClick={() => handleReaction('DISLIKE')}
      >
        <FaThumbsDown />
        <span className="reaction-count">{reactionCounts.dislikes}</span>
      </button>
    </div>
  );
};

export default ReactionSection; 