import React, { useState, useRef } from 'react';
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

const CommentItem = ({ 
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
  errors
}) => {
  const isReplying = replyingTo === comment.id;
  const isEditing = editingComment === comment.id;

  return (
    <div 
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
                    onClick={() => onDelete(comment.id)}
                  >
                    Delete
                  </button>
                </>
              )}
              {!isOwner && isContentOwner && (
                <>
                  <button
                    className="delete-button"
                    onClick={() => onDelete(comment.id)}
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
        <div className="reply-form">
          <CommentInput
            onSubmit={(text) => onReply(comment.id, text)}
            onCancel={() => onReplyClick(null)}
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentSection = ({
  contentId,
  comments = [],
  onCommentSubmit,
  onCommentUpdate,
  onCommentDelete,
  onCommentToggleVisibility,
  onReply,
  isContentOwner,
  errors = {}
}) => {
  const { user } = useAuth();
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});

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

    return (
      <div key={comment.id} className={`comment-container level-${level}`}>
        <div className={`comment ${comment.hidden ? 'hidden-comment' : ''}`} data-comment-id={comment.id}>
          <div className="comment-header">
            <span className="comment-username">{comment.username}</span>
            <span className="comment-date">
              {new Date(comment.createdAt).toLocaleDateString()}
              {comment.hidden && <span className="hidden-badge">Hidden</span>}
            </span>
          </div>
          {isEditing ? (
            <CommentInput
              initialValue={comment.text}
              onSubmit={(text) => handleUpdate(comment.id, text)}
              onCancel={handleCancel}
              placeholder="Edit your comment..."
            />
          ) : (
            <p className="comment-text">{comment.text}</p>
          )}
          {commentError && <span className="error-message">{commentError}</span>}
          <div className="comment-actions">
            <button onClick={() => handleReply(comment.id)} className="reply-button">
              Reply
            </button>
            {canEdit && (
              <>
                <button onClick={() => handleEdit(comment.id)} className="edit-button">
                  Edit
                </button>
                <button onClick={() => onCommentDelete(contentId, comment.id)} className="delete-button">
                  Delete
                </button>
              </>
            )}
            {isContentOwner && !canEdit && (
              <>
                <button onClick={() => onCommentDelete(contentId, comment.id)} className="delete-button">
                  Delete
                </button>
                <button
                  onClick={() => onCommentToggleVisibility(contentId, comment.id)}
                  className={comment.hidden ? 'unhide-button' : 'hide-button'}
                >
                  {comment.hidden ? 'Unhide' : 'Hide'}
                </button>
              </>
            )}
          </div>
        </div>
        {isReplying && (
          <CommentInput
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            placeholder="Write a reply..."
          />
        )}
        {comment.replies && comment.replies.length > 0 && (
          <div className="replies-container">
            {comment.replies.map((reply) => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
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
      {expandedComments[contentId] && (
        <>
          {user ? (
            <CommentInput
              onSubmit={(text) => onCommentSubmit(contentId, null, text)}
              placeholder="Write a comment..."
            />
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