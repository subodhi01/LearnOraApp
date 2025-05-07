import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './CommentSection.css';

const CommentInput = ({ initialValue = '', onSubmit, onCancel, placeholder }) => {
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

  return (
    <div className="comment-input-container">
      <textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="comment-input"
        rows={3}
      />
      <div className="comment-actions">
        <button onClick={handleSubmit} className="submit-comment-button">
          {initialValue ? 'Save' : 'Post Comment'}
        </button>
        {onCancel && (
          <button onClick={handleCancel} className="cancel-button">
            Cancel
          </button>
        )}
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
  handleCancel
}, ref) => {
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
              {isOwner && !isReply && (
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
                    onClick={() => onToggleVisibility(comment.id)}
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
              isOwner={isOwner}
              isContentOwner={isContentOwner}
              onUpdateComment={onUpdateComment}
              replyingTo={replyingTo}
              editingComment={editingComment}
              errors={errors}
              handleSubmit={handleSubmit}
              handleCancel={handleCancel}
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

  // Effect to handle comment highlighting and scrolling
  useEffect(() => {
    if (highlightCommentId) {
      // Always expand comments when there's a highlightCommentId
      setExpandedComments(prev => ({ ...prev, [contentId]: true }));
      
      // Wait for the next render cycle to ensure the comment is rendered
      setTimeout(() => {
        if (highlightedCommentRef.current) {
          // Scroll to the highlighted comment
          highlightedCommentRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Add highlight animation
          highlightedCommentRef.current.classList.add('highlight-comment');
          
          // Remove highlight after animation
          setTimeout(() => {
            highlightedCommentRef.current?.classList.remove('highlight-comment');
          }, 2000);
        }
      }, 100);
    }
  }, [highlightCommentId, contentId]);

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
    setEditingComment(null);
  };

  const handleEdit = (commentId) => {
    setEditingComment(commentId);
    setReplyingTo(null);
  };

  const handleCancel = () => {
    setReplyingTo(null);
    setEditingComment(null);
  };

  const handleSubmit = (text) => {
    if (replyingTo) {
      onReply(contentId, replyingTo, text);
    } else {
      onCommentSubmit(contentId, null, text);
    }
    handleCancel();
    setShowCommentInput(false);
  };

  const handleUpdate = (commentId, newText) => {
    onCommentUpdate(contentId, commentId, newText);
    handleCancel();
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