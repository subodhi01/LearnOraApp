package com.learnora.backend.service;

import com.learnora.backend.model.CommentModel;
import com.learnora.backend.model.UserModel;
import com.learnora.backend.model.LearningPlanModel;
import com.learnora.backend.repository.CommentRepository;
import com.learnora.backend.repository.UserRepository;
import com.learnora.backend.repository.LearningPlanRepository;
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

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    public CommentModel createComment(CommentModel comment) throws Exception {
        logger.info("Creating comment: postId={}, userId={}, username={}, parentId={}", 
            comment.getPostId(), comment.getUserId(), comment.getUsername(), comment.getParentId());

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

        comment.setCreatedAt(java.time.LocalDateTime.now());

        UserModel user = userRepository.findByEmail(comment.getUserId())
            .orElseThrow(() -> new Exception("User not found"));
        logger.info("Found user: email={}, name={}", user.getEmail(), user.getFirstName() + " " + user.getLastName());

        String expectedUsername = user.getFirstName() + " " + user.getLastName();
        if (!comment.getUsername().equals(expectedUsername)) {
            throw new Exception("Username does not match user");
        }

        if (comment.getParentId() != null && !comment.getParentId().isEmpty()) {
            logger.info("This is a reply to comment: {}", comment.getParentId());
            Optional<CommentModel> parentComment = commentRepository.findById(comment.getParentId());
            if (!parentComment.isPresent()) {
                throw new Exception("Parent comment not found");
            }
            logger.info("Found parent comment: id={}, userId={}", 
                parentComment.get().getId(), parentComment.get().getUserId());
        }

        CommentModel savedComment = commentRepository.save(comment);
        logger.info("Comment saved successfully: id={}", savedComment.getId());

        LearningPlanModel plan = learningPlanRepository.findById(comment.getPostId())
            .orElseThrow(() -> new Exception("Learning plan not found"));

        try {
            if (comment.getParentId() != null && !comment.getParentId().isEmpty()) {
                Optional<CommentModel> parentComment = commentRepository.findById(comment.getParentId());
                if (parentComment.isPresent() && !parentComment.get().getUserId().equals(comment.getUserId())) {
                    String message = String.format("%s replied to your comment", comment.getUsername());
                    logger.info("Creating notification for user {}: {}", parentComment.get().getUserId(), message);
                    
                    notificationService.createNotification(
                        parentComment.get().getUserId(),
                        "COMMENT_REPLY",
                        message,
                        savedComment.getId(),
                        comment.getPostId()
                    );
                    logger.info("Reply notification created successfully");
                }
            }

            if (!plan.getUserEmail().equals(comment.getUserId())) {
                String message = String.format("%s commented on your course '%s': %s", 
                    comment.getUsername(),
                    plan.getTitle(),
                    comment.getText().length() > 50 ? comment.getText().substring(0, 47) + "..." : comment.getText());
                
                logger.info("Creating notification for course owner {}: {}", plan.getUserEmail(), message);
                
                notificationService.createNotification(
                    plan.getUserEmail(),
                    "COURSE_COMMENT",
                    message,
                    savedComment.getId(),
                    plan.getId()
                );
                logger.info("Course owner notification created successfully");
            }
        } catch (Exception e) {
            logger.error("Failed to create notifications: {}", e.getMessage(), e);
        }

        return savedComment;
    }

    public List<CommentModel> getCommentsByPostId(String postId, String userEmail) throws Exception {
        if (postId == null || postId.isEmpty()) {
            throw new Exception("Post ID is required");
        }

        LearningPlanModel plan = learningPlanRepository.findById(postId)
            .orElseThrow(() -> new Exception("Learning plan not found"));

        boolean isCourseOwner = plan.getUserEmail().equals(userEmail);

        List<CommentModel> allComments = commentRepository.findByPostId(postId);
        
        if (!isCourseOwner) {
            allComments = allComments.stream()
                .filter(comment -> !comment.isHidden())
                .toList();
        }
        
        List<CommentModel> parentComments = allComments.stream()
            .filter(comment -> comment.getParentId() == null || comment.getParentId().isEmpty())
            .toList();

        for (CommentModel parent : parentComments) {
            buildCommentTree(parent, allComments);
        }

        return parentComments;
    }

    private void buildCommentTree(CommentModel comment, List<CommentModel> allComments) {
        List<CommentModel> replies = allComments.stream()
            .filter(c -> comment.getId().equals(c.getParentId()))
            .toList();
        
        comment.setReplies(replies);
        
        for (CommentModel reply : replies) {
            buildCommentTree(reply, allComments);
        }
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

        comment.setText(updates.getText());
        return commentRepository.save(comment);
    }

    public void deleteComment(String id, String userId) throws Exception {
        CommentModel comment = commentRepository.findById(id)
            .orElseThrow(() -> new Exception("Comment not found"));

        LearningPlanModel plan = learningPlanRepository.findById(comment.getPostId())
            .orElseThrow(() -> new Exception("Learning plan not found"));

        if (!comment.getUserId().equals(userId) && !plan.getUserEmail().equals(userId)) {
            throw new Exception("Unauthorized: Only the comment owner or course owner can delete it");
        }

        List<CommentModel> replies = commentRepository.findByPostId(comment.getPostId()).stream()
            .filter(c -> id.equals(c.getParentId()))
            .toList();
        
        for (CommentModel reply : replies) {
            commentRepository.deleteById(reply.getId());
        }

        commentRepository.deleteById(id);
    }

    public void toggleCommentVisibility(String id, String userId) throws Exception {
        CommentModel comment = commentRepository.findById(id)
            .orElseThrow(() -> new Exception("Comment not found"));

        LearningPlanModel plan = learningPlanRepository.findById(comment.getPostId())
            .orElseThrow(() -> new Exception("Learning plan not found"));

        if (!plan.getUserEmail().equals(userId)) {
            throw new Exception("Unauthorized: Only the course owner can hide/unhide comments");
        }

        comment.setHidden(!comment.isHidden());
        commentRepository.save(comment);
    }
}