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

  const getLikeButtonTitle = () => {
    if (currentReaction === 'LIKE') {
      return 'Click to remove your like';
    }
    if (currentReaction === 'DISLIKE') {
      return 'Click to change your dislike to a like';
    }
    return 'Click to like';
  };

  const getDislikeButtonTitle = () => {
    if (currentReaction === 'DISLIKE') {
      return 'Click to remove your dislike';
    }
    if (currentReaction === 'LIKE') {
      return 'Click to change your like to a dislike';
    }
    return 'Click to dislike';
  };

  return (
    <div className="reaction-section">
      {error && <div className="reaction-error">{error}</div>}
      <div className="reaction-buttons">
        <button
          className={`reaction-button like ${currentReaction === 'LIKE' ? 'active' : ''}`}
          onClick={() => handleReaction('LIKE')}
          title={getLikeButtonTitle()}
        >
          <FaThumbsUp />
          <span className="reaction-count">{reactionCounts.likes}</span>
        </button>
        <button
          className={`reaction-button dislike ${currentReaction === 'DISLIKE' ? 'active' : ''}`}
          onClick={() => handleReaction('DISLIKE')}
          title={getDislikeButtonTitle()}
        >
          <FaThumbsDown />
          <span className="reaction-count">{reactionCounts.dislikes}</span>
        </button>
      </div>
      {currentReaction && (
        <div className="reaction-status">
          You {currentReaction.toLowerCase()}d this course
        </div>
      )}
    </div>
  );
};

export default ReactionSection; 