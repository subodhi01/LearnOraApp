package com.learnora.backend.service;

import com.learnora.backend.model.CommentModel;
import com.learnora.backend.model.UserModel;
import com.learnora.backend.model.NotificationModel;
import com.learnora.backend.repository.CommentRepository;
import com.learnora.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CommentService {
    private static final Logger logger = LoggerFactory.getLogger(CommentService.class);

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public CommentModel createComment(CommentModel comment) throws Exception {
        logger.info("Creating comment: postId={}, userId={}, username={}, parentId={}", 
            comment.getPostId(), comment.getUserId(), comment.getUsername(), comment.getParentId());

        // Add debug logging for user ID
        logger.info("Raw user ID from comment: {}", comment.getUserId());
        logger.info("User ID type: {}", comment.getUserId() != null ? comment.getUserId().getClass().getName() : "null");

        if (comment.getPostId() == null || comment.getPostId().isEmpty()) {
            throw new Exception("Post ID is required");
        }
        if (comment.getUserId() == null || comment.getUserId().isEmpty()) {
            logger.error("User ID validation failed - userId is null or empty");
            throw new Exception("User ID is required");
        }
        if (comment.getUsername() == null || comment.getUsername().isEmpty()) {
            throw new Exception("Username is required");
        }
        if (comment.getText() == null || comment.getText().isEmpty()) {
            throw new Exception("Comment text is required");
        }

        // Verify user exists
        UserModel user = userRepository.findByEmail(comment.getUserId())
            .orElseThrow(() -> new Exception("User not found"));
        logger.info("Found user: email={}, name={}", user.getEmail(), user.getFirstName() + " " + user.getLastName());

        // Ensure username matches user's name
        String expectedUsername = user.getFirstName() + " " + user.getLastName();
        if (!comment.getUsername().equals(expectedUsername)) {
            throw new Exception("Username does not match user");
        }

        // If this is a reply, verify parent comment exists
        if (comment.getParentId() != null && !comment.getParentId().isEmpty()) {
            logger.info("This is a reply to comment: {}", comment.getParentId());
            Optional<CommentModel> parentComment = commentRepository.findById(comment.getParentId());
            if (!parentComment.isPresent()) {
                throw new Exception("Parent comment not found");
            }
            logger.info("Found parent comment: id={}, userId={}", 
                parentComment.get().getId(), parentComment.get().getUserId());
        }

        // Save the comment first to get its ID
        CommentModel savedComment = commentRepository.save(comment);
        logger.info("Comment saved successfully: id={}", savedComment.getId());

        // Create notification after saving the comment
        if (comment.getParentId() != null && !comment.getParentId().isEmpty()) {
            Optional<CommentModel> parentComment = commentRepository.findById(comment.getParentId());
            if (parentComment.isPresent()) {
                String message = String.format("%s replied to your comment", comment.getUsername());
                logger.info("Creating notification for user {}: {}", parentComment.get().getUserId(), message);
                try {
                    // Log the user IDs for debugging
                    logger.info("Comment user ID: {}", comment.getUserId());
                    logger.info("Parent comment user ID: {}", parentComment.get().getUserId());
                    
                    NotificationModel notification = notificationService.createNotification(
                        parentComment.get().getUserId(),
                        "COMMENT_REPLY",
                        message,
                        savedComment.getId()
                    );
                    logger.info("Notification created successfully: id={}, userId={}, message={}", 
                        notification.getId(), notification.getUserId(), notification.getMessage());
                } catch (Exception e) {
                    logger.error("Failed to create notification: {}", e.getMessage(), e);
                }
            }
        }

        return savedComment;
    }

    public List<CommentModel> getCommentsByPostId(String postId) throws Exception {
        if (postId == null || postId.isEmpty()) {
            throw new Exception("Post ID is required");
        }
        // Get all comments for the post
        List<CommentModel> allComments = commentRepository.findByPostId(postId);
        
        // Filter out replies and organize them under their parent comments
        List<CommentModel> parentComments = allComments.stream()
            .filter(comment -> comment.getParentId() == null || comment.getParentId().isEmpty())
            .toList();

        // Add replies to their parent comments
        for (CommentModel parent : parentComments) {
            List<CommentModel> replies = allComments.stream()
                .filter(comment -> parent.getId().equals(comment.getParentId()))
                .toList();
            parent.setReplies(replies);
        }

        return parentComments;
    }

    public CommentModel updateComment(String id, CommentModel updates, String userEmail) throws Exception {
        CommentModel comment = commentRepository.findById(id)
            .orElseThrow(() -> new Exception("Comment not found"));

        if (!comment.getUserId().equals(userEmail)) {
            throw new Exception("Unauthorized: Only the comment owner can update it");
        }

        if (updates.getText() == null || updates.getText().isEmpty()) {
            throw new Exception("Comment text is required");
        }

        // Only allow updating the text
        comment.setText(updates.getText());
        return commentRepository.save(comment);
    }

    public void deleteComment(String id, String userId) throws Exception {
        CommentModel comment = commentRepository.findById(id)
            .orElseThrow(() -> new Exception("Comment not found"));

        // Only allow the comment's owner to delete it
        if (!comment.getUserId().equals(userId)) {
            throw new Exception("Unauthorized: Only the comment owner can delete it");
        }

        // Delete all replies to this comment
        List<CommentModel> replies = commentRepository.findByPostId(comment.getPostId()).stream()
            .filter(c -> id.equals(c.getParentId()))
            .toList();
        
        for (CommentModel reply : replies) {
            commentRepository.deleteById(reply.getId());
        }

        commentRepository.deleteById(id);
    }
}