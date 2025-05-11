import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './CommentSection.css';

// Constants for validation
const MAX_COMMENT_LENGTH = 1000;
const MIN_COMMENT_LENGTH = 1;
const COMMENT_COOLDOWN = 5000; // 5 seconds between comments

// List of inappropriate words/phrases to filter
const INAPPROPRIATE_CONTENT = [
  // Profanity
  /\b(fuck|shit|ass|bitch|damn|hell)\b/i,
  // Hate speech
  /\b(hate|stupid|idiot|dumb)\b/i,
  // Spam patterns
  /(http|www\.|\.com|\.net|\.org)/i,
  // All caps shouting
  /^[A-Z\s!]{20,}$/,
  // Repeated characters
  /(.)\1{4,}/,
 
];

const CommentInput = ({ initialValue = '', onSubmit, onCancel, placeholder, error, isSubmitting }) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const textareaRef = useRef(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit(inputValue);
      setInputValue('');
    }
  };

  const handleCancel = () => {
    onCancel();
    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="comment-input-container">
      <textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        className={`comment-input ${error ? 'error' : ''}`}
        rows={3}
        maxLength={MAX_COMMENT_LENGTH}
        disabled={isSubmitting}
      />
      {error && <div className="error-message">{error}</div>}
      <div className="comment-actions">
        <button 
          onClick={handleSubmit} 
          className="submit-comment-button"
          disabled={isSubmitting || !inputValue.trim()}
        >
          {isSubmitting ? 'Posting...' : (initialValue ? 'Save' : 'Post Comment')}
        </button>
        {onCancel && (
          <button 
            onClick={handleCancel} 
            className="cancel-button"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
      </div>
      <div className="comment-length-indicator">
        {inputValue.length}/{MAX_COMMENT_LENGTH} characters
      </div>
    </div>
  );
};

const CommentItem = React.forwardRef(({ 
  comment, 
  level = 0, 
  onReply,
  onReplyClick,
  onEdit, 
  onDelete, 
  onToggleVisibility,
  isOwner,
  isContentOwner,
  onUpdateComment,
  replyingTo,
  editingComment,
  errors,
  handleSubmit,
  handleCancel,
  contentId
}, ref) => {
  const { user } = useAuth();
  const isReplying = replyingTo === comment.id;
  const isEditing = editingComment === comment.id;
  const isReply = level > 0;

  const handleDelete = () => {
    if (comment && comment.id) {
      onDelete(comment.id);
    } else {
      console.error('Cannot delete comment: Invalid comment ID');
    }
  };

  const handleToggleVisibility = () => {
    if (comment && comment.id) {
      onToggleVisibility(contentId, comment.id);
    } else {
      console.error('Cannot toggle visibility: Invalid comment ID');
    }
  };

  return (
    <div 
      ref={ref}
      className={`comment-container level-${level} ${comment.hidden ? 'hidden-comment' : ''}`}
      data-comment-id={comment.id}
    >
      <div className="comment">
        <div className="comment-header">
          <span className="comment-username">{comment.username}</span>
          <span className="comment-date">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
          {comment.hidden && isContentOwner && (
            <span className="hidden-badge">Hidden</span>
          )}
        </div>
        
        {isEditing ? (
          <CommentInput
            initialValue={comment.text}
            onSubmit={(text) => onUpdateComment(comment.id, text)}
            onCancel={() => onEdit(null)}
            placeholder="Edit your comment..."
          />
        ) : (
          <>
            <p className="comment-text">{comment.text}</p>
            <div className="comment-actions">
              <button
                className="reply-button"
                onClick={() => onReplyClick(comment.id)}
              >
                {isReplying ? 'Cancel Reply' : 'Reply'}
              </button>
              {isOwner && (
                <>
                  <button
                    className="edit-button"
                    onClick={() => onEdit(comment.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </>
              )}
              {isContentOwner && !isOwner && (
                <>
                  <button
                    className="delete-button"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                  <button
                    className={comment.hidden ? "unhide-button" : "hide-button"}
                    onClick={handleToggleVisibility}
                  >
                    {comment.hidden ? "Unhide" : "Hide"}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {isReplying && (
        <div className="reply-typing">
          <CommentInput
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            placeholder="Write a reply..."
          />
          {errors[`${comment.id}`] && (
            <span className="error-message">{errors[`${comment.id}`]}</span>
          )}
        </div>
      )}

      {comment.replies?.length > 0 && (
        <div className="replies-container">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              level={level + 1}
              onReply={onReply}
              onReplyClick={onReplyClick}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleVisibility={onToggleVisibility}
              isOwner={user && reply.userId === user.email}
              isContentOwner={isContentOwner}
              onUpdateComment={onUpdateComment}
              replyingTo={replyingTo}
              editingComment={editingComment}
              errors={errors}
              handleSubmit={handleSubmit}
              handleCancel={handleCancel}
              contentId={contentId}
            />
          ))}
        </div>
      )}
    </div>
  );
});

const CommentSection = ({
  contentId,
  comments = [],
  onCommentSubmit,
  onCommentUpdate,
  onCommentDelete,
  onCommentToggleVisibility,
  onReply,
  isContentOwner,
  errors = {},
  highlightCommentId = null
}) => {
  const { user } = useAuth();
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [showCommentInput, setShowCommentInput] = useState(false);
  const highlightedCommentRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCommentTime, setLastCommentTime] = useState(0);
  const [inputError, setInputError] = useState('');

  // Effect to handle comment highlighting and scrolling
  useEffect(() => {
    if (highlightCommentId) {
      setExpandedComments(prev => ({ ...prev, [contentId]: true }));
      
      setTimeout(() => {
        if (highlightedCommentRef.current) {
          highlightedCommentRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          highlightedCommentRef.current.classList.add('highlight-comment');
          
          setTimeout(() => {
            highlightedCommentRef.current?.classList.remove('highlight-comment');
          }, 2000);
        }
      }, 100);
    }
  }, [highlightCommentId, contentId]);

  const validateComment = (text) => {
    if (!text.trim()) return 'Comment cannot be empty';
    if (text.trim().length < MIN_COMMENT_LENGTH) return `Comment must be at least ${MIN_COMMENT_LENGTH} characters long`;
    if (text.length > MAX_COMMENT_LENGTH) return `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`;
    
    // Check for inappropriate content
    for (const pattern of INAPPROPRIATE_CONTENT) {
      if (pattern.test(text)) {
        return 'Your comment contains inappropriate content. Please review and try again.';
      }
    }

    // Check for excessive punctuation
    if ((text.match(/[!?]{3,}/g) || []).length > 0) {
      return 'Please avoid excessive punctuation.';
    }

    // Check for repeated words
    const words = text.toLowerCase().split(/\s+/);
    const wordCount = {};
    for (const word of words) {
      wordCount[word] = (wordCount[word] || 0) + 1;
      if (wordCount[word] > 5) {
        return 'Please avoid repeating the same word multiple times.';
      }
    }

    return '';
  };

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
    setEditingComment(null);
    setInputError('');
  };

  const handleEdit = (commentId) => {
    setEditingComment(commentId);
    setReplyingTo(null);
    setInputError('');
  };

  const handleCancel = () => {
    setReplyingTo(null);
    setEditingComment(null);
    setInputError('');
  };

  const handleSubmit = async (text) => {
    const error = validateComment(text);
    if (error) {
      setInputError(error);
      return;
    }

    // Check for rate limiting
    const now = Date.now();
    if (now - lastCommentTime < COMMENT_COOLDOWN) {
      setInputError('Please wait a moment before posting another comment');
      return;
    }

    setIsSubmitting(true);
    setInputError('');

    try {
      if (replyingTo) {
        await onReply(contentId, replyingTo, text);
      } else {
        await onCommentSubmit(contentId, null, text);
      }
      setLastCommentTime(now);
      handleCancel();
      setShowCommentInput(false);
    } catch (error) {
      setInputError(error.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (commentId, newText) => {
    const error = validateComment(newText);
    if (error) {
      setInputError(error);
      return;
    }

    setIsSubmitting(true);
    setInputError('');

    try {
      await onCommentUpdate(contentId, commentId, newText);
      handleCancel();
    } catch (error) {
      setInputError(error.message || 'Failed to update comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCommentOwner = (comment) => {
    return user && comment.userId === user.email;
  };

  const renderComment = (comment, level = 0) => {
    const isEditing = editingComment === comment.id;
    const isReplying = replyingTo === comment.id;
    const commentError = errors[comment.id];
    const canEdit = isCommentOwner(comment);
    const isHighlighted = comment.id === highlightCommentId;

    return (
      <CommentItem
        key={comment.id}
        comment={comment}
        level={level}
        onReply={onReply}
        onReplyClick={handleReply}
        onEdit={handleEdit}
        onDelete={onCommentDelete}
        onToggleVisibility={onCommentToggleVisibility}
        isOwner={canEdit}
        isContentOwner={isContentOwner}
        onUpdateComment={handleUpdate}
        replyingTo={replyingTo}
        editingComment={editingComment}
        errors={errors}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
        contentId={contentId}
        ref={isHighlighted ? highlightedCommentRef : null}
      />
    );
  };

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h4>Comments</h4>
        <button
          className="toggle-comments-button"
          onClick={() => setExpandedComments(prev => ({ ...prev, [contentId]: !prev[contentId] }))}
        >
          {expandedComments[contentId] ? 'Hide Comments' : 'Show Comments'}
          {comments.length > 0 && <span className="comment-count">{comments.length}</span>}
        </button>
      </div>
      {(expandedComments[contentId] || highlightCommentId) && (
        <>
          {user ? (
            <>
              {!showCommentInput ? (
                <button
                  className="new-comment-button"
                  onClick={() => setShowCommentInput(true)}
                >
                  Write a Comment
                </button>
              ) : (
                <CommentInput
                  onSubmit={handleSubmit}
                  onCancel={() => setShowCommentInput(false)}
                  placeholder="Write a comment..."
                  error={inputError}
                  isSubmitting={isSubmitting}
                />
              )}
            </>
          ) : (
            <p className="login-prompt">
              Please <a href="/login">log in</a> to add a comment.
            </p>
          )}
          {comments.map((comment) => renderComment(comment))}
        </>
      )}
    </div>
  );
};

export default CommentSection; 