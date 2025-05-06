import React, { useState } from 'react';
// ... other imports ...

const Post = ({ post, onCommentAdded, commentRefs }) => {
    // ... existing state and functions ...

    const renderComment = (comment) => {
        return (
            <div 
                key={comment.id} 
                className="comment"
                ref={el => commentRefs.current[comment.id] = el}
            >
                <div className="comment-header">
                    <span className="comment-username">{comment.username}</span>
                    <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleString()}
                    </span>
                </div>
                <p className="comment-text">{comment.text}</p>
                <div className="comment-actions">
                    <button 
                        className="reply-button"
                        onClick={() => handleReplyClick(comment.id)}
                    >
                        Reply
                    </button>
                </div>
                {replyToId === comment.id && (
                    <div className="reply-form">
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your reply..."
                        />
                        <div className="reply-actions">
                            <button onClick={handleCancelReply}>Cancel</button>
                            <button onClick={() => handleSubmitReply(comment.id)}>Submit</button>
                        </div>
                    </div>
                )}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="replies">
                        {comment.replies.map(reply => renderComment(reply))}
                    </div>
                )}
            </div>
        );
    };

    // ... rest of the component code ...
} 